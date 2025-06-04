
import pool from './database';
import { DatabaseSchema, TableRow } from '@/types/database.types';
import { signUp } from './auth';

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

export async function getMembersWithPlan(planId: string): Promise<TableRow<"members">[]> {
  const query = 'SELECT * FROM members WHERE plan_id = $1 ORDER BY name';
  return executeQuery(query, [planId]);
}

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

// Reservations functions
export async function createReservation(reservation: { class_id: string; member_id: string }): Promise<TableRow<"reservations"> | null> {
  const query = `
    INSERT INTO reservations (id, class_id, member_id, status)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const id = crypto.randomUUID();
  const results = await executeQuery(query, [
    id,
    reservation.class_id,
    reservation.member_id,
    'Confirmado'
  ]);
  return results[0];
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

export async function updateSetting(id: string, settings: any): Promise<any> {
  return updateSettings(settings);
}

// Notification settings functions
export async function getNotificationSettings(): Promise<any> {
  const query = 'SELECT * FROM notification_settings WHERE id = 1';
  const results = await executeQuery(query);
  return results[0] || {};
}

export async function updateNotificationSettings(settings: any): Promise<any> {
  const query = `
    UPDATE notification_settings 
    SET email_notifications = COALESCE($1, email_notifications),
        sms_notifications = COALESCE($2, sms_notifications),
        payment_reminders = COALESCE($3, payment_reminders),
        class_reminders = COALESCE($4, class_reminders),
        marketing_messages = COALESCE($5, marketing_messages),
        updated_at = NOW()
    WHERE id = 1
    RETURNING *
  `;
  const results = await executeQuery(query, [
    settings.email_notifications,
    settings.sms_notifications,
    settings.payment_reminders,
    settings.class_reminders,
    settings.marketing_messages
  ]);
  return results[0];
}

// Exercises functions
export async function getExercises(): Promise<TableRow<"exercises">[]> {
  const query = 'SELECT * FROM exercises ORDER BY name';
  return executeQuery(query);
}

export async function createExercise(exercise: Omit<TableRow<"exercises">, 'id' | 'created_at'>): Promise<TableRow<"exercises"> | null> {
  const query = `
    INSERT INTO exercises (id, name, muscle_group, description)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const id = crypto.randomUUID();
  const results = await executeQuery(query, [
    id,
    exercise.name,
    exercise.muscle_group,
    exercise.description
  ]);
  return results[0];
}

// Workouts functions
export async function getWorkouts(): Promise<TableRow<"workouts">[]> {
  const query = 'SELECT * FROM workouts ORDER BY name';
  return executeQuery(query);
}

export async function createWorkout(workout: Omit<TableRow<"workouts">, 'id' | 'created_at'>, exercises: any[]): Promise<TableRow<"workouts"> | null> {
  const workoutId = crypto.randomUUID();
  
  // Create workout
  const workoutQuery = `
    INSERT INTO workouts (id, name, description)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const workoutResults = await executeQuery(workoutQuery, [
    workoutId,
    workout.name,
    workout.description
  ]);
  
  // Add exercises to workout
  for (const exercise of exercises) {
    const exerciseQuery = `
      INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await executeQuery(exerciseQuery, [
      crypto.randomUUID(),
      workoutId,
      exercise.exercise_id,
      exercise.sets,
      exercise.reps
    ]);
  }
  
  return workoutResults[0];
}

export async function getWorkoutDetails(workoutId: string): Promise<any> {
  const workoutQuery = 'SELECT * FROM workouts WHERE id = $1';
  const workoutResults = await executeQuery(workoutQuery, [workoutId]);
  
  if (workoutResults.length === 0) return null;
  
  const exercisesQuery = `
    SELECT we.*, e.name, e.muscle_group, e.description as exercise_description
    FROM workout_exercises we
    JOIN exercises e ON we.exercise_id = e.id
    WHERE we.workout_id = $1
    ORDER BY we.created_at
  `;
  const exercisesResults = await executeQuery(exercisesQuery, [workoutId]);
  
  return {
    ...workoutResults[0],
    workout_exercises: exercisesResults.map(ex => ({
      ...ex,
      exercises: {
        id: ex.exercise_id,
        name: ex.name,
        muscle_group: ex.muscle_group,
        description: ex.exercise_description
      }
    }))
  };
}

export async function addExerciseToWorkout(data: { workout_id: string; exercise_id: string; sets: number; reps: string }): Promise<boolean> {
  const query = `
    INSERT INTO workout_exercises (id, workout_id, exercise_id, sets, reps)
    VALUES ($1, $2, $3, $4, $5)
  `;
  await executeQuery(query, [
    crypto.randomUUID(),
    data.workout_id,
    data.exercise_id,
    data.sets,
    data.reps
  ]);
  return true;
}

export async function getMemberWorkouts(memberId: string): Promise<any[]> {
  const query = `
    SELECT mw.*, w.name as workout_name, w.description as workout_description
    FROM member_workouts mw
    JOIN workouts w ON mw.workout_id = w.id
    WHERE mw.member_id = $1
    ORDER BY mw.assigned_date DESC
  `;
  return executeQuery(query, [memberId]);
}

// Check-ins functions
export async function getCheckins(): Promise<TableRow<"checkins">[]> {
  const query = 'SELECT * FROM checkins ORDER BY check_time DESC';
  return executeQuery(query);
}

// Profiles and roles functions
export async function getProfiles(): Promise<TableRow<"profiles">[]> {
  const query = 'SELECT * FROM profiles ORDER BY name';
  return executeQuery(query);
}

export async function getRoles(): Promise<TableRow<"roles">[]> {
  const query = 'SELECT * FROM roles ORDER BY name';
  return executeQuery(query);
}

export async function createRole(role: Omit<TableRow<"roles">, 'id' | 'created_at' | 'updated_at'>): Promise<TableRow<"roles"> | null> {
  const query = `
    INSERT INTO roles (id, name, description, permissions)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const id = crypto.randomUUID();
  const results = await executeQuery(query, [
    id,
    role.name,
    role.description,
    JSON.stringify(role.permissions)
  ]);
  return results[0];
}

export async function updateRole(id: string, role: Partial<Omit<TableRow<"roles">, 'id' | 'created_at' | 'updated_at'>>): Promise<TableRow<"roles"> | null> {
  const query = `
    UPDATE roles 
    SET name = COALESCE($2, name),
        description = COALESCE($3, description),
        permissions = COALESCE($4, permissions),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const results = await executeQuery(query, [
    id,
    role.name,
    role.description,
    role.permissions ? JSON.stringify(role.permissions) : null
  ]);
  return results[0];
}

export async function deleteRole(id: string): Promise<boolean> {
  const query = 'DELETE FROM roles WHERE id = $1';
  await executeQuery(query, [id]);
  return true;
}

export async function createUserAsAdmin(userData: { email: string; password: string; name: string; role: string }): Promise<any> {
  const response = await signUp(userData.email, userData.password, userData.name);
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  // Update the role after creation
  if (response.user) {
    await executeQuery(
      'UPDATE profiles SET role = $1 WHERE id = $2',
      [userData.role, response.user.id]
    );
  }
  
  return response;
}

export async function updateProfile(id: string, profileData: Partial<TableRow<"profiles">>): Promise<TableRow<"profiles"> | null> {
  const query = `
    UPDATE profiles 
    SET name = COALESCE($2, name),
        role = COALESCE($3, role),
        status = COALESCE($4, status),
        updated_at = NOW()
    WHERE id = $1
    RETURNING *
  `;
  const results = await executeQuery(query, [
    id,
    profileData.name,
    profileData.role,
    profileData.status
  ]);
  return results[0];
}

// App users functions (for compatibility with existing components)
export async function getAppUsers(): Promise<TableRow<"app_users">[]> {
  const query = 'SELECT * FROM app_users ORDER BY name';
  return executeQuery(query);
}

export async function createAppUser(user: Omit<TableRow<"app_users">, 'id' | 'created_at'>): Promise<TableRow<"app_users"> | null> {
  const query = `
    INSERT INTO app_users (id, name, email, role, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const id = crypto.randomUUID();
  const results = await executeQuery(query, [
    id,
    user.name,
    user.email,
    user.role || 'staff',
    user.status || 'Ativo'
  ]);
  return results[0];
}

export async function updateAppUser(id: string, user: Partial<TableRow<"app_users">>): Promise<TableRow<"app_users"> | null> {
  const query = `
    UPDATE app_users 
    SET name = COALESCE($2, name),
        email = COALESCE($3, email),
        role = COALESCE($4, role),
        status = COALESCE($5, status),
        last_login = COALESCE($6, last_login)
    WHERE id = $1
    RETURNING *
  `;
  const results = await executeQuery(query, [
    id,
    user.name,
    user.email,
    user.role,
    user.status,
    user.last_login
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
