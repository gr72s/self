// Miniprogram platform API - exports configured API methods
import {
    createWorkoutApi,
    createRoutineApi,
    createExerciseApi,
    createGymApi,
    createMuscleApi,
    createUserApi,
} from '@/services/apiDefinitions';
import { miniprogramHttpClient } from './httpClient';

// Export configured API methods for Miniprogram platform
export const workoutApi = createWorkoutApi(miniprogramHttpClient);
export const routineApi = createRoutineApi(miniprogramHttpClient);
export const exerciseApi = createExerciseApi(miniprogramHttpClient);
export const gymApi = createGymApi(miniprogramHttpClient);
export const muscleApi = createMuscleApi(miniprogramHttpClient);
export const userApi = createUserApi(miniprogramHttpClient);
