import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from './config/database';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// JWT secret
const JWT_SECRET = 'fitlife-gym-manager-secret-key-2024';

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, role, name } = req.body;

  if (!email || !password || !role || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM profiles WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO profiles (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role, name',
      [name, email, hashedPassword, role]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user });
  } catch (error) {
    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Protected routes
app.get('/api/profiles', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.email, p.role, p.status, p.created_at, p.updated_at
      FROM profiles p
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/profiles', authenticateToken, async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Get role ID from role name
    const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [role]);
    if (roleResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const roleId = roleResult.rows[0].id;

    // Create the user
    const result = await pool.query(
      `INSERT INTO profiles (name, email, password, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, role, status, created_at`,
      [name, email, hashedPassword, role, 'active']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/profiles/:id', authenticateToken, async (req, res) => {
  const { name, role, status } = req.body;
  const userId = req.params.id;

  try {
    // Get role ID from role name if role is provided
    let roleId = null;
    if (role) {
      const roleResult = await pool.query('SELECT id FROM roles WHERE name = $1', [role]);
      if (roleResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      roleId = roleResult.rows[0].id;
    }

    // Update the user
    const result = await pool.query(
      `UPDATE profiles 
       SET name = COALESCE($1, name), 
           role = COALESCE($2, role), 
           status = COALESCE($3, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING id, name, email, role, status, updated_at`,
      [name, role, status, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/roles', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM roles');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/members', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, p.name as plan_name, p.price as plan_price
      FROM members m
      LEFT JOIN plans p ON m.plan_id = p.id
      WHERE m.status = 'active'
      ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/members/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, p.name as plan_name, p.price as plan_price, p.duration_days
      FROM members m
      LEFT JOIN plans p ON m.plan_id = p.id
      WHERE m.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/members/:id', authenticateToken, async (req, res) => {
  const { name, email, phone, plan_id, status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE members 
       SET name = $1, email = $2, phone = $3, plan_id = $4, status = $5
       WHERE id = $6
       RETURNING *`,
      [name, email, phone, plan_id, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/members', authenticateToken, async (req, res) => {
  const { name, email, phone, plan_id, join_date } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO members (name, email, phone, plan_id, join_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, email, phone, plan_id, join_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/schedules', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes ORDER BY day_of_week, start_time');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/settings', authenticateToken, async (req, res) => {
  try {
    const [settings, notificationSettings] = await Promise.all([
      pool.query('SELECT * FROM settings LIMIT 1'),
      pool.query('SELECT * FROM notification_settings LIMIT 1')
    ]);

    res.json({
      ...settings.rows[0],
      notifications: notificationSettings.rows[0]
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard endpoints
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const [
      membersCount,
      activeMembersCount,
      todayCheckins,
      monthlyRevenue,
      previousMonthMembersCount,
      previousMonthActiveMembersCount,
      previousMonthCheckins,
      previousMonthRevenue
    ] = await Promise.all([
      // Current month stats
      pool.query('SELECT COUNT(*) FROM members'),
      pool.query('SELECT COUNT(*) FROM members WHERE status = $1', ['Ativo']),
      pool.query(`
        SELECT COUNT(*) 
        FROM checkins 
        WHERE DATE(check_time AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Maputo') = CURRENT_DATE
      `),
      pool.query(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM payments
        WHERE status = 'Pago'
        AND payment_date >= DATE_TRUNC('month', CURRENT_DATE)
        AND payment_date < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
      `),
      // Previous month stats
      pool.query(`
        SELECT COUNT(*) 
        FROM members 
        WHERE created_at < DATE_TRUNC('month', CURRENT_DATE)
      `),
      pool.query(`
        SELECT COUNT(*) 
        FROM members 
        WHERE status = 'Ativo' 
        AND created_at < DATE_TRUNC('month', CURRENT_DATE)
      `),
      pool.query(`
        SELECT COUNT(*) 
        FROM checkins 
        WHERE DATE(check_time AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Maputo') = CURRENT_DATE - INTERVAL '1 month'
      `),
      pool.query(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM payments
        WHERE status = 'Pago'
        AND payment_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        AND payment_date < DATE_TRUNC('month', CURRENT_DATE)
      `)
    ]);

    // Calculate percentages
    const calculatePercentage = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const totalMembers = parseInt(membersCount.rows[0].count);
    const activeMembers = parseInt(activeMembersCount.rows[0].count);
    const todayCheckinsCount = parseInt(todayCheckins.rows[0].count);
    const currentMonthRevenue = parseFloat(monthlyRevenue.rows[0].total);
    
    const prevTotalMembers = parseInt(previousMonthMembersCount.rows[0].count);
    const prevActiveMembers = parseInt(previousMonthActiveMembersCount.rows[0].count);
    const prevTodayCheckins = parseInt(previousMonthCheckins.rows[0].count);
    const prevMonthRevenue = parseFloat(previousMonthRevenue.rows[0].total);

    res.json({
      totalMembers,
      activeMembers,
      todayCheckins: todayCheckinsCount,
      monthlyRevenue: currentMonthRevenue,
      comparisons: {
        totalMembers: {
          value: calculatePercentage(totalMembers, prevTotalMembers),
          isPositive: totalMembers >= prevTotalMembers
        },
        activeMembers: {
          value: calculatePercentage(activeMembers, prevActiveMembers),
          isPositive: activeMembers >= prevActiveMembers
        },
        todayCheckins: {
          value: calculatePercentage(todayCheckinsCount, prevTodayCheckins),
          isPositive: todayCheckinsCount >= prevTodayCheckins
        },
        monthlyRevenue: {
          value: calculatePercentage(currentMonthRevenue, prevMonthRevenue),
          isPositive: currentMonthRevenue >= prevMonthRevenue
        }
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Plans endpoints
app.get('/api/plans', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM plans 
      WHERE is_active = true 
      ORDER BY price ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/plans', authenticateToken, async (req, res) => {
  const { name, description, price, duration_days, is_active } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO plans (name, description, price, duration_days, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, price, duration_days, is_active]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/plans/:id', authenticateToken, async (req, res) => {
  const { name, description, price, duration_days, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE plans 
       SET name = $1, description = $2, price = $3, duration_days = $4, is_active = $5
       WHERE id = $6
       RETURNING *`,
      [name, description, price, duration_days, is_active, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/plans/:id/toggle', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE plans 
       SET is_active = NOT is_active
       WHERE id = $1
       RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error toggling plan status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Payments endpoints
app.get('/api/payments', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, m.name as member_name, m.plan_id
      FROM payments p
      LEFT JOIN members m ON p.member_id = m.id
      ORDER BY p.payment_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Função para gerar referência de pagamento
async function generatePaymentReference(format: string): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  // Buscar o último número sequencial do dia
  const result = await pool.query(
    `SELECT reference_id FROM payments 
     WHERE DATE(created_at) = CURRENT_DATE 
     ORDER BY created_at DESC LIMIT 1`
  );

  let sequence = 1;
  if (result.rows.length > 0) {
    const lastRef = result.rows[0].reference_id;
    const match = lastRef.match(/\d+$/);
    if (match) {
      sequence = parseInt(match[0]) + 1;
    }
  }

  // Substituir as variáveis no formato
  return format
    .replace('{YYYY}', year.toString())
    .replace('{MM}', month)
    .replace('{DD}', day)
    .replace('{XXXX}', sequence.toString().padStart(4, '0'));
}

app.post('/api/payments', authenticateToken, async (req, res) => {
  const { member_id, plan_id, amount, payment_date, method, status } = req.body;

  console.log('Received payment data:', { member_id, plan_id, amount, payment_date, method, status });

  try {
    // Verificar se o membro existe
    const memberResult = await pool.query('SELECT * FROM members WHERE id = $1', [member_id]);
    if (memberResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Verificar se o plano existe
    console.log('Checking plan with ID:', plan_id);
    const planResult = await pool.query('SELECT * FROM plans WHERE id = $1', [plan_id]);
    console.log('Plan query result:', planResult.rows);
    
    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const plan = planResult.rows[0];

    // Buscar o formato de referência das configurações
    const settingsResult = await pool.query('SELECT payment_reference_format FROM settings WHERE id = 1');
    const referenceFormat = settingsResult.rows[0]?.payment_reference_format || 'PAY-{YYYY}-{MM}-{DD}-{XXXX}';

    // Gerar referência do pagamento
    const reference_id = await generatePaymentReference(referenceFormat);

    // Criar o pagamento
    const result = await pool.query(
      `INSERT INTO payments (member_id, plan, amount, payment_date, method, status, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [member_id, plan.name, amount, payment_date, method, status, reference_id]
    );

    // Se o pagamento foi bem sucedido, atualizar a data de expiração do plano do membro
    if (status === 'Pago') {
      const expirationDate = new Date(payment_date);
      expirationDate.setDate(expirationDate.getDate() + plan.duration_days);

      await pool.query(
        `UPDATE members 
         SET plan_id = $1,
             plan = $2,
             end_date = $3
         WHERE id = $4`,
        [plan_id, plan.name, expirationDate, member_id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/payments/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        m.name as member_name,
        m.email as member_email,
        m.phone as member_phone,
        p.plan as plan_name,
        p.method as payment_method
      FROM payments p
      LEFT JOIN members m ON p.member_id = m.id
      WHERE p.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/payments/:id', authenticateToken, async (req, res) => {
  const { status, amount, payment_date, method } = req.body;
  try {
    const result = await pool.query(
      `UPDATE payments 
       SET status = $1, amount = $2, payment_date = $3, method = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [status, amount, payment_date, method, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Schedules endpoints
app.post('/api/schedules', authenticateToken, async (req, res) => {
  const { title, instructor, day_of_week, start_time, end_time, max_participants, color } = req.body;
  
  // Validate and format color code
  let formattedColor = color;
  if (color) {
    // Remove any non-hex characters and ensure it starts with #
    formattedColor = color.replace(/[^0-9A-Fa-f]/g, '');
    if (formattedColor.length === 6) {
      formattedColor = '#' + formattedColor;
    } else {
      formattedColor = '#000000'; // Default to black if invalid
    }
  } else {
    formattedColor = '#000000'; // Default to black if not provided
  }

  try {
    const result = await pool.query(
      `INSERT INTO classes (title, instructor, day_of_week, start_time, end_time, max_participants, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, instructor, day_of_week, start_time, end_time, max_participants, formattedColor]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/schedules/:id', authenticateToken, async (req, res) => {
  const { title, instructor, day_of_week, start_time, end_time, max_participants, color } = req.body;
  
  // Validate and format color code
  let formattedColor = color;
  if (color) {
    // Remove any non-hex characters and ensure it starts with #
    formattedColor = color.replace(/[^0-9A-Fa-f]/g, '');
    if (formattedColor.length === 6) {
      formattedColor = '#' + formattedColor;
    } else {
      formattedColor = '#000000'; // Default to black if invalid
    }
  } else {
    formattedColor = '#000000'; // Default to black if not provided
  }

  try {
    const result = await pool.query(
      `UPDATE classes 
       SET title = $1, instructor = $2, day_of_week = $3, 
           start_time = $4, end_time = $5, max_participants = $6, color = $7
       WHERE id = $8
       RETURNING *`,
      [title, instructor, day_of_week, start_time, end_time, max_participants, formattedColor, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/schedules/reservations', authenticateToken, async (req, res) => {
  const { member_id, class_id, reservation_date } = req.body;
  try {
    // Check if class exists and has capacity
    const classResult = await pool.query(
      `SELECT c.*, COUNT(r.id) as current_reservations
       FROM classes c
       LEFT JOIN reservations r ON r.class_id = c.id AND r.reservation_date = $1
       WHERE c.id = $2
       GROUP BY c.id`,
      [reservation_date, class_id]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const classData = classResult.rows[0];
    if (classData.current_reservations >= classData.max_participants) {
      return res.status(400).json({ error: 'Class is full' });
    }

    // Check if member already has a reservation for this class
    const existingReservation = await pool.query(
      `SELECT * FROM reservations 
       WHERE member_id = $1 AND class_id = $2 AND reservation_date = $3`,
      [member_id, class_id, reservation_date]
    );

    if (existingReservation.rows.length > 0) {
      return res.status(400).json({ error: 'Member already has a reservation for this class' });
    }

    // Create the reservation
    const result = await pool.query(
      `INSERT INTO reservations (member_id, class_id, reservation_date)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [member_id, class_id, reservation_date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Workouts endpoints
app.get('/api/workouts', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT w.*, 
             json_agg(json_build_object(
               'id', e.id,
               'name', e.name,
               'muscle_group', e.muscle_group,
               'description', e.description,
               'sets', we.sets,
               'reps', we.reps
             )) as exercises
      FROM workouts w
      LEFT JOIN workout_exercises we ON w.id = we.workout_id
      LEFT JOIN exercises e ON we.exercise_id = e.id
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/workouts', authenticateToken, async (req, res) => {
  const { name, description, exercises } = req.body;

  if (!Array.isArray(exercises)) {
    return res.status(400).json({ error: 'O campo exercises deve ser um array.' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const workoutResult = await client.query(
        'INSERT INTO workouts (name, description) VALUES ($1, $2) RETURNING *',
        [name, description]
      );

      const workout = workoutResult.rows[0];

      for (const exercise of exercises) {
        await client.query(
          `INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps)
           VALUES ($1, $2, $3, $4)`,
          [workout.id, exercise.exercise_id || exercise.id, exercise.sets, exercise.reps]
        );
      }

      await client.query('COMMIT');
      res.status(201).json(workout);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating workout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/workouts/:id', authenticateToken, async (req, res) => {
  try {
    const workoutResult = await pool.query(
      'SELECT * FROM workouts WHERE id = $1',
      [req.params.id]
    );

    if (workoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const workout = workoutResult.rows[0];

    const exercisesResult = await pool.query(
      `SELECT we.*, e.name, e.muscle_group, e.description
       FROM workout_exercises we
       JOIN exercises e ON we.exercise_id = e.id
       WHERE we.workout_id = $1`,
      [req.params.id]
    );

    workout.workout_exercises = exercisesResult.rows.map(row => ({
      id: row.id,
      sets: row.sets,
      reps: row.reps,
      exercises: {
        id: row.exercise_id,
        name: row.name,
        muscle_group: row.muscle_group,
        description: row.description
      }
    }));

    res.json(workout);
  } catch (error) {
    console.error('Error fetching workout details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/workouts/:id/exercises', authenticateToken, async (req, res) => {
  const workoutId = req.params.id;
  const { exercise_id, sets, reps } = req.body;

  try {
    // First check if the workout exists
    const workoutResult = await pool.query(
      'SELECT * FROM workouts WHERE id = $1',
      [workoutId]
    );

    if (workoutResult.rows.length === 0) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    // Check if the exercise exists
    const exerciseResult = await pool.query(
      'SELECT * FROM exercises WHERE id = $1',
      [exercise_id]
    );

    if (exerciseResult.rows.length === 0) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    // Add the exercise to the workout
    const result = await pool.query(
      `INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [workoutId, exercise_id, sets, reps]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding exercise to workout:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check-in endpoints
app.get('/api/checkin', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, m.name as member_name, m.plan, m.status as member_status
      FROM checkins c
      JOIN members m ON c.member_id = m.id
      ORDER BY c.check_time DESC
      LIMIT 20
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching check-ins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/checkin/today', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, m.name as member_name, m.plan, m.status as member_status
      FROM checkins c
      JOIN members m ON c.member_id = m.id
      WHERE DATE(c.check_time AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Maputo') = CURRENT_DATE
      ORDER BY c.check_time DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching today\'s check-ins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/checkin', authenticateToken, async (req, res) => {
  const { member_id, check_type } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO checkins (member_id, check_type, check_time)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       RETURNING *`,
      [member_id, check_type]
    );

    // Get member information
    const memberResult = await pool.query(
      'SELECT name, plan, status FROM members WHERE id = $1',
      [member_id]
    );

    const checkIn = result.rows[0];
    if (memberResult.rows.length > 0) {
      checkIn.member_name = memberResult.rows[0].name;
      checkIn.plan = memberResult.rows[0].plan;
      checkIn.member_status = memberResult.rows[0].status;
    }

    res.status(201).json(checkIn);
  } catch (error) {
    console.error('Error recording check-in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Settings endpoints
app.put('/api/settings', authenticateToken, async (req, res) => {
  const {
    gym_name,
    address,
    phone,
    email,
    website,
    logo_url,
    description,
    business_hours,
    mpesa_enabled,
    mpesa_number,
    emola_enabled,
    emola_number,
    netshop_enabled,
    netshop_id,
    cash_enabled,
    payment_reminder_days,
    auto_backup,
    payment_reference_format,
    notifications
  } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE settings SET
         gym_name = $1,
         address = $2,
         phone = $3,
         email = $4,
         website = $5,
         logo_url = $6,
         description = $7,
         business_hours = $8,
         mpesa_enabled = $9,
         mpesa_number = $10,
         emola_enabled = $11,
         emola_number = $12,
         netshop_enabled = $13,
         netshop_id = $14,
         cash_enabled = $15,
         payment_reminder_days = $16,
         auto_backup = $17,
         payment_reference_format = $18,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = 1`,
        [
          gym_name,
          address,
          phone,
          email,
          website,
          logo_url,
          description,
          business_hours,
          mpesa_enabled,
          mpesa_number,
          emola_enabled,
          emola_number,
          netshop_enabled,
          netshop_id,
          cash_enabled,
          payment_reminder_days,
          auto_backup,
          payment_reference_format
        ]
      );

      // Update notification settings if provided
      if (notifications) {
        await client.query(
          `UPDATE notification_settings SET
           email_notifications = $1,
           sms_notifications = $2,
           payment_reminders = $3,
           class_reminders = $4,
           marketing_messages = $5,
           updated_at = CURRENT_TIMESTAMP
           WHERE id = 1`,
          [
            notifications.email_notifications,
            notifications.sms_notifications,
            notifications.payment_reminders,
            notifications.class_reminders,
            notifications.marketing_messages
          ]
        );
      }

      await client.query('COMMIT');
      res.json({ message: 'Settings updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Exercises endpoints
app.get('/api/exercises', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM exercises ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/exercises', authenticateToken, async (req, res) => {
  const { name, muscle_group, description } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO exercises (name, muscle_group, description) VALUES ($1, $2, $3) RETURNING *',
      [name, muscle_group, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating exercise:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post('/api/roles', authenticateToken, async (req, res) => {
  const { name, description, permissions } = req.body;
  if (!name || !permissions) {
    return res.status(400).json({ error: 'Name and permissions are required' });
  }
  try {
    // Verifica se já existe uma role com esse nome
    const existing = await pool.query('SELECT id FROM roles WHERE name = $1', [name]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Role with this name already exists' });
    }
    // Insere a nova role
    const result = await pool.query(
      'INSERT INTO roles (name, description, permissions) VALUES ($1, $2, $3) RETURNING *',
      [name, description || '', JSON.stringify(permissions)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/settings/notifications', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notification_settings LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/settings/notifications', authenticateToken, async (req, res) => {
  const { email_notifications, sms_notifications, payment_reminders, class_reminders, marketing_messages } = req.body;

  try {
    const result = await pool.query(
      `UPDATE notification_settings SET
       email_notifications = $1,
       sms_notifications = $2,
       payment_reminders = $3,
       class_reminders = $4,
       marketing_messages = $5,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = 1
       RETURNING *`,
      [email_notifications, sms_notifications, payment_reminders, class_reminders, marketing_messages]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification settings not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Backup and export endpoints
app.post('/api/backup', authenticateToken, async (req, res) => {
  try {
    // Get all data from all tables
    const [
      profiles,
      members,
      plans,
      payments,
      classes,
      reservations,
      exercises,
      workouts,
      workout_exercises,
      member_workouts,
      checkins,
      settings,
      notification_settings,
      roles
    ] = await Promise.all([
      pool.query('SELECT * FROM profiles'),
      pool.query('SELECT * FROM members'),
      pool.query('SELECT * FROM plans'),
      pool.query('SELECT * FROM payments'),
      pool.query('SELECT * FROM classes'),
      pool.query('SELECT * FROM reservations'),
      pool.query('SELECT * FROM exercises'),
      pool.query('SELECT * FROM workouts'),
      pool.query('SELECT * FROM workout_exercises'),
      pool.query('SELECT * FROM member_workouts'),
      pool.query('SELECT * FROM checkins'),
      pool.query('SELECT * FROM settings'),
      pool.query('SELECT * FROM notification_settings'),
      pool.query('SELECT * FROM roles')
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        profiles: profiles.rows,
        members: members.rows,
        plans: plans.rows,
        payments: payments.rows,
        classes: classes.rows,
        reservations: reservations.rows,
        exercises: exercises.rows,
        workouts: workouts.rows,
        workout_exercises: workout_exercises.rows,
        member_workouts: member_workouts.rows,
        checkins: checkins.rows,
        settings: settings.rows,
        notification_settings: notification_settings.rows,
        roles: roles.rows
      }
    };

    res.json({
      success: true,
      message: 'Backup created successfully',
      data: backupData
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/export', authenticateToken, async (req, res) => {
  const { format = 'json' } = req.body;

  try {
    // Get all data from all tables
    const [
      profiles,
      members,
      plans,
      payments,
      classes,
      reservations,
      exercises,
      workouts,
      workout_exercises,
      member_workouts,
      checkins,
      settings,
      notification_settings,
      roles
    ] = await Promise.all([
      pool.query('SELECT * FROM profiles'),
      pool.query('SELECT * FROM members'),
      pool.query('SELECT * FROM plans'),
      pool.query('SELECT * FROM payments'),
      pool.query('SELECT * FROM classes'),
      pool.query('SELECT * FROM reservations'),
      pool.query('SELECT * FROM exercises'),
      pool.query('SELECT * FROM workouts'),
      pool.query('SELECT * FROM workout_exercises'),
      pool.query('SELECT * FROM member_workouts'),
      pool.query('SELECT * FROM checkins'),
      pool.query('SELECT * FROM settings'),
      pool.query('SELECT * FROM notification_settings'),
      pool.query('SELECT * FROM roles')
    ]);

    const exportData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        profiles: profiles.rows,
        members: members.rows,
        plans: plans.rows,
        payments: payments.rows,
        classes: classes.rows,
        reservations: reservations.rows,
        exercises: exercises.rows,
        workouts: workouts.rows,
        workout_exercises: workout_exercises.rows,
        member_workouts: member_workouts.rows,
        checkins: checkins.rows,
        settings: settings.rows,
        notification_settings: notification_settings.rows,
        roles: roles.rows
      }
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(exportData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=fitlife-export-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvData);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=fitlife-export-${new Date().toISOString().split('T')[0]}.json`);
      res.json(exportData);
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data: any): string {
  const csvRows = [];
  
  // Add headers
  csvRows.push(['Table', 'Data']);
  
  // Add data
  Object.entries(data.data).forEach(([tableName, tableData]) => {
    if (Array.isArray(tableData) && tableData.length > 0) {
      const headers = Object.keys(tableData[0]);
      csvRows.push([tableName, headers.join(',')]);
      
      tableData.forEach((row: any) => {
        const values = headers.map(header => {
          const value = row[header];
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
        });
        csvRows.push(['', values.join(',')]);
      });
    }
  });
  
  return csvRows.map(row => row.join(',')).join('\n');
} 