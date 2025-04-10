import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DatabaseSchema, Tables, TableRow } from "@/types/database.types";

// Member related functions
export async function getMembers(search = "") {
  try {
    let query = supabase.from("members").select("*");
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    
    const { data, error } = await query.order("name");
    
    if (error) {
      throw error;
    }
    
    return data as TableRow<"members">[];
  } catch (error) {
    console.error("Error fetching members:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter a lista de utentes.",
      variant: "destructive"
    });
    return [];
  }
}

export async function getMemberById(id: string) {
  try {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as TableRow<"members"> | null;
  } catch (error) {
    console.error("Error fetching member details:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter os detalhes do utente.",
      variant: "destructive"
    });
    return null;
  }
}

export async function createMember(memberData: Partial<TableRow<"members">>) {
  try {
    // Ensure required fields are present
    if (!memberData.name || !memberData.email) {
      throw new Error("Name and email are required");
    }
    
    const { data, error } = await supabase
      .from("members")
      .insert([memberData as { name: string; email: string }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Utente criado com sucesso."
    });
    
    return data as TableRow<"members"> | null;
  } catch (error) {
    console.error("Error creating member:", error);
    toast({
      title: "Erro",
      description: "Não foi possível criar o utente.",
      variant: "destructive"
    });
    return null;
  }
}

export async function updateMember(id: string, memberData: Partial<TableRow<"members">>) {
  try {
    const { data, error } = await supabase
      .from("members")
      .update(memberData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Dados do utente atualizados com sucesso."
    });
    
    return data as TableRow<"members"> | null;
  } catch (error) {
    console.error("Error updating member:", error);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar os dados do utente.",
      variant: "destructive"
    });
    return null;
  }
}

// Class/Schedule related functions
export async function getClasses() {
  try {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data as TableRow<"classes">[];
  } catch (error) {
    console.error("Error fetching classes:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter a lista de aulas.",
      variant: "destructive"
    });
    return [];
  }
}

export async function createClass(classData: Partial<TableRow<"classes">>) {
  try {
    // Ensure required fields are present
    if (!classData.title || !classData.instructor || !classData.day_of_week || 
        !classData.start_time || !classData.end_time) {
      throw new Error("Title, instructor, day of week, start time, and end time are required");
    }
    
    const { data, error } = await supabase
      .from("classes")
      .insert([{
        title: classData.title,
        instructor: classData.instructor,
        day_of_week: classData.day_of_week,
        start_time: classData.start_time,
        end_time: classData.end_time,
        max_participants: classData.max_participants,
        color: classData.color
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Aula criada com sucesso."
    });
    
    return data as TableRow<"classes"> | null;
  } catch (error) {
    console.error("Error creating class:", error);
    toast({
      title: "Erro",
      description: "Não foi possível criar a aula.",
      variant: "destructive"
    });
    return null;
  }
}

export async function createReservation(reservationData: Partial<TableRow<"reservations">>) {
  try {
    // Ensure required fields are present
    if (!reservationData.class_id || !reservationData.member_id) {
      throw new Error("Class ID and member ID are required");
    }
    
    const { data, error } = await supabase
      .from("reservations")
      .insert([{
        class_id: reservationData.class_id,
        member_id: reservationData.member_id,
        status: reservationData.status
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Reserva efetuada com sucesso."
    });
    
    return data as TableRow<"reservations"> | null;
  } catch (error) {
    console.error("Error creating reservation:", error);
    toast({
      title: "Erro",
      description: "Não foi possível efetuar a reserva.",
      variant: "destructive"
    });
    return null;
  }
}

// Payment related functions
export async function getPayments(search = "") {
  try {
    let query = supabase.from("payments").select(`
      *,
      members (name, email)
    `);
    
    if (search) {
      query = query.or(`members.name.ilike.%${search}%,reference_id.ilike.%${search}%,method.ilike.%${search}%`);
    }
    
    const { data, error } = await query.order("created_at", { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data as (TableRow<"payments"> & { members: { name: string, email: string } })[];
  } catch (error) {
    console.error("Error fetching payments:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter a lista de pagamentos.",
      variant: "destructive"
    });
    return [];
  }
}

export async function getPaymentById(id: string) {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select(`
        *,
        members (name, email, phone)
      `)
      .eq("id", id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as (TableRow<"payments"> & { members: { name: string, email: string, phone?: string } }) | null;
  } catch (error) {
    console.error("Error fetching payment details:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter os detalhes do pagamento.",
      variant: "destructive"
    });
    return null;
  }
}

export async function createPayment(paymentData: Partial<TableRow<"payments">>) {
  try {
    // Ensure required fields are present
    if (!paymentData.member_id || !paymentData.amount || !paymentData.method || !paymentData.plan) {
      throw new Error("Member ID, amount, method, and plan are required");
    }
    
    const referenceId = `P${Math.floor(Math.random() * 9000) + 1000}`;
    
    const { data, error } = await supabase
      .from("payments")
      .insert([{ 
        member_id: paymentData.member_id,
        amount: paymentData.amount,
        method: paymentData.method,
        plan: paymentData.plan,
        reference_id: referenceId,
        status: paymentData.status,
        payment_date: paymentData.payment_date
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Pagamento registrado com sucesso."
    });
    
    return data as TableRow<"payments"> | null;
  } catch (error) {
    console.error("Error creating payment:", error);
    toast({
      title: "Erro",
      description: "Não foi possível registrar o pagamento.",
      variant: "destructive"
    });
    return null;
  }
}

export async function updatePayment(id: string, paymentData: Partial<TableRow<"payments">>) {
  try {
    const { data, error } = await supabase
      .from("payments")
      .update(paymentData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Pagamento atualizado com sucesso."
    });
    
    return data as TableRow<"payments"> | null;
  } catch (error) {
    console.error("Error updating payment:", error);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar o pagamento.",
      variant: "destructive"
    });
    return null;
  }
}

// Exercise and workout related functions
export async function getExercises(search = "") {
  try {
    let query = supabase.from("exercises").select("*");
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,muscle_group.ilike.%${search}%`);
    }
    
    const { data, error } = await query.order("name");
    
    if (error) {
      throw error;
    }
    
    return data as TableRow<"exercises">[];
  } catch (error) {
    console.error("Error fetching exercises:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter a lista de exercícios.",
      variant: "destructive"
    });
    return [];
  }
}

export async function createExercise(exerciseData: Partial<TableRow<"exercises">>) {
  try {
    // Ensure required fields are present
    if (!exerciseData.name || !exerciseData.muscle_group) {
      throw new Error("Name and muscle group are required");
    }
    
    const { data, error } = await supabase
      .from("exercises")
      .insert([{
        name: exerciseData.name,
        muscle_group: exerciseData.muscle_group,
        description: exerciseData.description
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Exercício criado com sucesso."
    });
    
    return data as TableRow<"exercises"> | null;
  } catch (error) {
    console.error("Error creating exercise:", error);
    toast({
      title: "Erro",
      description: "Não foi possível criar o exercício.",
      variant: "destructive"
    });
    return null;
  }
}

export async function getWorkouts() {
  try {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .order("name");
    
    if (error) {
      throw error;
    }
    
    return data as TableRow<"workouts">[];
  } catch (error) {
    console.error("Error fetching workouts:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter a lista de treinos.",
      variant: "destructive"
    });
    return [];
  }
}

export async function getWorkoutDetails(id: string) {
  try {
    const { data, error } = await supabase
      .from("workouts")
      .select(`
        *,
        workout_exercises (
          id,
          sets,
          reps,
          exercises (id, name, muscle_group, description)
        )
      `)
      .eq("id", id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as (TableRow<"workouts"> & { workout_exercises: any[] }) | null;
  } catch (error) {
    console.error("Error fetching workout details:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter os detalhes do treino.",
      variant: "destructive"
    });
    return null;
  }
}

export async function createWorkout(workoutData: { name: string; description?: string }, exercises: any[]) {
  try {
    // First, insert the workout
    const { data: workout, error: workoutError } = await supabase
      .from("workouts")
      .insert([{ name: workoutData.name, description: workoutData.description }])
      .select()
      .single();
    
    if (workoutError) {
      throw workoutError;
    }
    
    // Then, insert the exercises for this workout
    if (exercises && exercises.length > 0 && workout) {
      const workoutExercises = exercises.map(ex => ({
        workout_id: workout.id,
        exercise_id: ex.exercise_id,
        sets: ex.sets,
        reps: ex.reps
      }));
      
      const { error: exercisesError } = await supabase
        .from("workout_exercises")
        .insert(workoutExercises);
      
      if (exercisesError) {
        throw exercisesError;
      }
    }
    
    toast({
      title: "Sucesso",
      description: "Treino criado com sucesso."
    });
    
    return workout as TableRow<"workouts"> | null;
  } catch (error) {
    console.error("Error creating workout:", error);
    toast({
      title: "Erro",
      description: "Não foi possível criar o treino.",
      variant: "destructive"
    });
    return null;
  }
}

export async function addExerciseToWorkout(workoutExerciseData: Partial<TableRow<"workout_exercises">>) {
  try {
    // Ensure required fields are present
    if (!workoutExerciseData.workout_id || !workoutExerciseData.exercise_id) {
      throw new Error("Workout ID and exercise ID are required");
    }
    
    const { data, error } = await supabase
      .from("workout_exercises")
      .insert([{
        workout_id: workoutExerciseData.workout_id,
        exercise_id: workoutExerciseData.exercise_id,
        sets: workoutExerciseData.sets,
        reps: workoutExerciseData.reps
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Exercício adicionado com sucesso."
    });
    
    return data as TableRow<"workout_exercises"> | null;
  } catch (error) {
    console.error("Error adding exercise to workout:", error);
    toast({
      title: "Erro",
      description: "Não foi possível adicionar o exercício ao treino.",
      variant: "destructive"
    });
    return null;
  }
}

export async function getMemberWorkouts(memberId: string) {
  try {
    const { data, error } = await supabase
      .from("member_workouts")
      .select(`
        *,
        workouts (
          id,
          name,
          description
        )
      `)
      .eq("member_id", memberId);
    
    if (error) {
      throw error;
    }
    
    return data as (TableRow<"member_workouts"> & { workouts: TableRow<"workouts"> })[];
  } catch (error) {
    console.error("Error fetching member workouts:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter os treinos do utente.",
      variant: "destructive"
    });
    return [];
  }
}

// Check-in related functions
export async function recordCheckIn(checkInData: Partial<TableRow<"checkins">>) {
  try {
    // Ensure required fields are present
    if (!checkInData.member_id || !checkInData.check_type) {
      throw new Error("Member ID and check type are required");
    }
    
    const { data, error } = await supabase
      .from("checkins")
      .insert([{
        member_id: checkInData.member_id,
        check_type: checkInData.check_type,
        check_time: checkInData.check_time
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Check-in registrado com sucesso."
    });
    
    return data as TableRow<"checkins"> | null;
  } catch (error) {
    console.error("Error recording check-in:", error);
    toast({
      title: "Erro",
      description: "Não foi possível registrar o check-in.",
      variant: "destructive"
    });
    return null;
  }
}

export async function getRecentCheckIns() {
  try {
    const { data, error } = await supabase
      .from("checkins")
      .select(`
        *,
        members (
          name,
          plan,
          status
        )
      `)
      .order("check_time", { ascending: false })
      .limit(10);
    
    if (error) {
      throw error;
    }
    
    return data as (TableRow<"checkins"> & { members: { name: string; plan?: string; status?: string } })[];
  } catch (error) {
    console.error("Error fetching recent check-ins:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter os check-ins recentes.",
      variant: "destructive"
    });
    return [];
  }
}

// Settings related functions
export async function getSettings() {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("id", 1)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as TableRow<"settings"> | null;
  } catch (error) {
    console.error("Error fetching settings:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter as configurações.",
      variant: "destructive"
    });
    return null;
  }
}

export async function updateSettings(settingsData: Partial<TableRow<"settings">>) {
  try {
    const { data, error } = await supabase
      .from("settings")
      .update(settingsData)
      .eq("id", 1)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Configurações atualizadas com sucesso."
    });
    
    return data as TableRow<"settings"> | null;
  } catch (error) {
    console.error("Error updating settings:", error);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar as configurações.",
      variant: "destructive"
    });
    return null;
  }
}

export async function getNotificationSettings() {
  try {
    const { data, error } = await supabase
      .from("notification_settings")
      .select("*")
      .eq("id", 1)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as TableRow<"notification_settings"> | null;
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter as configurações de notificação.",
      variant: "destructive"
    });
    return null;
  }
}

export async function updateNotificationSettings(settingsData: Partial<TableRow<"notification_settings">>) {
  try {
    const { data, error } = await supabase
      .from("notification_settings")
      .update(settingsData)
      .eq("id", 1)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Configurações de notificação atualizadas com sucesso."
    });
    
    return data as TableRow<"notification_settings"> | null;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar as configurações de notificação.",
      variant: "destructive"
    });
    return null;
  }
}

// App users (staff) related functions
export async function getAppUsers() {
  try {
    const { data, error } = await supabase
      .from("app_users")
      .select("*")
      .order("name");
    
    if (error) {
      throw error;
    }
    
    return data as TableRow<"app_users">[];
  } catch (error) {
    console.error("Error fetching app users:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter a lista de utilizadores.",
      variant: "destructive"
    });
    return [];
  }
}

export async function createAppUser(userData: Partial<TableRow<"app_users">>) {
  try {
    // Ensure required fields are present
    if (!userData.name || !userData.email) {
      throw new Error("Name and email are required");
    }
    
    const { data, error } = await supabase
      .from("app_users")
      .insert([{
        name: userData.name,
        email: userData.email,
        role: userData.role,
        status: userData.status
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Utilizador criado com sucesso."
    });
    
    return data as TableRow<"app_users"> | null;
  } catch (error) {
    console.error("Error creating app user:", error);
    toast({
      title: "Erro",
      description: "Não foi possível criar o utilizador.",
      variant: "destructive"
    });
    return null;
  }
}

export async function updateAppUser(id: string, userData: Partial<TableRow<"app_users">>) {
  try {
    const { data, error } = await supabase
      .from("app_users")
      .update(userData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Dados do utilizador atualizados com sucesso."
    });
    
    return data as TableRow<"app_users"> | null;
  } catch (error) {
    console.error("Error updating app user:", error);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar os dados do utilizador.",
      variant: "destructive"
    });
    return null;
  }
}

// Plan related functions
export async function getPlans() {
  try {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("price");
    
    if (error) {
      throw error;
    }
    
    return data as TableRow<"plans">[];
  } catch (error) {
    console.error("Error fetching plans:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter a lista de planos.",
      variant: "destructive"
    });
    return [];
  }
}

export async function getPlanById(id: string) {
  try {
    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data as TableRow<"plans"> | null;
  } catch (error) {
    console.error("Error fetching plan details:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter os detalhes do plano.",
      variant: "destructive"
    });
    return null;
  }
}

export async function createPlan(planData: Omit<TableRow<"plans">, "id" | "created_at" | "updated_at">) {
  try {
    const { data, error } = await supabase
      .from("plans")
      .insert([planData])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Plano criado com sucesso."
    });
    
    return data as TableRow<"plans"> | null;
  } catch (error) {
    console.error("Error creating plan:", error);
    toast({
      title: "Erro",
      description: "Não foi possível criar o plano.",
      variant: "destructive"
    });
    return null;
  }
}

export async function updatePlan(id: string, planData: Partial<TableRow<"plans">>) {
  try {
    // Add updated_at timestamp
    const updateData = {
      ...planData,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from("plans")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: "Plano atualizado com sucesso."
    });
    
    return data as TableRow<"plans"> | null;
  } catch (error) {
    console.error("Error updating plan:", error);
    toast({
      title: "Erro",
      description: "Não foi possível atualizar o plano.",
      variant: "destructive"
    });
    return null;
  }
}

export async function togglePlanStatus(id: string, isActive: boolean) {
  try {
    const { data, error } = await supabase
      .from("plans")
      .update({ 
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    toast({
      title: "Sucesso",
      description: isActive ? "Plano ativado com sucesso." : "Plano desativado com sucesso."
    });
    
    return data as TableRow<"plans"> | null;
  } catch (error) {
    console.error("Error toggling plan status:", error);
    toast({
      title: "Erro",
      description: "Não foi possível alterar o status do plano.",
      variant: "destructive"
    });
    return null;
  }
}

export async function getMembersWithPlan(planId: string) {
  try {
    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("plan_id", planId);
    
    if (error) {
      throw error;
    }
    
    return data as TableRow<"members">[];
  } catch (error) {
    console.error("Error fetching members with plan:", error);
    toast({
      title: "Erro",
      description: "Não foi possível obter a lista de utentes com este plano.",
      variant: "destructive"
    });
    return [];
  }
}
