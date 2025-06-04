
// Updated API layer to use the mock API
import { mockApi } from './mockApi';
import { DatabaseSchema, TableRow } from '@/types/database.types';

// Re-export all the mock API methods
export const getPlans = () => mockApi.getPlans();
export const getPlan = (id: string) => mockApi.getPlan(id);
export const createPlan = (planData: any) => mockApi.createPlan(planData);
export const updatePlan = (id: string, planData: any) => mockApi.updatePlan(id, planData);
export const togglePlanStatus = (id: string, isActive: boolean) => mockApi.togglePlanStatus(id, isActive);

export const getMembers = (searchTerm?: string) => mockApi.getMembers(searchTerm);
export const getMember = (id: string) => mockApi.getMember(id);
export const getMemberById = (id: string) => mockApi.getMember(id);
export const getMembersWithPlan = (planId: string) => mockApi.getMembersWithPlan(planId);
export const createMember = (member: any) => mockApi.createMember(member);
export const updateMember = (id: string, member: any) => mockApi.updateMember(id, member);
export const deleteMember = (id: string) => mockApi.deleteMember(id);

export const getClasses = () => mockApi.getClasses();
export const getClass = (id: string) => mockApi.getClass(id);
export const createClass = (gymClass: any) => mockApi.createClass(gymClass);
export const updateClass = (id: string, gymClass: any) => mockApi.updateClass(id, gymClass);
export const deleteClass = (id: string) => mockApi.deleteClass(id);

export const createReservation = (reservation: any) => mockApi.createReservation(reservation);

export const getPayments = (searchTerm?: string) => mockApi.getPayments(searchTerm);
export const getPayment = (id: string) => mockApi.getPayment(id);
export const getPaymentById = (id: string) => mockApi.getPayment(id);
export const createPayment = (payment: any) => mockApi.createPayment(payment);
export const updatePayment = (id: string, payment: any) => mockApi.updatePayment(id, payment);
export const deletePayment = (id: string) => mockApi.deletePayment(id);

export const getRecentCheckIns = () => mockApi.getRecentCheckIns();
export const recordCheckIn = (data: any) => mockApi.recordCheckIn(data);
export const getCheckins = () => mockApi.getCheckins();

export const getSettings = () => mockApi.getSettings();
export const updateSettings = (settings: any) => mockApi.updateSettings(settings);
export const updateSetting = (id: string, settings: any) => mockApi.updateSettings(settings);

export const getNotificationSettings = () => mockApi.getNotificationSettings();
export const updateNotificationSettings = (settings: any) => mockApi.updateNotificationSettings(settings);

export const getExercises = () => mockApi.getExercises();
export const createExercise = (exercise: any) => mockApi.createExercise(exercise);

export const getWorkouts = () => mockApi.getWorkouts();
export const createWorkout = (workout: any, exercises: any[]) => mockApi.createWorkout(workout, exercises);
export const getWorkoutDetails = (workoutId: string) => mockApi.getWorkoutDetails(workoutId);
export const addExerciseToWorkout = (data: any) => mockApi.addExerciseToWorkout(data);
export const getMemberWorkouts = (memberId: string) => mockApi.getMemberWorkouts(memberId);

export const getProfiles = () => mockApi.getProfiles();
export const updateProfile = (id: string, profileData: any) => mockApi.updateProfile(id, profileData);

export const getRoles = () => mockApi.getRoles();
export const createRole = (role: any) => mockApi.createRole(role);
export const updateRole = (id: string, role: any) => mockApi.updateRole(id, role);
export const deleteRole = (id: string) => mockApi.deleteRole(id);

export const getAppUsers = () => mockApi.getAppUsers();
export const createAppUser = (user: any) => mockApi.createAppUser(user);
export const updateAppUser = (id: string, user: any) => mockApi.updateAppUser(id, user);
export const createUserAsAdmin = (userData: any) => mockApi.createUserAsAdmin(userData);

export const getCurrentUser = () => mockApi.getCurrentUser();
export const getCurrentUserProfile = () => mockApi.getCurrentUserProfile();
