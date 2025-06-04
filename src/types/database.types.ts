
export interface DatabaseSchema {
  members: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    plan?: string;
    plan_id?: string;
    status?: string;
    join_date?: string;
    end_date?: string;
    avatar_url?: string;
    created_at?: string;
  };
  
  classes: {
    id: string;
    title: string;
    instructor: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
    max_participants?: number;
    color?: string;
    created_at?: string;
  };
  
  reservations: {
    id: string;
    class_id: string;
    member_id: string;
    status?: string;
    created_at?: string;
  };
  
  payments: {
    id: string;
    reference_id?: string;
    member_id: string;
    amount: number;
    plan: string;
    method: string;
    status?: string;
    payment_date?: string;
    created_at?: string;
  };
  
  exercises: {
    id: string;
    name: string;
    muscle_group: string;
    description?: string;
    created_at?: string;
  };
  
  workouts: {
    id: string;
    name: string;
    description?: string;
    created_at?: string;
  };
  
  workout_exercises: {
    id: string;
    workout_id: string;
    exercise_id: string;
    sets?: number;
    reps?: string;
    created_at?: string;
    exercises?: {
      id: string;
      name: string;
      muscle_group: string;
      description?: string;
    };
  };
  
  member_workouts: {
    id: string;
    member_id: string;
    workout_id: string;
    assigned_date?: string;
    progress?: number;
    created_at?: string;
    workouts?: {
      id: string;
      name: string;
      description?: string;
    };
  };
  
  checkins: {
    id: string;
    member_id: string;
    check_type: string;
    check_time?: string;
    created_at?: string;
    members?: {
      name?: string;
      plan?: string;
      status?: string;
    };
  };
  
  settings: {
    id: number;
    gym_name?: string;
    address?: string;
    phone?: string;
    email?: string;
    business_hours?: string;
    mpesa_enabled?: boolean;
    mpesa_number?: string;
    emola_enabled?: boolean;
    emola_number?: string;
    netshop_enabled?: boolean;
    netshop_id?: string;
    cash_enabled?: boolean;
    payment_reminder_days?: number;
    auto_backup?: boolean;
    created_at?: string;
    updated_at?: string;
    stripe_secret_key?: string;
    stripe_publishable_key?: string;
  };
  
  app_users: {
    id: string;
    name: string;
    email: string;
    role?: string;
    status?: string;
    created_at?: string;
    last_login?: string;
  };
  
  notification_settings: {
    id: number;
    email_notifications?: boolean;
    sms_notifications?: boolean;
    payment_reminders?: boolean;
    class_reminders?: boolean;
    marketing_messages?: boolean;
    created_at?: string;
    updated_at?: string;
  };

  plans: {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration_days: number;
    features?: any;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  };

  profiles: {
    id: string;
    name: string;
    email: string;
    password: string; // Added password field
    role: string;
    status: string;
    created_at?: string;
    updated_at?: string;
  };

  roles: {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    created_at?: string;
    updated_at?: string;
  };
}

export type Tables = keyof DatabaseSchema;
export type TableRow<T extends Tables> = DatabaseSchema[T];
