
import pool from './database';
import { DatabaseSchema, TableRow } from '@/types/database.types';

// Helper function to execute queries
const executeQuery = async (query: string, params: any[] = []) => {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Plans functions
export async function getPlans(): Promise<TableRow<"plans">[]> {
  const query = 'SELECT * FROM plans ORDER BY name';
  return executeQuery(query);
}

export async function getPlan(id: string): Promise<TableRow<"plans"> | null> {
  const query = 'SELECT * FROM plans WHERE id = $1';
  const results = await executeQuery(query, [id]);
  return results[0] || null;
}

export async function createPlan(planData: Omit<TableRow<"plans">, "id" | "created_at" | "updated_at">) {
  const query = `
    INSERT INTO plans (id, name, description, price, duration_days, features, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const id = crypto.randomUUID();
  const results = await executeQuery(query, [
    id,
    planData.name,
    planData.description,
    planData.price,
    planData.duration_days,
    JSON.stringify(planData.features),
    planData.is_active ?? true
  ]);
  return results[0];
}

export async function updatePlan(id: string, planData: Partial<Omit<TableRow<"plans">, "id" | "created_at" | "updated_at">>) {
  const query = `
    UPDATE plans 
    SET name = COALESCE($2, name),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        duration_days = COALESCE($5, duration_days),
        features = COALESCE($6, features),
        is_active = COALESCE($7, is_active),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const results = await executeQuery(query, [
    id,
    planData.name,
    planData.description,
    planData.price,
    planData.duration_days,
    planData.features ? JSON.stringify(planData.features) : null,
    planData.is_active
  ]);
  return results[0];
}

export async function togglePlanStatus(id: string, isActive: boolean) {
  const query = 'UPDATE plans SET is_active = $2, updated_at = NOW() WHERE id = $1';
  await executeQuery(query, [id, isActive]);
  return true;
}

// Members functions
export async function getMembers(searchTerm?: string): Promise<TableRow<"members">[]> {
  let query = 'SELECT * FROM members';
  const params: any[] = [];
  
  if (searchTerm && searchTerm.trim() !== '') {
    query += ' WHERE name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1';
    params.push(`%${searchTerm}%`);
  }
  
  query += ' ORDER BY name';
  
  return executeQuery(query, params);
}

export async function getMember(id: string): Promise<TableRow<"members"> | null> {
  const query = 'SELECT * FROM members WHERE id = $1';
  const results = await executeQuery(query, [id]);
  return results[0] || null;
}

export const getMemberById = getMember;

export async function createMember(member: Omit<TableRow<"members">, 'id' | 'created_at'>): Promise<TableRow<"members"> | null> {
  const query = `
    INSERT INTO members (id, name, email, phone, plan, plan_id, status, join_date, end_date, avatar_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  const id = crypto.randomUUID();
  const results = await executeQuery(query, [
    id,
    member.name,
    member.email,
    member.phone,
    member.plan,
    member.plan_id,
    member.status || 'Ativo',
    member.join_date || new Date().toISOString().split('T')[0],
    member.end_date,
    member.avatar_url
  ]);
  return results[0];
}

export async function updateMember(id: string, member: Partial<TableRow<"members">>): Promise<TableRow<"members"> | null> {
  const query = `
    UPDATE members 
    SET name = COALESCE($2, name),
        email = COALESCE($3, email),
        phone = COALESCE($4, phone),
        plan = COALESCE($5, plan),
        plan_id = COALESCE($6, plan_id),
        status = COALESCE($7, status),
        join_date = COALESCE($8, join_date),
        end_date = COALESCE($9, end_date),
        avatar_url = COALESCE($10, avatar_url)
    WHERE id = $1
    RETURNING *
  `;
  const results = await executeQuery(query, [
    id,
    member.name,
    member.email,
    member.phone,
    member.plan,
    member.plan_id,
    member.status,
    member.join_date,
    member.end_date,
    member.avatar_url
  ]);
  return results[0];
}

export async function deleteMember(id: string): Promise<boolean> {
  const query = 'DELETE FROM members WHERE id = $1';
  await executeQuery(query, [id]);
  return true;
}

// Classes functions
export async function getClasses(): Promise<TableRow<"classes">[]> {
  const query = 'SELECT * FROM classes ORDER BY day_of_week, start_time';
  return executeQuery(query);
}

export async function getClass(id: string): Promise<TableRow<"classes"> | null> {
  const query = 'SELECT * FROM classes WHERE id = $1';
  const results = await executeQuery(query, [id]);
  return results[0] || null;
}

export async function createClass(gymClass: Omit<TableRow<"classes">, 'id' | 'created_at'>): Promise<TableRow<"classes"> | null> {
  const query = `
    INSERT INTO classes (id, title, instructor, day_of_week, start_time, end_time, max_participants, color)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const id = crypto.randomUUID();
  const results = await executeQuery(query, [
    id,
    gymClass.title,
    gymClass.instructor,
    gymClass.day_of_week,
    gymClass.start_time,
    gymClass.end_time,
    gymClass.max_participants || 20,
    gymClass.color || 'bg-primary'
  ]);
  return results[0];
}

export async function updateClass(id: string, gymClass: Partial<TableRow<"classes">>): Promise<TableRow<"classes"> | null> {
  const query = `
    UPDATE classes 
    SET title = COALESCE($2, title),
        instructor = COALESCE($3, instructor),
        day_of_week = COALESCE($4, day_of_week),
        start_time = COALESCE($5, start_time),
        end_time = COALESCE($6, end_time),
        max_participants = COALESCE($7, max_participants),
        color = COALESCE($8, color)
    WHERE id = $1
    RETURNING *
  `;
  const results = await executeQuery(query, [
    id,
    gymClass.title,
    gymClass.instructor,
    gymClass.day_of_week,
    gymClass.start_time,
    gymClass.end_time,
    gymClass.max_participants,
    gymClass.color
  ]);
  return results[0];
}

export async function deleteClass(id: string): Promise<boolean> {
  const query = 'DELETE FROM classes WHERE id = $1';
  await executeQuery(query, [id]);
  return true;
}

// Payments functions
export async function getPayments(searchTerm?: string): Promise<TableRow<"payments">[]> {
  let query = `
    SELECT p.*, m.name as member_name, m.email as member_email
    FROM payments p
    LEFT JOIN members m ON p.member_id = m.id
  `;
  const params: any[] = [];
  
  if (searchTerm && searchTerm.trim() !== '') {
    query += ' WHERE p.reference_id ILIKE $1 OR p.plan ILIKE $1 OR m.name ILIKE $1';
    params.push(`%${searchTerm}%`);
  }
  
  query += ' ORDER BY p.payment_date DESC';
  
  return executeQuery(query, params);
}

export async function getPayment(id: string): Promise<TableRow<"payments"> | null> {
  const query = 'SELECT * FROM payments WHERE id = $1';
  const results = await executeQuery(query, [id]);
  return results[0] || null;
}

export const getPaymentById = getPayment;

export async function createPayment(payment: Omit<TableRow<"payments">, 'id' | 'created_at'>): Promise<TableRow<"payments"> | null> {
  const query = `
    INSERT INTO payments (id, member_id, amount, plan, method, status, payment_date, reference_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const id = crypto.randomUUID();
  const results = await executeQuery(query, [
    id,
    payment.member_id,
    payment.amount,
    payment.plan,
    payment.method,
    payment.status || 'Pendente',
    payment.payment_date || new Date().toISOString().split('T')[0],
    payment.reference_id
  ]);
  return results[0];
}

export async function updatePayment(id: string, payment: Partial<TableRow<"payments">>): Promise<TableRow<"payments"> | null> {
  const query = `
    UPDATE payments 
    SET member_id = COALESCE($2, member_id),
        amount = COALESCE($3, amount),
        plan = COALESCE($4, plan),
        method = COALESCE($5, method),
        status = COALESCE($6, status),
        payment_date = COALESCE($7, payment_date),
        reference_id = COALESCE($8, reference_id)
    WHERE id = $1
    RETURNING *
  `;
  const results = await executeQuery(query, [
    id,
    payment.member_id,
    payment.amount,
    payment.plan,
    payment.method,
    payment.status,
    payment.payment_date,
    payment.reference_id
  ]);
  return results[0];
}

export async function deletePayment(id: string): Promise<boolean> {
  const query = 'DELETE FROM payments WHERE id = $1';
  await executeQuery(query, [id]);
  return true;
}

// Check-ins functions
export async function getRecentCheckIns(): Promise<any[]> {
  const query = `
    SELECT c.*, m.name as member_name, m.plan, m.status as member_status
    FROM checkins c
    LEFT JOIN members m ON c.member_id = m.id
    ORDER BY c.check_time DESC
    LIMIT 20
  `;
  return executeQuery(query);
}

export async function recordCheckIn(data: { member_id: string, check_type: string }): Promise<boolean> {
  const query = `
    INSERT INTO checkins (id, member_id, check_type, check_time)
    VALUES ($1, $2, $3, NOW())
  `;
  await executeQuery(query, [crypto.randomUUID(), data.member_id, data.check_type]);
  return true;
}

// Settings functions
export async function getSettings(): Promise<any> {
  const query = 'SELECT * FROM settings WHERE id = 1';
  const results = await executeQuery(query);
  return results[0] || {};
}

export async function updateSettings(settings: any): Promise<any> {
  const query = `
    UPDATE settings 
    SET gym_name = COALESCE($1, gym_name),
        address = COALESCE($2, address),
        phone = COALESCE($3, phone),
        email = COALESCE($4, email),
        business_hours = COALESCE($5, business_hours),
        updated_at = NOW()
    WHERE id = 1
    RETURNING *
  `;
  const results = await executeQuery(query, [
    settings.gym_name,
    settings.address,
    settings.phone,
    settings.email,
    settings.business_hours
  ]);
  return results[0];
}

// Auth functions for compatibility
export async function getCurrentUser() {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  
  const { getCurrentUser: getUser } = await import('@/lib/auth');
  return getUser(token);
}

export async function getCurrentUserProfile() {
  return getCurrentUser();
}

// Simplified functions for other modules
export const getWorkouts = () => executeQuery('SELECT * FROM workouts ORDER BY name');
export const getExercises = () => executeQuery('SELECT * FROM exercises ORDER BY name');
export const getCheckins = () => executeQuery('SELECT * FROM checkins ORDER BY check_time DESC');
export const getProfiles = () => executeQuery('SELECT * FROM profiles ORDER BY name');
export const getRoles = () => executeQuery('SELECT * FROM roles ORDER BY name');
