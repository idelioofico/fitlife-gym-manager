
// Mock API implementation with localStorage persistence
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Local storage keys
const STORAGE_KEYS = {
  MEMBERS: 'fitlife_members',
  CLASSES: 'fitlife_classes',
  PLANS: 'fitlife_plans',
  PAYMENTS: 'fitlife_payments',
  RESERVATIONS: 'fitlife_reservations',
  EXERCISES: 'fitlife_exercises',
  WORKOUTS: 'fitlife_workouts',
  WORKOUT_EXERCISES: 'fitlife_workout_exercises',
  MEMBER_WORKOUTS: 'fitlife_member_workouts',
  CHECKINS: 'fitlife_checkins',
  SETTINGS: 'fitlife_settings',
  NOTIFICATION_SETTINGS: 'fitlife_notification_settings',
  PROFILES: 'fitlife_profiles',
  ROLES: 'fitlife_roles',
  APP_USERS: 'fitlife_app_users'
};

// Utility functions for localStorage
const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveToStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

const generateId = (): string => crypto.randomUUID();

// Initialize default data
const initializeDefaultData = () => {
  // Initialize settings if not exists
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    const defaultSettings = {
      id: 1,
      gym_name: 'FitLife Academy',
      address: '',
      phone: '',
      email: '',
      business_hours: '',
      mpesa_enabled: true,
      emola_enabled: true,
      netshop_enabled: true,
      cash_enabled: true,
      payment_reminder_days: 5,
      auto_backup: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(defaultSettings));
  }

  // Initialize notification settings if not exists
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS)) {
    const defaultNotificationSettings = {
      id: 1,
      email_notifications: true,
      sms_notifications: true,
      payment_reminders: true,
      class_reminders: true,
      marketing_messages: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(defaultNotificationSettings));
  }

  // Initialize default plans if not exists
  if (!getFromStorage(STORAGE_KEYS.PLANS).length) {
    const defaultPlans = [
      {
        id: generateId(),
        name: 'Básico',
        description: 'Plano básico com acesso ao ginásio',
        price: 1500,
        duration_days: 30,
        features: ['Acesso ao ginásio', 'Vestiários'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Premium',
        description: 'Plano premium com todas as funcionalidades',
        price: 2500,
        duration_days: 30,
        features: ['Acesso ao ginásio', 'Vestiários', 'Aulas de grupo', 'Personal trainer'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    saveToStorage(STORAGE_KEYS.PLANS, defaultPlans);
  }

  // Initialize default exercises if not exists
  if (!getFromStorage(STORAGE_KEYS.EXERCISES).length) {
    const defaultExercises = [
      {
        id: generateId(),
        name: 'Supino',
        muscle_group: 'Peito',
        description: 'Exercício para desenvolvimento do peito',
        created_at: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Agachamento',
        muscle_group: 'Pernas',
        description: 'Exercício para desenvolvimento das pernas',
        created_at: new Date().toISOString()
      }
    ];
    saveToStorage(STORAGE_KEYS.EXERCISES, defaultExercises);
  }
};

// Mock API class
export class MockApi {
  constructor() {
    initializeDefaultData();
  }

  // Members API
  async getMembers(searchTerm?: string): Promise<any[]> {
    const members = getFromStorage(STORAGE_KEYS.MEMBERS);
    if (!searchTerm) return members;
    
    return members.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.phone && member.phone.includes(searchTerm))
    );
  }

  async getMember(id: string): Promise<any | null> {
    const members = getFromStorage(STORAGE_KEYS.MEMBERS);
    return members.find(member => member.id === id) || null;
  }

  async getMembersWithPlan(planId: string): Promise<any[]> {
    const members = getFromStorage(STORAGE_KEYS.MEMBERS);
    return members.filter(member => member.plan_id === planId);
  }

  async createMember(memberData: any): Promise<any> {
    const members = getFromStorage(STORAGE_KEYS.MEMBERS);
    const newMember = {
      id: generateId(),
      ...memberData,
      created_at: new Date().toISOString()
    };
    members.push(newMember);
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
    return newMember;
  }

  async updateMember(id: string, memberData: any): Promise<any> {
    const members = getFromStorage(STORAGE_KEYS.MEMBERS);
    const index = members.findIndex(member => member.id === id);
    if (index === -1) throw new Error('Member not found');
    
    members[index] = { ...members[index], ...memberData };
    saveToStorage(STORAGE_KEYS.MEMBERS, members);
    return members[index];
  }

  async deleteMember(id: string): Promise<boolean> {
    const members = getFromStorage(STORAGE_KEYS.MEMBERS);
    const filteredMembers = members.filter(member => member.id !== id);
    saveToStorage(STORAGE_KEYS.MEMBERS, filteredMembers);
    return true;
  }

  // Plans API
  async getPlans(): Promise<any[]> {
    return getFromStorage(STORAGE_KEYS.PLANS);
  }

  async getPlan(id: string): Promise<any | null> {
    const plans = getFromStorage(STORAGE_KEYS.PLANS);
    return plans.find(plan => plan.id === id) || null;
  }

  async createPlan(planData: any): Promise<any> {
    const plans = getFromStorage(STORAGE_KEYS.PLANS);
    const newPlan = {
      id: generateId(),
      ...planData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    plans.push(newPlan);
    saveToStorage(STORAGE_KEYS.PLANS, plans);
    return newPlan;
  }

  async updatePlan(id: string, planData: any): Promise<any> {
    const plans = getFromStorage(STORAGE_KEYS.PLANS);
    const index = plans.findIndex(plan => plan.id === id);
    if (index === -1) throw new Error('Plan not found');
    
    plans[index] = { 
      ...plans[index], 
      ...planData, 
      updated_at: new Date().toISOString() 
    };
    saveToStorage(STORAGE_KEYS.PLANS, plans);
    return plans[index];
  }

  async togglePlanStatus(id: string, isActive: boolean): Promise<boolean> {
    return this.updatePlan(id, { is_active: isActive });
  }

  // Classes API
  async getClasses(): Promise<any[]> {
    return getFromStorage(STORAGE_KEYS.CLASSES);
  }

  async getClass(id: string): Promise<any | null> {
    const classes = getFromStorage(STORAGE_KEYS.CLASSES);
    return classes.find(cls => cls.id === id) || null;
  }

  async createClass(classData: any): Promise<any> {
    const classes = getFromStorage(STORAGE_KEYS.CLASSES);
    const newClass = {
      id: generateId(),
      ...classData,
      created_at: new Date().toISOString()
    };
    classes.push(newClass);
    saveToStorage(STORAGE_KEYS.CLASSES, classes);
    return newClass;
  }

  async updateClass(id: string, classData: any): Promise<any> {
    const classes = getFromStorage(STORAGE_KEYS.CLASSES);
    const index = classes.findIndex(cls => cls.id === id);
    if (index === -1) throw new Error('Class not found');
    
    classes[index] = { ...classes[index], ...classData };
    saveToStorage(STORAGE_KEYS.CLASSES, classes);
    return classes[index];
  }

  async deleteClass(id: string): Promise<boolean> {
    const classes = getFromStorage(STORAGE_KEYS.CLASSES);
    const filteredClasses = classes.filter(cls => cls.id !== id);
    saveToStorage(STORAGE_KEYS.CLASSES, filteredClasses);
    return true;
  }

  // Reservations API
  async createReservation(reservationData: any): Promise<any> {
    const reservations = getFromStorage(STORAGE_KEYS.RESERVATIONS);
    const newReservation = {
      id: generateId(),
      ...reservationData,
      status: 'Confirmado',
      created_at: new Date().toISOString()
    };
    reservations.push(newReservation);
    saveToStorage(STORAGE_KEYS.RESERVATIONS, reservations);
    return newReservation;
  }

  // Payments API
  async getPayments(searchTerm?: string): Promise<any[]> {
    const payments = getFromStorage(STORAGE_KEYS.PAYMENTS);
    const members = getFromStorage(STORAGE_KEYS.MEMBERS);
    
    // Join with member data
    const paymentsWithMembers = payments.map(payment => {
      const member = members.find(m => m.id === payment.member_id);
      return {
        ...payment,
        member_name: member?.name || '',
        member_email: member?.email || '',
        members: member ? { name: member.name, email: member.email, phone: member.phone } : null
      };
    });

    if (!searchTerm) return paymentsWithMembers;
    
    return paymentsWithMembers.filter(payment =>
      payment.reference_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.member_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  async getPayment(id: string): Promise<any | null> {
    const payments = getFromStorage(STORAGE_KEYS.PAYMENTS);
    return payments.find(payment => payment.id === id) || null;
  }

  async createPayment(paymentData: any): Promise<any> {
    const payments = getFromStorage(STORAGE_KEYS.PAYMENTS);
    const newPayment = {
      id: generateId(),
      ...paymentData,
      created_at: new Date().toISOString()
    };
    payments.push(newPayment);
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
    return newPayment;
  }

  async updatePayment(id: string, paymentData: any): Promise<any> {
    const payments = getFromStorage(STORAGE_KEYS.PAYMENTS);
    const index = payments.findIndex(payment => payment.id === id);
    if (index === -1) throw new Error('Payment not found');
    
    payments[index] = { ...payments[index], ...paymentData };
    saveToStorage(STORAGE_KEYS.PAYMENTS, payments);
    return payments[index];
  }

  async deletePayment(id: string): Promise<boolean> {
    const payments = getFromStorage(STORAGE_KEYS.PAYMENTS);
    const filteredPayments = payments.filter(payment => payment.id !== id);
    saveToStorage(STORAGE_KEYS.PAYMENTS, filteredPayments);
    return true;
  }

  // Check-ins API
  async getRecentCheckIns(): Promise<any[]> {
    const checkins = getFromStorage(STORAGE_KEYS.CHECKINS);
    const members = getFromStorage(STORAGE_KEYS.MEMBERS);
    
    return checkins.map(checkin => {
      const member = members.find(m => m.id === checkin.member_id);
      return {
        ...checkin,
        member_name: member?.name || '',
        plan: member?.plan || '',
        member_status: member?.status || ''
      };
    }).slice(0, 20);
  }

  async recordCheckIn(data: any): Promise<boolean> {
    const checkins = getFromStorage(STORAGE_KEYS.CHECKINS);
    const newCheckin = {
      id: generateId(),
      ...data,
      check_time: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    checkins.push(newCheckin);
    saveToStorage(STORAGE_KEYS.CHECKINS, checkins);
    return true;
  }

  async getCheckins(): Promise<any[]> {
    return getFromStorage(STORAGE_KEYS.CHECKINS);
  }

  // Settings API
  async getSettings(): Promise<any> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  }

  async updateSettings(settings: any): Promise<any> {
    const currentSettings = this.getSettings();
    const updatedSettings = {
      ...currentSettings,
      ...settings,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
    return updatedSettings;
  }

  // Notification settings API
  async getNotificationSettings(): Promise<any> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS) || '{}');
  }

  async updateNotificationSettings(settings: any): Promise<any> {
    const currentSettings = this.getNotificationSettings();
    const updatedSettings = {
      ...currentSettings,
      ...settings,
      updated_at: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, JSON.stringify(updatedSettings));
    return updatedSettings;
  }

  // Exercises API
  async getExercises(): Promise<any[]> {
    return getFromStorage(STORAGE_KEYS.EXERCISES);
  }

  async createExercise(exerciseData: any): Promise<any> {
    const exercises = getFromStorage(STORAGE_KEYS.EXERCISES);
    const newExercise = {
      id: generateId(),
      ...exerciseData,
      created_at: new Date().toISOString()
    };
    exercises.push(newExercise);
    saveToStorage(STORAGE_KEYS.EXERCISES, exercises);
    return newExercise;
  }

  // Workouts API
  async getWorkouts(): Promise<any[]> {
    return getFromStorage(STORAGE_KEYS.WORKOUTS);
  }

  async createWorkout(workoutData: any, exercises: any[]): Promise<any> {
    const workouts = getFromStorage(STORAGE_KEYS.WORKOUTS);
    const workoutExercises = getFromStorage(STORAGE_KEYS.WORKOUT_EXERCISES);
    
    const newWorkout = {
      id: generateId(),
      ...workoutData,
      created_at: new Date().toISOString()
    };
    workouts.push(newWorkout);
    saveToStorage(STORAGE_KEYS.WORKOUTS, workouts);

    // Add exercises to workout
    exercises.forEach(exercise => {
      const newWorkoutExercise = {
        id: generateId(),
        workout_id: newWorkout.id,
        ...exercise,
        created_at: new Date().toISOString()
      };
      workoutExercises.push(newWorkoutExercise);
    });
    saveToStorage(STORAGE_KEYS.WORKOUT_EXERCISES, workoutExercises);

    return newWorkout;
  }

  async getWorkoutDetails(workoutId: string): Promise<any> {
    const workouts = getFromStorage(STORAGE_KEYS.WORKOUTS);
    const workoutExercises = getFromStorage(STORAGE_KEYS.WORKOUT_EXERCISES);
    const exercises = getFromStorage(STORAGE_KEYS.EXERCISES);
    
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout) return null;

    const relatedWorkoutExercises = workoutExercises
      .filter(we => we.workout_id === workoutId)
      .map(we => {
        const exercise = exercises.find(e => e.id === we.exercise_id);
        return {
          ...we,
          exercises: exercise ? {
            id: exercise.id,
            name: exercise.name,
            muscle_group: exercise.muscle_group,
            description: exercise.description
          } : null
        };
      });

    return {
      ...workout,
      workout_exercises: relatedWorkoutExercises
    };
  }

  async addExerciseToWorkout(data: any): Promise<boolean> {
    const workoutExercises = getFromStorage(STORAGE_KEYS.WORKOUT_EXERCISES);
    const newWorkoutExercise = {
      id: generateId(),
      ...data,
      created_at: new Date().toISOString()
    };
    workoutExercises.push(newWorkoutExercise);
    saveToStorage(STORAGE_KEYS.WORKOUT_EXERCISES, workoutExercises);
    return true;
  }

  async getMemberWorkouts(memberId: string): Promise<any[]> {
    const memberWorkouts = getFromStorage(STORAGE_KEYS.MEMBER_WORKOUTS);
    const workouts = getFromStorage(STORAGE_KEYS.WORKOUTS);
    
    return memberWorkouts
      .filter(mw => mw.member_id === memberId)
      .map(mw => {
        const workout = workouts.find(w => w.id === mw.workout_id);
        return {
          ...mw,
          workout_name: workout?.name || '',
          workout_description: workout?.description || ''
        };
      });
  }

  // Profiles API
  async getProfiles(): Promise<any[]> {
    return getFromStorage(STORAGE_KEYS.PROFILES);
  }

  async updateProfile(id: string, profileData: any): Promise<any> {
    const profiles = getFromStorage(STORAGE_KEYS.PROFILES);
    const index = profiles.findIndex(profile => profile.id === id);
    if (index === -1) throw new Error('Profile not found');
    
    profiles[index] = {
      ...profiles[index],
      ...profileData,
      updated_at: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.PROFILES, profiles);
    return profiles[index];
  }

  // Roles API
  async getRoles(): Promise<any[]> {
    return getFromStorage(STORAGE_KEYS.ROLES);
  }

  async createRole(roleData: any): Promise<any> {
    const roles = getFromStorage(STORAGE_KEYS.ROLES);
    const newRole = {
      id: generateId(),
      ...roleData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    roles.push(newRole);
    saveToStorage(STORAGE_KEYS.ROLES, roles);
    return newRole;
  }

  async updateRole(id: string, roleData: any): Promise<any> {
    const roles = getFromStorage(STORAGE_KEYS.ROLES);
    const index = roles.findIndex(role => role.id === id);
    if (index === -1) throw new Error('Role not found');
    
    roles[index] = {
      ...roles[index],
      ...roleData,
      updated_at: new Date().toISOString()
    };
    saveToStorage(STORAGE_KEYS.ROLES, roles);
    return roles[index];
  }

  async deleteRole(id: string): Promise<boolean> {
    const roles = getFromStorage(STORAGE_KEYS.ROLES);
    const filteredRoles = roles.filter(role => role.id !== id);
    saveToStorage(STORAGE_KEYS.ROLES, filteredRoles);
    return true;
  }

  // App Users API
  async getAppUsers(): Promise<any[]> {
    return getFromStorage(STORAGE_KEYS.APP_USERS);
  }

  async createAppUser(userData: any): Promise<any> {
    const appUsers = getFromStorage(STORAGE_KEYS.APP_USERS);
    const newUser = {
      id: generateId(),
      ...userData,
      created_at: new Date().toISOString()
    };
    appUsers.push(newUser);
    saveToStorage(STORAGE_KEYS.APP_USERS, appUsers);
    return newUser;
  }

  async updateAppUser(id: string, userData: any): Promise<any> {
    const appUsers = getFromStorage(STORAGE_KEYS.APP_USERS);
    const index = appUsers.findIndex(user => user.id === id);
    if (index === -1) throw new Error('User not found');
    
    appUsers[index] = { ...appUsers[index], ...userData };
    saveToStorage(STORAGE_KEYS.APP_USERS, appUsers);
    return appUsers[index];
  }

  async createUserAsAdmin(userData: any): Promise<any> {
    // For demo purposes, just create a profile
    const profiles = getFromStorage(STORAGE_KEYS.PROFILES);
    const newProfile = {
      id: generateId(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    profiles.push(newProfile);
    saveToStorage(STORAGE_KEYS.PROFILES, profiles);
    return { user: newProfile, token: null, error: null };
  }

  // Auth functions for compatibility
  async getCurrentUser(): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) return null;
      
      return {
        id: payload.id,
        email: payload.email,
        name: payload.name || payload.email,
        role: payload.role,
        status: 'active'
      };
    } catch {
      return null;
    }
  }

  async getCurrentUserProfile(): Promise<any> {
    return this.getCurrentUser();
  }
}

// Export singleton instance
export const mockApi = new MockApi();
