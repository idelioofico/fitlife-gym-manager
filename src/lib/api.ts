
import { createClient, PostgrestSingleResponse } from '@supabase/supabase-js';
import { DatabaseSchema, TableRow } from '@/types/database.types';
import { supabase } from '@/integrations/supabase/client';

// Agora estamos definindo o tipo das tabelas dinamicamente a partir do DatabaseSchema
type Tables = keyof DatabaseSchema;

// Remove the separate client creation since we're importing the configured client
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);

// Funções genéricas para planos
export async function getPlans(): Promise<TableRow<"plans">[]> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('name');
      
    if (error) throw error;
    return data as TableRow<"plans">[];
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
}

export async function getPlan(id: string): Promise<TableRow<"plans"> | null> {
  try {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as TableRow<"plans">;
  } catch (error) {
    console.error('Error fetching plan:', error);
    return null;
  }
}

export async function createPlan(planData: Omit<TableRow<"plans">, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from('plans')
      .insert(planData)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating plan:', error);
    throw error;
  }
}

export async function updatePlan(id: string, planData: Partial<Omit<TableRow<"plans">, "id" | "created_at" | "updated_at">>) {
  try {
    const { data, error } = await supabase
      .from('plans')
      .update({
        name: planData.name,
        description: planData.description,
        price: planData.price,
        duration_days: planData.duration_days,
        features: planData.features,
        is_active: planData.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating plan:', error);
    throw error;
  }
}

export async function togglePlanStatus(id: string, isActive: boolean) {
  try {
    const { error } = await supabase
      .from('plans')
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error toggling plan status:', error);
    throw error;
  }
}

export async function getPlanMembers(planId: string): Promise<TableRow<"members">[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('plan_id', planId);
      
    if (error) throw error;
    return data as TableRow<"members">[];
  } catch (error) {
    console.error('Error fetching plan members:', error);
    return [];
  }
}

// Adding missing function - getMembersWithPlan
export async function getMembersWithPlan(planId: string): Promise<TableRow<"members">[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('plan_id', planId);
      
    if (error) throw error;
    return data as TableRow<"members">[];
  } catch (error) {
    console.error('Error fetching members with plan:', error);
    return [];
  }
}

// Generic function to fetch data from any table
async function getTable<T extends Tables>(table: T): Promise<TableRow<T>[]> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*');
    
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      return [];
    }
    
    return data as TableRow<T>[];
  } catch (error) {
    console.error(`Unexpected error fetching ${table}:`, error);
    return [];
  }
}

// Generic function to fetch a single row from any table by ID
async function getTableById<T extends Tables>(table: T, id: string): Promise<TableRow<T> | null> {
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Error fetching ${table} with ID ${id}:`, error);
      return null;
    }
    
    return data as TableRow<T>;
  } catch (error) {
    console.error(`Unexpected error fetching ${table} with ID ${id}:`, error);
    return null;
  }
}

// Generic function to create a new row in any table
async function createTable<T extends Tables>(table: T, item: Omit<TableRow<T>, 'id' | 'created_at'>): Promise<TableRow<T> | null> {
  try {
    const { data, error } = await supabase
      .from(table)
      .insert(item)
      .select()
      .single();
    
    if (error) {
      console.error(`Error creating ${table}:`, error);
      return null;
    }
    
    return data as TableRow<T>;
  } catch (error) {
    console.error(`Unexpected error creating ${table}:`, error);
    return null;
  }
}

// Generic function to update a row in any table by ID
async function updateTableById<T extends Tables>(table: T, id: string, item: Partial<TableRow<T>>): Promise<TableRow<T> | null> {
  try {
    const { data, error } = await supabase
      .from(table)
      .update(item)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating ${table} with ID ${id}:`, error);
      return null;
    }
    
    return data as TableRow<T>;
  } catch (error) {
    console.error(`Unexpected error updating ${table} with ID ${id}:`, error);
    return null;
  }
}

// Generic function to delete a row from any table by ID
async function deleteTableById<T extends Tables>(table: T, id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting ${table} with ID ${id}:`, error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error(`Unexpected error deleting ${table} with ID ${id}:`, error);
    return false;
  }
}

// Specific functions for members
export async function getMembers(searchTerm?: string): Promise<TableRow<"members">[]> {
  try {
    let query = supabase.from('members').select('*');
    
    if (searchTerm && searchTerm.trim() !== '') {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) throw error;
    return data as TableRow<"members">[];
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}

export async function getMember(id: string): Promise<TableRow<"members"> | null> {
  return getTableById("members", id);
}

// Adding alias for getMemberById to match function calls
export const getMemberById = getMember;

export async function createMember(member: Omit<TableRow<"members">, 'id' | 'created_at'>): Promise<TableRow<"members"> | null> {
  return createTable("members", member);
}

export async function updateMember(id: string, member: Partial<TableRow<"members">>): Promise<TableRow<"members"> | null> {
  return updateTableById("members", id, member);
}

export async function deleteMember(id: string): Promise<boolean> {
  return deleteTableById("members", id);
}

// Specific functions for classes
export async function getClasses(): Promise<TableRow<"classes">[]> {
  return getTable("classes");
}

export async function getClass(id: string): Promise<TableRow<"classes"> | null> {
  return getTableById("classes", id);
}

export async function createClass(gymClass: Omit<TableRow<"classes">, 'id' | 'created_at'>): Promise<TableRow<"classes"> | null> {
  return createTable("classes", gymClass);
}

export async function updateClass(id: string, gymClass: Partial<TableRow<"classes">>): Promise<TableRow<"classes"> | null> {
  return updateTableById("classes", id, gymClass);
}

export async function deleteClass(id: string): Promise<boolean> {
  return deleteTableById("classes", id);
}

// Adding missing function - createReservation
export async function createReservation(reservationData: { member_id: string, class_id: string }): Promise<TableRow<"reservations"> | null> {
  return createTable("reservations", reservationData);
}

// Specific functions for payments
export async function getPayments(searchTerm?: string): Promise<TableRow<"payments">[]> {
  try {
    let query = supabase
      .from('payments')
      .select('*, members(name, email)');
    
    if (searchTerm && searchTerm.trim() !== '') {
      query = query.or(`reference_id.ilike.%${searchTerm}%,plan.ilike.%${searchTerm}%,members.name.ilike.%${searchTerm}%`);
    }
    
    const { data, error } = await query.order('payment_date', { ascending: false });
    
    if (error) throw error;
    return data as unknown as TableRow<"payments">[];
  } catch (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
}

export async function getPayment(id: string): Promise<TableRow<"payments"> | null> {
  return getTableById("payments", id);
}

// Adding alias for getPaymentById to match function calls
export const getPaymentById = getPayment;

export async function createPayment(payment: Omit<TableRow<"payments">, 'id' | 'created_at'>): Promise<TableRow<"payments"> | null> {
  return createTable("payments", payment);
}

export async function updatePayment(id: string, payment: Partial<TableRow<"payments">>): Promise<TableRow<"payments"> | null> {
  return updateTableById("payments", id, payment);
}

export async function deletePayment(id: string): Promise<boolean> {
  return deleteTableById("payments", id);
}

// Specific functions for workouts
export async function getWorkouts(): Promise<TableRow<"workouts">[]> {
  return getTable("workouts");
}

export async function getWorkout(id: string): Promise<TableRow<"workouts"> | null> {
  return getTableById("workouts", id);
}

// Adding missing function - getWorkoutDetails
export async function getWorkoutDetails(id: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_exercises (
          *,
          exercises (*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching workout details with ID ${id}:`, error);
    return null;
  }
}

// Adding missing function - getMemberWorkouts
export async function getMemberWorkouts(memberId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('member_workouts')
      .select(`
        *,
        workouts (*)
      `)
      .eq('member_id', memberId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching workouts for member ${memberId}:`, error);
    return [];
  }
}

export async function createWorkout(workoutData: Omit<TableRow<"workouts">, 'id' | 'created_at'>, exercises?: any[]): Promise<TableRow<"workouts"> | null> {
  try {
    // First, create the workout
    const workout = await createTable("workouts", workoutData);
    
    // If exercises are provided and workout creation was successful
    if (workout && exercises && exercises.length > 0) {
      // Prepare exercise connections
      const workoutExercises = exercises.map(ex => ({
        workout_id: workout.id,
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps
      }));
      
      // Insert workout exercises
      const { error } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);
        
      if (error) throw error;
    }
    
    return workout;
  } catch (error) {
    console.error('Error creating workout with exercises:', error);
    return null;
  }
}

// Adding missing function - addExerciseToWorkout
export async function addExerciseToWorkout(data: { 
  workout_id: string, 
  exercise_id: string,
  sets: number,
  reps: string
}): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('workout_exercises')
      .insert(data);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding exercise to workout:', error);
    throw error;
  }
}

export async function updateWorkout(id: string, workout: Partial<TableRow<"workouts">>): Promise<TableRow<"workouts"> | null> {
  return updateTableById("workouts", id, workout);
}

export async function deleteWorkout(id: string): Promise<boolean> {
  return deleteTableById("workouts", id);
}

// Specific functions for exercises
export async function getExercises(): Promise<TableRow<"exercises">[]> {
  return getTable("exercises");
}

export async function getExercise(id: string): Promise<TableRow<"exercises"> | null> {
  return getTableById("exercises", id);
}

export async function createExercise(exercise: Omit<TableRow<"exercises">, 'id' | 'created_at'>): Promise<TableRow<"exercises"> | null> {
  return createTable("exercises", exercise);
}

export async function updateExercise(id: string, exercise: Partial<TableRow<"exercises">>): Promise<TableRow<"exercises"> | null> {
  return updateTableById("exercises", id, exercise);
}

export async function deleteExercise(id: string): Promise<boolean> {
  return deleteTableById("exercises", id);
}

// Adding missing function - getRecentCheckIns
export async function getRecentCheckIns(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('checkins')
      .select(`
        *,
        members (
          name,
          plan,
          status
        )
      `)
      .order('check_time', { ascending: false })
      .limit(20);

    if (error) {
      console.error("Error fetching check-ins:", error);
      return [];
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching check-ins:", error);
    return [];
  }
}

// Adding missing function - recordCheckIn
export async function recordCheckIn(data: { member_id: string, check_type: string }): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('checkins')
      .insert({
        ...data,
        check_time: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error recording check-in:", error);
    throw error;
  }
}

// Specific functions for checkins
export async function getCheckins(): Promise<TableRow<"checkins">[]> {
  try {
    const { data, error } = await supabase
      .from('checkins')
      .select(`
        *,
        members (
          name,
          plan,
          status
        )
      `);

    if (error) {
      console.error("Error fetching check-ins:", error);
      return [];
    }

    return data as TableRow<"checkins">[];
  } catch (error) {
    console.error("Unexpected error fetching check-ins:", error);
    return [];
  }
}

export async function getCheckin(id: string): Promise<TableRow<"checkins"> | null> {
  return getTableById("checkins", id);
}

export async function createCheckin(checkin: Omit<TableRow<"checkins">, 'id' | 'created_at'>): Promise<TableRow<"checkins"> | null> {
  return createTable("checkins", checkin);
}

export async function updateCheckin(id: string, checkin: Partial<TableRow<"checkins">>): Promise<TableRow<"checkins"> | null> {
  return updateTableById("checkins", id, checkin);
}

export async function deleteCheckin(id: string): Promise<boolean> {
  return deleteTableById("checkins", id);
}

// Specific functions for settings
export async function getSettings(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) {
      console.error("Error fetching settings:", error);
      return {};
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching settings:", error);
    return {};
  }
}

export async function getSetting(id: string): Promise<TableRow<"settings"> | null> {
  return getTableById("settings", id);
}

export async function createSetting(setting: Omit<TableRow<"settings">, 'id' | 'created_at' | 'updated_at'>): Promise<TableRow<"settings"> | null> {
  return createTable("settings", setting);
}

export async function updateSetting(id: string, setting: Partial<TableRow<"settings">>): Promise<TableRow<"settings"> | null> {
  return updateTableById("settings", id, setting);
}

// Adding alias for updateSettings to match function calls
export const updateSettings = updateSetting;

export async function deleteSetting(id: string): Promise<boolean> {
  return deleteTableById("settings", id);
}

// Adding missing settings functions
export async function getNotificationSettings(): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('notification_settings')
      .select('*')
      .single();

    if (error) {
      console.error("Error fetching notification settings:", error);
      return {};
    }

    return data;
  } catch (error) {
    console.error("Unexpected error fetching notification settings:", error);
    return {};
  }
}

export async function updateNotificationSettings(settings: Partial<TableRow<"notification_settings">>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notification_settings')
      .update(settings)
      .eq('id', 1);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
}

// Adding missing app_users functions
export async function getAppUsers(): Promise<TableRow<"app_users">[]> {
  return getTable("app_users");
}

export async function createAppUser(userData: Omit<TableRow<"app_users">, 'id' | 'created_at'>): Promise<TableRow<"app_users"> | null> {
  return createTable("app_users", userData);
}

export async function updateAppUser(id: string, userData: Partial<TableRow<"app_users">>): Promise<TableRow<"app_users"> | null> {
  return updateTableById("app_users", id, userData);
}
