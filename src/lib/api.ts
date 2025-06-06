import { DatabaseSchema } from '@/types/database';
import dotenv from 'dotenv';

const API_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';


dotenv.config();

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('auth_token');

// Auth functions
export const signIn = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Invalid credentials');
  return response.json();
};

// Dashboard functions
export const getDashboardStats = async () => {
  const response = await fetch(`${API_URL}/dashboard/stats`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return response.json();
};

// Member functions
export const getMembers = async () => {
  const response = await fetch(`${API_URL}/members`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch members');
  return response.json();
};

export const getMemberById = async (id: number) => {
  const response = await fetch(`${API_URL}/members/${id}`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch member');
  return response.json();
};

export const createMember = async (member: Partial<DatabaseSchema['members']>) => {
  const response = await fetch(`${API_URL}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(member),
  });
  if (!response.ok) throw new Error('Failed to create member');
  return response.json();
};

export const updateMember = async (id: number, member: Partial<DatabaseSchema['members']>) => {
  const response = await fetch(`${API_URL}/members/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(member),
  });
  if (!response.ok) throw new Error('Failed to update member');
  return response.json();
};

// Plan functions
export const getPlans = async () => {
  const response = await fetch(`${API_URL}/plans`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch plans');
  return response.json();
};

export const createPlan = async (plan: Partial<DatabaseSchema['plans']>) => {
  const response = await fetch(`${API_URL}/plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(plan),
  });
  if (!response.ok) throw new Error('Failed to create plan');
  return response.json();
};

export const updatePlan = async (id: number, plan: Partial<DatabaseSchema['plans']>) => {
  const response = await fetch(`${API_URL}/plans/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(plan),
  });
  if (!response.ok) throw new Error('Failed to update plan');
  return response.json();
};

export const togglePlanStatus = async (id: number) => {
  const response = await fetch(`${API_URL}/plans/${id}/toggle`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to toggle plan status');
  return response.json();
};

// Payment functions
export const getPayments = async () => {
  const response = await fetch(`${API_URL}/payments`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch payments');
  return response.json();
};

export const getPaymentById = async (id: number) => {
  const response = await fetch(`${API_URL}/payments/${id}`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch payment');
  return response.json();
};

export const createPayment = async (payment: Partial<DatabaseSchema['payments']>) => {
  const response = await fetch(`${API_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(payment),
  });
  if (!response.ok) throw new Error('Failed to create payment');
  return response.json();
};

export const updatePayment = async (id: number, payment: Partial<DatabaseSchema['payments']>) => {
  const response = await fetch(`${API_URL}/payments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(payment),
  });
  if (!response.ok) throw new Error('Failed to update payment');
  return response.json();
};

// Schedule functions
export const getClasses = async () => {
  const response = await fetch(`${API_URL}/schedules`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch classes');
  return response.json();
};

export const createClass = async (classData: Partial<DatabaseSchema['classes']>) => {
  const response = await fetch(`${API_URL}/schedules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(classData),
  });
  if (!response.ok) throw new Error('Failed to create class');
  return response.json();
};

export const updateClass = async (id: number, classData: Partial<DatabaseSchema['classes']>) => {
  const response = await fetch(`${API_URL}/schedules/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(classData),
  });
  if (!response.ok) throw new Error('Failed to update class');
  return response.json();
};

export const createReservation = async (reservation: Partial<DatabaseSchema['reservations']>) => {
  const response = await fetch(`${API_URL}/schedules/reservations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(reservation),
  });
  if (!response.ok) throw new Error('Failed to create reservation');
  return response.json();
};

// Workout functions
export const getWorkouts = async () => {
  const response = await fetch(`${API_URL}/workouts`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch workouts');
  return response.json();
};

export const getWorkoutDetails = async (id: number) => {
  const response = await fetch(`${API_URL}/workouts/${id}`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch workout details');
  return response.json();
};

export const createWorkout = async (workout: Partial<DatabaseSchema['workouts']> & { exercises: Array<{ exercise_id: string; sets: number; reps: string }> }) => {
  const response = await fetch(`${API_URL}/workouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(workout),
  });
  if (!response.ok) throw new Error('Failed to create workout');
  return response.json();
};

export const getExercises = async () => {
  const response = await fetch(`${API_URL}/exercises`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch exercises');
  return response.json();
};

export const createExercise = async (exercise: Partial<DatabaseSchema['exercises']>) => {
  const response = await fetch(`${API_URL}/exercises`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(exercise),
  });
  if (!response.ok) throw new Error('Failed to create exercise');
  return response.json();
};

export const addExerciseToWorkout = async (workoutId: string, exerciseData: {
  exercise_id: string;
  sets: number;
  reps: number;
}) => {
  const token = getAuthToken();
  const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(exerciseData)
  });

  if (!response.ok) {
    throw new Error('Failed to add exercise to workout');
  }

  return response.json();
};

export const getMemberWorkouts = async (memberId: number) => {
  const response = await fetch(`${API_URL}/members/${memberId}/workouts`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch member workouts');
  return response.json();
};

// Check-in functions
export const getRecentCheckIns = async () => {
  const response = await fetch(`${API_URL}/checkin/today`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch recent check-ins');
  return response.json();
};

export const recordCheckIn = async (checkIn: { member_id: number; check_type: string }) => {
  const response = await fetch(`${API_URL}/checkin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(checkIn),
  });
  if (!response.ok) throw new Error('Failed to record check-in');
  return response.json();
};

// Settings functions
export const getSettings = async () => {
  const response = await fetch(`${API_URL}/settings`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch settings');
  return response.json();
};

export const updateSettings = async (settings: Partial<DatabaseSchema['settings']>) => {
  const response = await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error('Failed to update settings');
  return response.json();
};

export const getNotificationSettings = async () => {
  const response = await fetch(`${API_URL}/settings/notifications`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch notification settings');
  return response.json();
};

export const updateNotificationSettings = async (settings: Partial<DatabaseSchema['notification_settings']>) => {
  const response = await fetch(`${API_URL}/settings/notifications`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error('Failed to update notification settings');
  return response.json();
};

// Admin functions
export const getRoles = async () => {
  const response = await fetch(`${API_URL}/roles`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch roles');
  return response.json();
};

export const createRole = async (role: Partial<DatabaseSchema['roles']>) => {
  const response = await fetch(`${API_URL}/roles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(role),
  });
  if (!response.ok) throw new Error('Failed to create role');
  return response.json();
};

export const updateRole = async (id: number, role: Partial<DatabaseSchema['roles']>) => {
  const response = await fetch(`${API_URL}/roles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(role),
  });
  if (!response.ok) throw new Error('Failed to update role');
  return response.json();
};

export const deleteRole = async (id: number) => {
  const response = await fetch(`${API_URL}/roles/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to delete role');
  return response.json();
};

export const getProfiles = async () => {
  const response = await fetch(`${API_URL}/profiles`, {
    headers: { 'Authorization': `Bearer ${getAuthToken()}` },
  });
  if (!response.ok) throw new Error('Failed to fetch profiles');
  return response.json();
};

export const createUserAsAdmin = async (user: { email: string; password: string; role_id: number }) => {
  const response = await fetch(`${API_URL}/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

export const updateProfile = async (id: number, profile: Partial<DatabaseSchema['profiles']>) => {
  const response = await fetch(`${API_URL}/profiles/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(profile),
  });
  if (!response.ok) throw new Error('Failed to update profile');
  return response.json();
};

// Plan member functions
export const getMembersWithPlan = async (planId: string) => {
  try {
    const response = await fetch(`${API_URL}/members?plan_id=${planId}`, {
      headers: { 
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch plan members');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching plan members:', error);
    throw error;
  }
};

// Alias for updateSettings to maintain backward compatibility
export const updateSetting = updateSettings;
