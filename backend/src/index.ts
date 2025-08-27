import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from './config/database';
import { readFileSync } from 'fs';
import { join } from 'path';
import { env, validateEnv } from './config/env';

// Validate environment variables
validateEnv();

const app = express();

// CORS configuration
const corsOptions = {
  origin: env.ALLOWED_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
if (env.ENABLE_CORS) {
  app.use(cors(corsOptions));
}
app.use(express.json());

// Health endpoints
app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not_ready' });
  }
});

// Helper function to validate UUID format
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

// Middleware to validate UUID parameters
const validateUUIDs = (req: any, res: any, next: any) => {
  console.log(`🔍 UUID Validation - Path: ${req.path}, Method: ${req.method}, Params:`, req.params);
  
  // Check member ID in path
  if (req.params.id && req.path.includes('/members/')) {
    console.log(`Checking member ID: ${req.params.id}`);
    if (!isValidUUID(req.params.id)) {
      console.log(`❌ Invalid member ID format: ${req.params.id}`);
      return res.status(400).json({ 
        error: 'Invalid member ID format. Expected UUID format but received: ' + req.params.id 
      });
    }
    console.log(`✅ Valid member ID: ${req.params.id}`);
  }
  
  // Check plan ID in path
  if (req.params.id && req.path.includes('/plans/')) {
    console.log(`Checking plan ID: ${req.params.id}`);
    if (!isValidUUID(req.params.id)) {
      console.log(`❌ Invalid plan ID format: ${req.params.id}`);
      return res.status(400).json({ 
        error: 'Invalid plan ID format. Expected UUID format but received: ' + req.params.id 
      });
    }
    console.log(`✅ Valid plan ID: ${req.params.id}`);
  }
  
  // Check payment ID in path
  if (req.params.id && req.path.includes('/payments/')) {
    console.log(`Checking payment ID: ${req.params.id}`);
    if (!isValidUUID(req.params.id)) {
      console.log(`❌ Invalid payment ID format: ${req.params.id}`);
      return res.status(400).json({ 
        error: 'Invalid payment ID format. Expected UUID format but received: ' + req.params.id 
      });
    }
    console.log(`✅ Valid payment ID: ${req.params.id}`);
  }
  
  // Check schedule/class ID in path
  if (req.params.id && req.path.includes('/schedules/')) {
    console.log(`Checking schedule ID: ${req.params.id}`);
    if (!isValidUUID(req.params.id)) {
      console.log(`❌ Invalid schedule ID format: ${req.params.id}`);
      return res.status(400).json({ 
        error: 'Invalid schedule ID format. Expected UUID format but received: ' + req.params.id 
      });
    }
    console.log(`✅ Valid schedule ID: ${req.params.id}`);
  }
  
  // Check UUIDs in request body
  if (req.body) {
    if (req.body.member_id && !isValidUUID(req.body.member_id)) {
      console.log(`❌ Invalid member ID in body: ${req.body.member_id}`);
      return res.status(400).json({ 
        error: 'Invalid member ID format. Expected UUID format but received: ' + req.body.member_id 
      });
    }
    
    if (req.body.plan_id && !isValidUUID(req.body.plan_id)) {
      console.log(`❌ Invalid plan ID in body: ${req.body.plan_id}`);
      return res.status(400).json({ 
        error: 'Invalid plan ID format. Expected UUID format but received: ' + req.body.plan_id 
      });
    }
    
    if (req.body.class_id && !isValidUUID(req.body.class_id)) {
      console.log(`❌ Invalid class ID in body: ${req.body.class_id}`);
      return res.status(400).json({ 
        error: 'Invalid class ID format. Expected UUID format but received: ' + req.body.class_id 
      });
    }
  }
  
  console.log(`✅ UUID validation passed for ${req.path}`);
  next();
};

// Authentication middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Auth Debug:', {
    hasAuthHeader: !!authHeader,
    authHeader: authHeader,
    hasToken: !!token,
    token: token ? `${token.substring(0, 20)}...` : 'none',
    endpoint: req.path
  });

  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, env.JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.log('❌ Invalid token:', err.message);
      return res.status(403).json({ error: 'Invalid token' });
    }
    console.log('✅ Token valid for user:', user.email);
    req.user = user;
    next();
  });
};

// Helper function to validate user exists in profiles table
const validateUserId = async (userId: string | undefined): Promise<string | null> => {
  if (!userId) return null;
  
  try {
    const userCheck = await pool.query('SELECT id FROM profiles WHERE id = $1', [userId]);
    return userCheck.rows.length > 0 ? userId : null;
  } catch (error) {
    console.error('Error validating user ID:', error);
    return null;
  }
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

    const payload = { id: user.id, email: user.email, role: user.role };
    const options: any = { expiresIn: env.JWT_EXPIRES_IN };
    const token = jwt.sign(payload, env.JWT_SECRET as string, options);

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Error signing in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Test endpoint to verify code is loaded
app.get('/api/test-uuid-validation', (req, res) => {
  console.log('🧪 Test endpoint called - code is loaded!');
  res.json({ 
    message: 'UUID validation code is loaded', 
    timestamp: new Date().toISOString(),
    testResult: isValidUUID('550e8400-e29b-41d4-a716-446655440000')
  });
});

// Test endpoint for billing without auth
app.get('/api/test-billing', (req, res) => {
  console.log('🧪 Test billing endpoint called!');
  res.json({ 
    message: 'Billing endpoint accessible',
    timestamp: new Date().toISOString()
  });
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
    const payload = { id: user.id, email: user.email, role: user.role };
    const options: any = { expiresIn: env.JWT_EXPIRES_IN };
    const token = jwt.sign(payload, env.JWT_SECRET as string, options);

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

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM profiles WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user (role is stored directly as string, not as foreign key)
    const result = await pool.query(
      `INSERT INTO profiles (name, email, password, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, role, status, created_at`,
      [name, email, hashedPassword, role, 'active']
    );

    console.log('User created successfully:', result.rows[0]);
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
    // Update the user (role is stored directly as string, not as foreign key)
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

    console.log('User updated successfully:', result.rows[0]);
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

app.get('/api/members/:id', validateUUIDs, authenticateToken, async (req, res) => {
  try {
    const memberId = req.params.id;

    const result = await pool.query(`
      SELECT m.*, p.name as plan_name, p.price as plan_price, p.duration_days
      FROM members m
      LEFT JOIN plans p ON m.plan_id = p.id
      WHERE m.id = $1
    `, [memberId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/members/:id', validateUUIDs, authenticateToken, async (req, res) => {
  const { 
    name, 
    email, 
    phone, 
    document, 
    gender, 
    plan_id, 
    status, 
    join_date, 
    end_date, 
    street, 
    city, 
    province, 
    emergency_name, 
    emergency_phone, 
    emergency_relationship, 
    fitness_goals, 
    medical_restrictions,
    nr_cartao 
  } = req.body;
  
  try {
    const memberId = req.params.id;

    // Get plan name if plan_id is provided
    let planName = null;
    if (plan_id) {
      const planResult = await pool.query('SELECT name FROM plans WHERE id = $1', [plan_id]);
      if (planResult.rows.length > 0) {
        planName = planResult.rows[0].name;
      }
    }

    const result = await pool.query(
      `UPDATE members 
       SET name = $1, email = $2, phone = $3, document = $4, gender = $5, plan_id = $6, 
           plan = $7, status = $8, join_date = $9, end_date = $10, street = $11, city = $12, 
           province = $13, emergency_name = $14, emergency_phone = $15, 
           emergency_relationship = $16, fitness_goals = $17, medical_restrictions = $18,
           nr_cartao = $19, updated_at = CURRENT_TIMESTAMP
       WHERE id = $20
       RETURNING *`,
      [
        name, 
        email, 
        phone, 
        document, 
        gender, 
        plan_id,
        planName,
        status, 
        join_date, 
        end_date, 
        street, 
        city, 
        province, 
        emergency_name, 
        emergency_phone, 
        emergency_relationship, 
        fitness_goals, 
        medical_restrictions,
        nr_cartao,
        memberId
      ]
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
  const { 
    name, 
    email, 
    phone, 
    document, 
    gender, 
    plan_id, 
    status, 
    join_date, 
    end_date, 
    street, 
    city, 
    province, 
    emergency_name, 
    emergency_phone, 
    emergency_relationship, 
    fitness_goals, 
    medical_restrictions,
    nr_cartao 
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    // Check if email already exists
    const existingMember = await pool.query('SELECT id FROM members WHERE email = $1', [email]);
    if (existingMember.rows.length > 0) {
      return res.status(400).json({ error: 'Member with this email already exists' });
    }

    // Get plan name if plan_id is provided
    let planName = null;
    if (plan_id) {
      const planResult = await pool.query('SELECT name FROM plans WHERE id = $1', [plan_id]);
      if (planResult.rows.length > 0) {
        planName = planResult.rows[0].name;
      }
    }

    const result = await pool.query(
      `INSERT INTO members (
        name, email, phone, document, gender, plan_id, plan, status, join_date, end_date,
        street, city, province, emergency_name, emergency_phone, emergency_relationship,
        fitness_goals, medical_restrictions, nr_cartao
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [
        name, 
        email, 
        phone, 
        document, 
        gender, 
        plan_id,
        planName,
        status || 'active', 
        join_date, 
        end_date,
        street, 
        city, 
        province, 
        emergency_name, 
        emergency_phone, 
        emergency_relationship,
        fitness_goals, 
        medical_restrictions,
        nr_cartao
      ]
    );
    
    console.log('Member created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating member:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Member with this email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
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

// Genders endpoints
app.get('/api/genders', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, code, name, is_active, created_at, updated_at
      FROM genders
      WHERE is_active = true
      ORDER BY name ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching genders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/genders', authenticateToken, async (req, res) => {
  const { code, name, is_active = true } = req.body;

  if (!code || !name) {
    return res.status(400).json({ error: 'Code and name are required' });
  }

  try {
    // Check if code already exists
    const existingGender = await pool.query('SELECT id FROM genders WHERE code = $1', [code]);
    if (existingGender.rows.length > 0) {
      return res.status(400).json({ error: 'Gender with this code already exists' });
    }

    const result = await pool.query(
      `INSERT INTO genders (code, name, is_active)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [code.toUpperCase(), name, is_active]
    );
    
    console.log('Gender created successfully:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating gender:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Gender with this code already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.put('/api/genders/:id', validateUUIDs, authenticateToken, async (req, res) => {
  const { code, name, is_active } = req.body;
  try {
    const genderId = req.params.id;

    const result = await pool.query(
      `UPDATE genders 
       SET code = $1, name = $2, is_active = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [code.toUpperCase(), name, is_active, genderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gender not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating gender:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/genders/:id', validateUUIDs, authenticateToken, async (req, res) => {
  try {
    const genderId = req.params.id;

    // Check if gender is being used by any members
    const membersUsingGender = await pool.query(
      'SELECT COUNT(*) as count FROM members WHERE gender = (SELECT code FROM genders WHERE id = $1)',
      [genderId]
    );

    if (parseInt(membersUsingGender.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete gender that is being used by members. Please update members first.' 
      });
    }

    const result = await pool.query(
      'DELETE FROM genders WHERE id = $1 RETURNING *',
      [genderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Gender not found' });
    }

    res.json({ message: 'Gender deleted successfully', gender: result.rows[0] });
  } catch (error) {
    console.error('Error deleting gender:', error);
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

app.put('/api/plans/:id', validateUUIDs, authenticateToken, async (req, res) => {
  const { name, description, price, duration_days, is_active } = req.body;
  try {
    const planId = req.params.id;

    const result = await pool.query(
      `UPDATE plans 
       SET name = $1, description = $2, price = $3, duration_days = $4, is_active = $5
       WHERE id = $6
       RETURNING *`,
      [name, description, price, duration_days, is_active, planId]
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

app.put('/api/plans/:id/toggle', validateUUIDs, authenticateToken, async (req, res) => {
  try {
    const planId = req.params.id;

    const result = await pool.query(
      `UPDATE plans 
       SET is_active = NOT is_active
       WHERE id = $1
       RETURNING *`,
      [planId]
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

app.post('/api/payments', validateUUIDs, authenticateToken, async (req, res) => {
  const { member_id, plan_id, amount, payment_date, method, status } = req.body;

  console.log('Received payment data:', { member_id, plan_id, amount, payment_date, method, status });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verificar se o membro existe
    const memberResult = await client.query('SELECT * FROM members WHERE id = $1', [member_id]);
    if (memberResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Member not found' });
    }

    const member = memberResult.rows[0];

    // Verificar se o plano existe
    console.log('Checking plan with ID:', plan_id);
    const planResult = await client.query('SELECT * FROM plans WHERE id = $1', [plan_id]);
    console.log('Plan query result:', planResult.rows);
    
    if (planResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Plan not found' });
    }

    const plan = planResult.rows[0];

    // Get company configuration
    const configResult = await client.query('SELECT * FROM configuracoes_empresa LIMIT 1');
    const config = configResult.rows[0];
    
    const taxaIva = config?.taxa_iva || 16.00;
    const diasVencimento = config?.dias_vencimento || 30;

    // Buscar o formato de referência das configurações
    const settingsResult = await client.query('SELECT payment_reference_format FROM settings WHERE id = 1');
    const referenceFormat = settingsResult.rows[0]?.payment_reference_format || 'PAY-{YYYY}-{MM}-{DD}-{XXXX}';

    // Gerar referência do pagamento
    const reference_id = await generatePaymentReference(referenceFormat);

    // Calculate invoice amounts
    const subtotal = parseFloat(amount);
    const valorIva = subtotal * (taxaIva / 100);
    const total = subtotal + valorIva;

    // Generate invoice number
    const numero = await getNextDocumentNumber('factura');

    // Calculate plan dates
    const planStartDate = new Date(payment_date);
    const planEndDate = new Date(payment_date);
    planEndDate.setDate(planEndDate.getDate() + plan.duration_days);

    // Calculate invoice due date
    const dataVencimento = new Date(payment_date);
    dataVencimento.setDate(dataVencimento.getDate() + diasVencimento);

    // Validate user ID
    const userId = await validateUserId((req as any).user?.id);

    // Create invoice first
    const invoiceResult = await client.query(`
      INSERT INTO facturas (
        numero, member_id, plan_id, 
        descricao_servico, preco_unitario, quantidade,
        subtotal, taxa_iva, valor_iva, total,
        data_emissao, data_vencimento, 
        plano_inicio, plano_fim,
        metodos_pagamento_aceites, estado, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *
    `, [
      numero, member_id, plan_id,
      `${plan.name} - Período: ${planStartDate.toISOString().split('T')[0]} a ${planEndDate.toISOString().split('T')[0]}`,
      subtotal, 1, subtotal, taxaIva, valorIva, total,
      payment_date, dataVencimento.toISOString().split('T')[0],
      planStartDate.toISOString().split('T')[0], planEndDate.toISOString().split('T')[0],
      JSON.stringify(['mpesa', 'emola', 'bci', 'dinheiro']),
      status === 'Pago' ? 'paga' : 'pendente', 
      userId
    ]);

    const invoice = invoiceResult.rows[0];

    // Criar o pagamento
    const paymentResult = await client.query(
      `INSERT INTO payments (member_id, plan, amount, payment_date, method, status, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [member_id, plan.name, amount, payment_date, method, status, reference_id]
    );

    let receiptResult = null;

    // If payment is completed, create receipt and update member plan
    if (status === 'Pago') {
      // Generate receipt number
      const receiptNumber = await getNextDocumentNumber('recibo');

      // Create receipt
      receiptResult = await client.query(`
        INSERT INTO recibos (
          numero, factura_id, valor_pago, metodo_pagamento,
          referencia_pagamento, descricao, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        receiptNumber, invoice.id, amount, method.toLowerCase(), 
        `PAY-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        `Pagamento de ${plan.name} - Membro: ${member.name}`,
        userId
      ]);

      // Get receipt with member data
      const receiptWithMember = await client.query(`
        SELECT r.*, m.name as member_name, m.phone as member_phone, m.email as member_email, m.nr_cartao as member_nr_cartao
        FROM recibos r
        JOIN facturas f ON r.factura_id = f.id
        JOIN members m ON f.member_id = m.id
        WHERE r.id = $1
      `, [receiptResult.rows[0].id]);

      // Update member plan dates and invoice status
      await client.query(
        `UPDATE members 
         SET plan_id = $1,
             plan = $2,
             end_date = $3,
             plano_data_inicio = $4,
             plano_data_fim = $5,
             plano_estado = 'activo',
             ultima_factura_id = $6
         WHERE id = $7`,
        [plan_id, plan.name, planEndDate, planStartDate, planEndDate, invoice.id, member_id]
      );
    } else {
      // Update member with invoice info only
      await client.query(
        'UPDATE members SET ultima_factura_id = $1 WHERE id = $2',
        [invoice.id, member_id]
      );
    }

    await client.query('COMMIT');

    const responseData = {
      payment: paymentResult.rows[0],
      invoice: invoice,
      receipt: receiptResult?.rows[0] || null,
      message: status === 'Pago' ? 
        'Pagamento processado! Fatura e recibo gerados automaticamente.' :
        'Pagamento registrado! Fatura gerada. Recibo será criado quando o pagamento for confirmado.'
    };

    console.log('Payment, invoice and receipt created successfully:', responseData);
    res.status(201).json(responseData);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.get('/api/payments/:id', validateUUIDs, authenticateToken, async (req, res) => {
  try {
    const paymentId = req.params.id;

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
    `, [paymentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/payments/:id', validateUUIDs, authenticateToken, async (req, res) => {
  const { status, amount, payment_date, method } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    const paymentId = req.params.id;

    // Get current payment to check if status is changing to "Pago"
    const currentPayment = await client.query(
      'SELECT * FROM payments WHERE id = $1',
      [paymentId]
    );

    if (currentPayment.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Payment not found' });
    }

    const oldStatus = currentPayment.rows[0].status;
    const payment = currentPayment.rows[0];

    // Update payment
    const result = await client.query(
      `UPDATE payments 
       SET status = $1, amount = $2, payment_date = $3, method = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [status, amount, payment_date, method, paymentId]
    );

    // If status changed to "Pago", generate invoice and receipt
    if (oldStatus !== 'Pago' && status === 'Pago') {
      // Validate user ID
      const userId = await validateUserId((req as any).user?.id);

      // Get member and plan info
      const memberResult = await client.query('SELECT * FROM members WHERE id = $1', [payment.member_id]);
      const planResult = await client.query('SELECT * FROM plans WHERE id = $1', [payment.plan_id]);

      if (memberResult.rows.length === 0 || planResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Member or plan not found' });
      }

      const member = memberResult.rows[0];
      const plan = planResult.rows[0];

      // Get company configuration
      const configResult = await client.query('SELECT * FROM configuracoes_empresa LIMIT 1');
      const config = configResult.rows[0];
      
      const taxaIva = config?.taxa_iva || 16.00;
      const diasVencimento = config?.dias_vencimento || 30;

      // Calculate amounts
      const subtotal = amount;
      const valorIva = subtotal * (taxaIva / 100);
      const total = subtotal + valorIva;

      // Generate invoice number
      const numero = await getNextDocumentNumber('factura');

      // Calculate dates
      const planStartDate = new Date(payment_date);
      const planEndDate = new Date(planStartDate);
      planEndDate.setDate(planEndDate.getDate() + plan.duration_days);

      const dataVencimento = new Date(payment_date);
      dataVencimento.setDate(dataVencimento.getDate() + diasVencimento);

      // Create invoice
      const invoiceResult = await client.query(`
        INSERT INTO facturas (
          numero, member_id, plan_id, 
          descricao_servico, preco_unitario, quantidade,
          subtotal, taxa_iva, valor_iva, total,
          data_emissao, data_vencimento, 
          plano_inicio, plano_fim,
          metodos_pagamento_aceites, estado, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `, [
        numero, payment.member_id, payment.plan_id,
        `${plan.name} - Período: ${planStartDate.toISOString().split('T')[0]} a ${planEndDate.toISOString().split('T')[0]}`,
        subtotal, 1, subtotal, taxaIva, valorIva, total,
        payment_date, dataVencimento.toISOString().split('T')[0],
        planStartDate.toISOString().split('T')[0], planEndDate.toISOString().split('T')[0],
        JSON.stringify(['mpesa', 'emola', 'bci', 'dinheiro']),
        'paga', userId
      ]);

      const invoice = invoiceResult.rows[0];

      // Generate receipt number
      const receiptNumber = await getNextDocumentNumber('recibo');

      // Create receipt
      const receiptResult = await client.query(`
        INSERT INTO recibos (
          numero, factura_id, valor_pago, metodo_pagamento,
          referencia_pagamento, descricao, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        receiptNumber, invoice.id, amount, method.toLowerCase(), 
        `PAY-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        `Pagamento de ${plan.name} - Membro: ${member.name}`,
        userId
      ]);

      // Get receipt with member data
      const receiptWithMember = await client.query(`
        SELECT r.*, m.name as member_name, m.phone as member_phone, m.email as member_email, m.nr_cartao as member_nr_cartao
        FROM recibos r
        JOIN facturas f ON r.factura_id = f.id
        JOIN members m ON f.member_id = m.id
        WHERE r.id = $1
      `, [receiptResult.rows[0].id]);

      // Update member's plan dates
      await client.query(`
        UPDATE members SET 
        plano_data_inicio = $1, plano_data_fim = $2, plano_estado = 'activo',
        ultima_factura_id = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `, [planStartDate.toISOString().split('T')[0], planEndDate.toISOString().split('T')[0], invoice.id, payment.member_id]);

      await client.query('COMMIT');

      // Return payment with generated documents
      res.json({
        payment: result.rows[0],
        invoice: invoice,
        receipt: receiptResult.rows[0],
        member_data: receiptWithMember.rows[0]
      });
    } else {
      await client.query('COMMIT');
      res.json(result.rows[0]);
    }

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
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

app.put('/api/schedules/:id', validateUUIDs, authenticateToken, async (req, res) => {
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
    const scheduleId = req.params.id;

    const result = await pool.query(
      `UPDATE classes 
       SET title = $1, instructor = $2, day_of_week = $3, 
           start_time = $4, end_time = $5, max_participants = $6, color = $7
       WHERE id = $8
       RETURNING *`,
      [title, instructor, day_of_week, start_time, end_time, max_participants, formattedColor, scheduleId]
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

app.post('/api/schedules/reservations', validateUUIDs, authenticateToken, async (req, res) => {
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

app.post('/api/checkin', validateUUIDs, authenticateToken, async (req, res) => {
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
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
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

// --- EXPENSES ---
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
  const { referenceNumber, category, categoryId, description, amount, currency, date, dueDate, supplierId, supplierName, paymentMethod, status, receiptUrl, taxAmount, notes, attachments, createdBy, approvedBy, approvalDate, recurring, tags } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO expenses (reference_number, category, category_id, description, amount, currency, date, due_date, supplier_id, supplier_name, payment_method, status, receipt_url, tax_amount, notes, attachments, created_by, approved_by, approval_date, recurring, tags, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [referenceNumber, category, categoryId, description, amount, currency, date, dueDate, supplierId, supplierName, paymentMethod, status, receiptUrl, taxAmount, notes, attachments, createdBy, approvedBy, approvalDate, recurring, tags]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
  const { referenceNumber, category, categoryId, description, amount, currency, date, dueDate, supplierId, supplierName, paymentMethod, status, receiptUrl, taxAmount, notes, attachments, createdBy, approvedBy, approvalDate, recurring, tags } = req.body;
  try {
    const result = await pool.query(
      `UPDATE expenses SET reference_number=$1, category=$2, category_id=$3, description=$4, amount=$5, currency=$6, date=$7, due_date=$8, supplier_id=$9, supplier_name=$10, payment_method=$11, status=$12, receipt_url=$13, tax_amount=$14, notes=$15, attachments=$16, created_by=$17, approved_by=$18, approval_date=$19, recurring=$20, tags=$21, updated_at=CURRENT_TIMESTAMP WHERE id=$22 RETURNING *`,
      [referenceNumber, category, categoryId, description, amount, currency, date, dueDate, supplierId, supplierName, paymentMethod, status, receiptUrl, taxAmount, notes, attachments, createdBy, approvedBy, approvalDate, recurring, tags, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM expenses WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- PRODUCTS ---
app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/products', authenticateToken, async (req, res) => {
  const { name, description, shortDescription, categoryId, category, price, costPrice, marginPercent, stock, minStock, maxStock, barcode, sku, images, isActive, supplierId, taxRate, weight, dimensions, tags, isFeatured } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, short_description, category_id, category, price, cost_price, margin_percent, stock, min_stock, max_stock, barcode, sku, images, is_active, supplier_id, tax_rate, weight, dimensions, tags, is_featured, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [name, description, shortDescription, categoryId, category, price, costPrice, marginPercent, stock, minStock, maxStock, barcode, sku, images, isActive, supplierId, taxRate, weight, dimensions, tags, isFeatured]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { name, description, shortDescription, categoryId, category, price, costPrice, marginPercent, stock, minStock, maxStock, barcode, sku, images, isActive, supplierId, taxRate, weight, dimensions, tags, isFeatured } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET name=$1, description=$2, short_description=$3, category_id=$4, category=$5, price=$6, cost_price=$7, margin_percent=$8, stock=$9, min_stock=$10, max_stock=$11, barcode=$12, sku=$13, images=$14, is_active=$15, supplier_id=$16, tax_rate=$17, weight=$18, dimensions=$19, tags=$20, is_featured=$21, updated_at=CURRENT_TIMESTAMP WHERE id=$22 RETURNING *`,
      [name, description, shortDescription, categoryId, category, price, costPrice, marginPercent, stock, minStock, maxStock, barcode, sku, images, isActive, supplierId, taxRate, weight, dimensions, tags, isFeatured, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- SALES ---
app.get('/api/sales', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales ORDER BY sale_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/sales/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sales WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sale not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/sales', authenticateToken, async (req, res) => {
  const { saleNumber, customerId, customerName, customerEmail, customerPhone, items, subtotal, discountAmount, discountPercent, taxAmount, total, paymentMethod, paymentStatus, saleStatus, saleDate, sellerId, sellerName, notes, receiptUrl } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO sales (sale_number, customer_id, customer_name, customer_email, customer_phone, items, subtotal, discount_amount, discount_percent, tax_amount, total, payment_method, payment_status, sale_status, sale_date, seller_id, seller_name, notes, receipt_url, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19, CURRENT_TIMESTAMP)
       RETURNING *`,
      [saleNumber, customerId, customerName, customerEmail, customerPhone, JSON.stringify(items), subtotal, discountAmount, discountPercent, taxAmount, total, paymentMethod, paymentStatus, saleStatus, saleDate, sellerId, sellerName, notes, receiptUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/sales/:id', authenticateToken, async (req, res) => {
  const { saleNumber, customerId, customerName, customerEmail, customerPhone, items, subtotal, discountAmount, discountPercent, taxAmount, total, paymentMethod, paymentStatus, saleStatus, saleDate, sellerId, sellerName, notes, receiptUrl } = req.body;
  try {
    const result = await pool.query(
      `UPDATE sales SET sale_number=$1, customer_id=$2, customer_name=$3, customer_email=$4, customer_phone=$5, items=$6, subtotal=$7, discount_amount=$8, discount_percent=$9, tax_amount=$10, total=$11, payment_method=$12, payment_status=$13, sale_status=$14, sale_date=$15, seller_id=$16, seller_name=$17, notes=$18, receipt_url=$19 WHERE id=$20 RETURNING *`,
      [saleNumber, customerId, customerName, customerEmail, customerPhone, JSON.stringify(items), subtotal, discountAmount, discountPercent, taxAmount, total, paymentMethod, paymentStatus, saleStatus, saleDate, sellerId, sellerName, notes, receiptUrl, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sale not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/sales/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM sales WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Sale not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting sale:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- DOCUMENTS ---
app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documents ORDER BY issue_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/documents', authenticateToken, async (req, res) => {
  const { type, number, prefix, saleId, customerId, customerName, customerEmail, customerAddress, customerTaxNumber, issueDate, dueDate, validUntil, items, subtotal, discountAmount, taxAmount, total, status, paymentTerms, notes, terms, parentDocumentId, issuedBy, pdfUrl, sentDate } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO documents (type, number, prefix, sale_id, customer_id, customer_name, customer_email, customer_address, customer_tax_number, issue_date, due_date, valid_until, items, subtotal, discount_amount, tax_amount, total, status, payment_terms, notes, terms, parent_document_id, issued_by, pdf_url, sent_date, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25, CURRENT_TIMESTAMP)
       RETURNING *`,
      [type, number, prefix, saleId, customerId, customerName, customerEmail, customerAddress, customerTaxNumber, issueDate, dueDate, validUntil, JSON.stringify(items), subtotal, discountAmount, taxAmount, total, status, paymentTerms, notes, terms, parentDocumentId, issuedBy, pdfUrl, sentDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/documents/:id', authenticateToken, async (req, res) => {
  const { type, number, prefix, saleId, customerId, customerName, customerEmail, customerAddress, customerTaxNumber, issueDate, dueDate, validUntil, items, subtotal, discountAmount, taxAmount, total, status, paymentTerms, notes, terms, parentDocumentId, issuedBy, pdfUrl, sentDate } = req.body;
  try {
    const result = await pool.query(
      `UPDATE documents SET type=$1, number=$2, prefix=$3, sale_id=$4, customer_id=$5, customer_name=$6, customer_email=$7, customer_address=$8, customer_tax_number=$9, issue_date=$10, due_date=$11, valid_until=$12, items=$13, subtotal=$14, discount_amount=$15, tax_amount=$16, total=$17, status=$18, payment_terms=$19, notes=$20, terms=$21, parent_document_id=$22, issued_by=$23, pdf_url=$24, sent_date=$25, updated_at=CURRENT_TIMESTAMP WHERE id=$26 RETURNING *`,
      [type, number, prefix, saleId, customerId, customerName, customerEmail, customerAddress, customerTaxNumber, issueDate, dueDate, validUntil, JSON.stringify(items), subtotal, discountAmount, taxAmount, total, status, paymentTerms, notes, terms, parentDocumentId, issuedBy, pdfUrl, sentDate, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM documents WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =============================================
// BILLING SYSTEM API ENDPOINTS
// =============================================

// Helper function to generate next document number
const getNextDocumentNumber = async (type: 'factura' | 'recibo' | 'nota_credito') => {
  try {
    const currentYear = new Date().getFullYear();
    const configResult = await pool.query('SELECT * FROM configuracoes_empresa LIMIT 1');
    let config = configResult.rows[0];
    
    if (!config) {
      // Create default config if not exists
      await pool.query('INSERT INTO configuracoes_empresa DEFAULT VALUES');
      config = (await pool.query('SELECT * FROM configuracoes_empresa LIMIT 1')).rows[0];
    }
    
    let nextNumber: number;
    let prefix: string;
    let columnName: string;
    
    switch (type) {
      case 'factura':
        nextNumber = config.proximo_numero_factura;
        prefix = 'FT';
        columnName = 'proximo_numero_factura';
        break;
      case 'recibo':
        nextNumber = config.proximo_numero_recibo;
        prefix = 'RB';
        columnName = 'proximo_numero_recibo';
        break;
      case 'nota_credito':
        nextNumber = config.proximo_numero_nota_credito;
        prefix = 'NC';
        columnName = 'proximo_numero_nota_credito';
        break;
    }
    
    // Check if year has changed
    if (config.ano_corrente !== currentYear) {
      // Reset numbering for new year
      nextNumber = 1;
      await pool.query(
        `UPDATE configuracoes_empresa SET 
         ano_corrente = $1, 
         proximo_numero_factura = 1,
         proximo_numero_recibo = 1,
         proximo_numero_nota_credito = 1`,
        [currentYear]
      );
    }
    
    const numero = `${prefix}${currentYear}${nextNumber.toString().padStart(3, '0')}`;
    
    // Update next number
    await pool.query(
      `UPDATE configuracoes_empresa SET ${columnName} = ${columnName} + 1`
    );
    
    return numero;
  } catch (error) {
    console.error('Error generating document number:', error);
    throw error;
  }
};

// Get financial dashboard data
app.get('/api/billing/dashboard', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dashboard_financeiro');
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error('Error fetching financial dashboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get company configuration
app.get('/api/billing/config', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM configuracoes_empresa LIMIT 1');
    res.json(result.rows[0] || {});
  } catch (error) {
    console.error('Error fetching company config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update company configuration
app.put('/api/billing/config', authenticateToken, async (req: any, res: any) => {
  const {
    nome_empresa, nuit, endereco, email, telefone1, telefone2,
    mpesa_number, emola_number, bci_account, bci_nib,
    taxa_iva, moeda, dias_vencimento
  } = req.body;

  try {
    const userId = await validateUserId(req.user?.id);
    
    const result = await pool.query(
      `UPDATE configuracoes_empresa SET 
       nome_empresa = $1, nuit = $2, endereco = $3, email = $4,
       telefone1 = $5, telefone2 = $6, mpesa_number = $7, emola_number = $8,
       bci_account = $9, bci_nib = $10, taxa_iva = $11, moeda = $12,
       dias_vencimento = $13, updated_at = CURRENT_TIMESTAMP, updated_by = $14
       RETURNING *`,
      [
        nome_empresa, nuit, endereco, email, telefone1, telefone2,
        mpesa_number, emola_number, bci_account, bci_nib,
        taxa_iva, moeda, dias_vencimento, userId
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating company config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all invoices with filters
app.get('/api/billing/invoices', authenticateToken, async (req, res) => {
  try {
    const {
      member_id, estado, data_inicio, data_fim,
      page = 1, limit = 50
    } = req.query;

    let whereClause = '';
    let params: any[] = [];
    let paramCount = 0;

    if (member_id) {
      whereClause += `${whereClause ? ' AND' : ' WHERE'} f.member_id = $${++paramCount}`;
      params.push(member_id);
    }

    if (estado) {
      whereClause += `${whereClause ? ' AND' : ' WHERE'} f.estado = $${++paramCount}`;
      params.push(estado);
    }

    if (data_inicio) {
      whereClause += `${whereClause ? ' AND' : ' WHERE'} f.data_emissao >= $${++paramCount}`;
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += `${whereClause ? ' AND' : ' WHERE'} f.data_emissao <= $${++paramCount}`;
      params.push(data_fim);
    }

    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit), offset);

    const query = `
      SELECT 
        f.*,
        m.name as member_name,
        m.email as member_email,
        m.phone as member_phone,
        m.nr_cartao as member_nr_cartao,
        p.name as plan_name,
        p.price as plan_price
      FROM facturas f
      JOIN members m ON f.member_id = m.id
      LEFT JOIN plans p ON f.plan_id = p.id
      ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;

    const result = await pool.query(query, params);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM facturas f ${whereClause}`;
    const countResult = await pool.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    res.json({
      data: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single invoice by ID
app.get('/api/billing/invoices/:id', authenticateToken, async (req, res) => {
  try {
    const invoiceResult = await pool.query(`
      SELECT 
        f.*,
        m.name as member_name,
        m.email as member_email,
        m.phone as member_phone,
        m.nr_cartao as member_nr_cartao,
        p.name as plan_name,
        p.price as plan_price
      FROM facturas f
      JOIN members m ON f.member_id = m.id
      LEFT JOIN plans p ON f.plan_id = p.id
      WHERE f.id = $1
    `, [req.params.id]);

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];

    // Get receipts for this invoice
    const receiptsResult = await pool.query(
      'SELECT * FROM recibos WHERE factura_id = $1 ORDER BY data_pagamento DESC',
      [req.params.id]
    );

    // Get credit notes for this invoice
    const creditNotesResult = await pool.query(
      'SELECT * FROM notas_credito WHERE factura_id = $1 ORDER BY data_emissao DESC',
      [req.params.id]
    );

    invoice.receipts = receiptsResult.rows;
    invoice.credit_notes = creditNotesResult.rows;

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new invoice
app.post('/api/billing/invoices', authenticateToken, async (req: any, res: any) => {
  const {
    member_id, plan_id, descricao_servico, preco_unitario,
    quantidade = 1, plano_inicio, plano_fim,
    metodos_pagamento_aceites = ['mpesa', 'emola', 'bci', 'dinheiro']
  } = req.body;

  if (!member_id || !descricao_servico || !preco_unitario) {
    return res.status(400).json({ 
      error: 'Member ID, service description and unit price are required' 
    });
  }

  try {
    // Get company configuration for IVA rate and due days
    const configResult = await pool.query('SELECT * FROM configuracoes_empresa LIMIT 1');
    const config = configResult.rows[0];
    
    const taxaIva = config?.taxa_iva || 16.00;
    const diasVencimento = config?.dias_vencimento || 30;

    // Calculate amounts
    const subtotal = preco_unitario * quantidade;
    const valorIva = subtotal * (taxaIva / 100);
    const total = subtotal + valorIva;

    // Generate invoice number
    const numero = await getNextDocumentNumber('factura');

    // Calculate due date
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + diasVencimento);

    // Validate user ID
    const userId = await validateUserId(req.user?.id);

    const result = await pool.query(`
      INSERT INTO facturas (
        numero, member_id, plan_id, descricao_servico, preco_unitario,
        quantidade, subtotal, taxa_iva, valor_iva, total,
        data_vencimento, metodos_pagamento_aceites, plano_inicio, plano_fim,
        created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      numero, member_id, plan_id, descricao_servico, preco_unitario,
      quantidade, subtotal, taxaIva, valorIva, total,
      dataVencimento.toISOString().split('T')[0],
      JSON.stringify(metodos_pagamento_aceites),
      plano_inicio, plano_fim, userId
    ]);

    // Update member's last invoice
    await pool.query(
      'UPDATE members SET ultima_factura_id = $1 WHERE id = $2',
      [result.rows[0].id, member_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all receipts
app.get('/api/billing/receipts', authenticateToken, async (req, res) => {
  try {
    const {
      factura_id, metodo_pagamento, data_inicio, data_fim,
      page = 1, limit = 50
    } = req.query;

    let whereClause = '';
    let params: any[] = [];
    let paramCount = 0;

    if (factura_id) {
      whereClause += `${whereClause ? ' AND' : ' WHERE'} r.factura_id = $${++paramCount}`;
      params.push(factura_id);
    }

    if (metodo_pagamento) {
      whereClause += `${whereClause ? ' AND' : ' WHERE'} r.metodo_pagamento = $${++paramCount}`;
      params.push(metodo_pagamento);
    }

    if (data_inicio) {
      whereClause += `${whereClause ? ' AND' : ' WHERE'} DATE(r.data_pagamento) >= $${++paramCount}`;
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += `${whereClause ? ' AND' : ' WHERE'} DATE(r.data_pagamento) <= $${++paramCount}`;
      params.push(data_fim);
    }

    const offset = (Number(page) - 1) * Number(limit);
    params.push(Number(limit), offset);

    const query = `
      SELECT 
        r.*,
        f.numero as factura_numero,
        f.total as factura_total,
        m.name as member_name,
        m.phone as member_phone,
        m.email as member_email,
        m.nr_cartao as member_nr_cartao
      FROM recibos r
      JOIN facturas f ON r.factura_id = f.id
      JOIN members m ON f.member_id = m.id
      ${whereClause}
      ORDER BY r.data_pagamento DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;

    const result = await pool.query(query, params);
    res.json({
      data: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: result.rows.length
      }
    });
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Pay invoice with automatic credit application
app.post('/api/billing/pay-invoice-with-credits', authenticateToken, async (req: any, res: any) => {
  const {
    factura_id, valor_pago, metodo_pagamento,
    referencia_pagamento, descricao, aplicar_creditos = true
  } = req.body;

  if (!factura_id || !metodo_pagamento) {
    return res.status(400).json({ 
      error: 'Invoice ID and payment method are required' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Validate user ID
    const userId = await validateUserId(req.user?.id);

    // Get invoice with member and plan info
    const invoiceResult = await client.query(
      `SELECT f.*, m.name as member_name, p.name as plan_name 
       FROM facturas f 
       LEFT JOIN members m ON f.member_id = m.id 
       LEFT JOIN plans p ON f.plan_id = p.id 
       WHERE f.id = $1`,
      [factura_id]
    );

    if (invoiceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];

    // Check if invoice is already paid
    if (invoice.estado === 'paga') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invoice is already fully paid' });
    }

    // Calculate total already paid
    const paymentsResult = await client.query(
      'SELECT COALESCE(SUM(valor_pago), 0) as total_pago FROM recibos WHERE factura_id = $1',
      [factura_id]
    );
    const totalPago = parseFloat(paymentsResult.rows[0].total_pago);
    const valorRestante = invoice.total - totalPago;

    let creditosAplicados = [];
    let totalCreditosUsados = 0;

    // Apply available credits if requested
    if (aplicar_creditos && valorRestante > 0) {
      const creditosResult = await client.query(`
        SELECT 
          nc.*,
          f.numero as factura_numero,
          COALESCE(SUM(cu.valor_usado), 0) as valor_usado,
          (nc.valor_credito - COALESCE(SUM(cu.valor_usado), 0)) as valor_disponivel
        FROM notas_credito nc
        JOIN facturas f ON nc.factura_id = f.id
        LEFT JOIN credito_usado cu ON nc.id = cu.credito_id
        WHERE f.member_id = $1 
          AND nc.aprovado_por IS NOT NULL
        GROUP BY nc.id, f.numero
        HAVING (nc.valor_credito - COALESCE(SUM(cu.valor_usado), 0)) > 0
        ORDER BY nc.created_at ASC
      `, [invoice.member_id]);

      let valorRestanteParaCreditos = valorRestante;

      for (const credito of creditosResult.rows) {
        if (valorRestanteParaCreditos <= 0) break;

        const valorDisponivel = parseFloat(credito.valor_disponivel);
        const valorAUsar = Math.min(valorDisponivel, valorRestanteParaCreditos);

        if (valorAUsar > 0) {
          // Record credit usage
          await client.query(`
            INSERT INTO credito_usado (credito_id, factura_id, valor_usado, created_by)
            VALUES ($1, $2, $3, $4)
          `, [credito.id, factura_id, valorAUsar, userId]);

          creditosAplicados.push({
            credito_id: credito.id,
            numero_credito: credito.numero,
            valor_usado: valorAUsar
          });

          totalCreditosUsados += valorAUsar;
          valorRestanteParaCreditos -= valorAUsar;
        }
      }
    }

    // Calculate remaining amount after credits
    const valorFinalRestante = valorRestante - totalCreditosUsados;
    const valorPagoEfetivo = valor_pago || 0;

    // Validate payment amount
    if (valorPagoEfetivo < 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Payment amount cannot be negative' });
    }

    if (valorPagoEfetivo > valorFinalRestante) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Payment amount exceeds remaining balance after credits',
        invoice_total: invoice.total,
        already_paid: totalPago,
        credits_applied: totalCreditosUsados,
        remaining_after_credits: valorFinalRestante
      });
    }

    let receiptResult = null;

    // Create receipt only if there's actual payment
    if (valorPagoEfetivo > 0) {
      const numero = await getNextDocumentNumber('recibo');

      receiptResult = await client.query(`
        INSERT INTO recibos (
          numero, factura_id, valor_pago, metodo_pagamento,
          referencia_pagamento, descricao, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        numero, factura_id, valorPagoEfetivo, metodo_pagamento.toLowerCase(),
        `PAY-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        descricao || `Pagamento de fatura ${invoice.numero} - ${invoice.member_name}`,
        userId
      ]);

      // Get receipt with member data
      const receiptWithMember = await client.query(`
        SELECT r.*, m.name as member_name, m.phone as member_phone, m.email as member_email, m.nr_cartao as member_nr_cartao
        FROM recibos r
        JOIN facturas f ON r.factura_id = f.id
        JOIN members m ON f.member_id = m.id
        WHERE r.id = $1
      `, [receiptResult.rows[0].id]);

      receiptResult = receiptWithMember;
    }

    // Update invoice status
    const novoTotalPago = totalPago + totalCreditosUsados + valorPagoEfetivo;
    let novoEstado = 'pendente';
    
    if (novoTotalPago >= invoice.total) {
      novoEstado = 'paga';
      
      // If this is a plan invoice, update member's plan dates
      if (invoice.plano_inicio && invoice.plano_fim) {
        await client.query(`
          UPDATE members SET 
            plano_data_inicio = $1,
            plano_data_fim = $2,
            plano_estado = 'activo',
            ultima_factura_id = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
        `, [invoice.plano_inicio, invoice.plano_fim, factura_id, invoice.member_id]);
      }
    } else if (novoTotalPago > 0) {
      novoEstado = 'parcialmente_paga';
    }

    await client.query(
      'UPDATE facturas SET estado = $1 WHERE id = $2',
      [novoEstado, factura_id]
    );

    await client.query('COMMIT');

    // Return payment result
    res.status(201).json({
      success: true,
      invoice_id: factura_id,
      payment_amount: valorPagoEfetivo,
      credits_applied: totalCreditosUsados,
      credits_used: creditosAplicados,
      total_paid: novoTotalPago,
      invoice_status: novoEstado,
      receipt: receiptResult?.rows[0] || null,
      remaining_balance: invoice.total - novoTotalPago
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing payment with credits:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Register payment and generate receipt
app.post('/api/billing/receipts', authenticateToken, async (req: any, res: any) => {
  const {
    factura_id, valor_pago, metodo_pagamento,
    referencia_pagamento, descricao
  } = req.body;

  if (!factura_id || !valor_pago || !metodo_pagamento) {
    return res.status(400).json({ 
      error: 'Invoice ID, amount paid and payment method are required' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Validate user ID
    const userId = await validateUserId(req.user?.id);

    // Check if invoice exists and is not already fully paid
    const invoiceResult = await client.query(
      'SELECT * FROM facturas WHERE id = $1',
      [factura_id]
    );

    if (invoiceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];
    
    if (invoice.estado === 'paga') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invoice is already fully paid' });
    }

    // Calculate total payments made so far
    const paymentsResult = await client.query(
      'SELECT COALESCE(SUM(valor_pago), 0) as total_pago FROM recibos WHERE factura_id = $1',
      [factura_id]
    );

    const totalPago = parseFloat(paymentsResult.rows[0].total_pago);
    const novoTotal = totalPago + parseFloat(valor_pago);

    if (novoTotal > invoice.total) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Payment amount exceeds invoice total',
        details: {
          invoice_total: invoice.total,
          already_paid: totalPago,
          remaining: invoice.total - totalPago
        }
      });
    }

    // Generate receipt number
    const numero = await getNextDocumentNumber('recibo');

    // Create receipt
    const receiptResult = await client.query(`
      INSERT INTO recibos (
        numero, factura_id, valor_pago, metodo_pagamento,
        referencia_pagamento, descricao, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      numero, factura_id, valor_pago, metodo_pagamento.toLowerCase(),
      `PAY-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      descricao, userId
    ]);

    // Update invoice status
    let novoEstado = 'pendente';
    if (novoTotal >= invoice.total) {
      novoEstado = 'paga';
      
      // If plan renewal, update member's plan dates
      if (invoice.plano_inicio && invoice.plano_fim) {
        await client.query(`
          UPDATE members SET 
            plano_data_inicio = $1,
            plano_data_fim = $2,
            plano_estado = 'activo'
          WHERE id = $3
        `, [invoice.plano_inicio, invoice.plano_fim, invoice.member_id]);
      }
    } else if (novoTotal > 0) {
      novoEstado = 'parcialmente_paga';
    }

    await client.query(
      'UPDATE facturas SET estado = $1 WHERE id = $2',
      [novoEstado, factura_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      receipt: receiptResult.rows[0],
      invoice_status: novoEstado,
      total_paid: novoTotal
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error registering payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Pay pending invoice
app.post('/api/billing/pay-invoice', authenticateToken, async (req: any, res: any) => {
  const {
    factura_id, valor_pago, metodo_pagamento,
    referencia_pagamento, descricao
  } = req.body;

  if (!factura_id || !valor_pago || !metodo_pagamento) {
    return res.status(400).json({ 
      error: 'Invoice ID, amount paid and payment method are required' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Validate user ID
    const userId = await validateUserId(req.user?.id);

    // Get invoice with member and plan info
    const invoiceResult = await client.query(
      `SELECT f.*, m.name as member_name, p.name as plan_name 
       FROM facturas f 
       LEFT JOIN members m ON f.member_id = m.id 
       LEFT JOIN plans p ON f.plan_id = p.id 
       WHERE f.id = $1`,
      [factura_id]
    );

    if (invoiceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];

    // Check if invoice is already paid
    if (invoice.estado === 'paga') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invoice is already fully paid' });
    }

    // Calculate total already paid
    const paymentsResult = await client.query(
      'SELECT COALESCE(SUM(valor_pago), 0) as total_pago FROM recibos WHERE factura_id = $1',
      [factura_id]
    );
    const totalPago = parseFloat(paymentsResult.rows[0].total_pago);

    // Check if payment amount is valid
    if (valor_pago <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Payment amount must be greater than 0' });
    }

    if (totalPago + valor_pago > invoice.total) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Payment amount exceeds invoice total',
        invoice_total: invoice.total,
        already_paid: totalPago,
        remaining: invoice.total - totalPago
      });
    }

    // Generate receipt number
    const numero = await getNextDocumentNumber('recibo');

    // Create receipt
    const receiptResult = await client.query(`
      INSERT INTO recibos (
        numero, factura_id, valor_pago, metodo_pagamento,
        referencia_pagamento, descricao, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      numero, factura_id, valor_pago, metodo_pagamento.toLowerCase(),
      `PAY-${new Date().toISOString().split('T')[0]}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      descricao || `Pagamento de fatura ${invoice.numero} - ${invoice.member_name}`,
      userId
    ]);

    // Update invoice status
    const novoTotal = totalPago + valor_pago;
    let novoEstado = 'pendente';
    
    if (novoTotal >= invoice.total) {
      novoEstado = 'paga';
      
      // If this is a plan invoice, update member's plan dates
      if (invoice.plano_inicio && invoice.plano_fim) {
        await client.query(`
          UPDATE members SET 
            plano_data_inicio = $1,
            plano_data_fim = $2,
            plano_estado = 'activo',
            ultima_factura_id = $3,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = $4
        `, [invoice.plano_inicio, invoice.plano_fim, factura_id, invoice.member_id]);
      }
    } else if (novoTotal > 0) {
      novoEstado = 'parcialmente_paga';
    }

    await client.query(
      'UPDATE facturas SET estado = $1 WHERE id = $2',
      [novoEstado, factura_id]
    );

    await client.query('COMMIT');

    // Return payment result with generated documents
    res.status(201).json({
      payment: {
        factura_id,
        valor_pago,
        metodo_pagamento,
        referencia_pagamento,
        data_pagamento: new Date().toISOString()
      },
      receipt: receiptResult.rows[0],
      invoice: {
        ...invoice,
        estado: novoEstado,
        total_pago: novoTotal
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error paying invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Get available credits for a member
app.get('/api/billing/member-credits/:member_id', authenticateToken, async (req, res) => {
  const { member_id } = req.params;
  
  try {
    const result = await pool.query(`
      SELECT 
        nc.*,
        f.numero as factura_numero,
        COALESCE(SUM(cu.valor_usado), 0) as valor_usado,
        (nc.valor_credito - COALESCE(SUM(cu.valor_usado), 0)) as valor_disponivel
      FROM notas_credito nc
      JOIN facturas f ON nc.factura_id = f.id
      LEFT JOIN credito_usado cu ON nc.id = cu.credito_id
      WHERE f.member_id = $1 
        AND nc.aprovado_por IS NOT NULL
      GROUP BY nc.id, f.numero
      HAVING (nc.valor_credito - COALESCE(SUM(cu.valor_usado), 0)) > 0
      ORDER BY nc.created_at ASC
    `, [member_id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching member credits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all credit notes
app.get('/api/billing/credit-notes', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        nc.*,
        f.numero as factura_numero,
        m.name as member_name
      FROM notas_credito nc
      JOIN facturas f ON nc.factura_id = f.id
      JOIN members m ON f.member_id = m.id
      ORDER BY nc.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching credit notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create credit note
app.post('/api/billing/credit-notes', authenticateToken, async (req: any, res: any) => {
  const { factura_id, motivo, valor_credito, tipo } = req.body;

  if (!factura_id || !motivo || !valor_credito || !tipo) {
    return res.status(400).json({ 
      error: 'Invoice ID, reason, credit amount and type are required' 
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    
    // Validate user ID
    const userId = await validateUserId(req.user?.id);

    // Check if invoice exists
    const invoiceResult = await client.query(
      'SELECT * FROM facturas WHERE id = $1',
      [factura_id]
    );

    if (invoiceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];

    // Check credit amount doesn't exceed invoice total
    if (parseFloat(valor_credito) > invoice.total) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Credit amount cannot exceed invoice total' 
      });
    }

    // Generate credit note number
    const numero = await getNextDocumentNumber('nota_credito');

    // Create credit note
    const creditNoteResult = await client.query(`
      INSERT INTO notas_credito (
        numero, factura_id, motivo, valor_credito, tipo,
        aprovado_por, data_aprovacao, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, $7)
      RETURNING *
    `, [
      numero, factura_id, motivo, valor_credito, tipo,
      userId, userId
    ]);

    // Update invoice status if full credit
    if (tipo === 'total' || parseFloat(valor_credito) >= invoice.total) {
      await client.query(
        'UPDATE facturas SET estado = $1 WHERE id = $2',
        ['cancelada', factura_id]
      );
    }

    await client.query('COMMIT');

    res.status(201).json(creditNoteResult.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating credit note:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// =============================================
// BILLING AUTOMATION AND JOBS
// =============================================

// Import billing service
import BillingService from './services/billingService';
const billingService = new BillingService({ pool });

// Manual trigger for daily invoice generation (for testing)
app.post('/api/billing/jobs/daily-invoices', authenticateToken, async (req: any, res: any) => {
  try {
    console.log(`Manual daily invoice generation triggered by user: ${req.user?.email}`);
    const result = await billingService.generateDailyInvoices();
    res.json({
      status: 'completed',
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error: any) {
    console.error('Error in manual daily invoice generation:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Automated daily job endpoint (called by cron or external scheduler)
app.post('/api/billing/jobs/automated-daily', async (req, res) => {
  try {
    // Simple authentication for automated jobs
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.CRON_JOB_TOKEN || 'hefel-daily-job-2024';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Automated daily billing job started');
    
    // Generate invoices for expiring plans
    const invoiceResult = await billingService.generateDailyInvoices();
    
    // Check for overdue invoices
    const overdueResult = await billingService.checkOverdueInvoices();
    
    // Send plan expiration reminders
    const reminderResult = await billingService.sendPlanExpirationReminders();

    const result = {
      timestamp: new Date().toISOString(),
      invoices: invoiceResult,
      overdue_checks: overdueResult,
      reminders: reminderResult
    };

    console.log('Automated daily billing job completed:', result);
    
    res.json({
      status: 'completed',
      result
    });

  } catch (error: any) {
    console.error('Error in automated daily billing job:', error);
    res.status(500).json({ 
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get billing summary report
app.get('/api/billing/reports/summary', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ 
        error: 'start_date and end_date are required' 
      });
    }

    const summary = await billingService.generateBillingSummary(
      start_date as string, 
      end_date as string
    );

    res.json(summary);
  } catch (error) {
    console.error('Error generating billing summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook endpoint for payment confirmations (e.g., from Mpesa, Emola)
app.post('/api/billing/webhooks/payment', async (req, res) => {
  try {
    const { 
      transaction_id, 
      amount, 
      payment_method, 
      reference, 
      status 
    } = req.body;

    console.log('Payment webhook received:', req.body);

    if (status === 'completed' && reference) {
      // Try to find matching invoice by reference
      // This would need to be implemented based on how payment references are structured
      
      // For now, just log the webhook
      console.log(`Payment confirmation received: ${transaction_id}, Amount: ${amount}, Method: ${payment_method}`);
    }

    // Always respond with 200 to prevent retries
    res.status(200).json({ status: 'received' });
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    res.status(200).json({ status: 'error' }); // Still return 200 to prevent retries
  }
}); 