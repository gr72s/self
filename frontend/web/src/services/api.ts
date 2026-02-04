// Web platform API - exports configured API methods
import {
    createWorkoutApi,
    createRoutineApi,
    createExerciseApi,
    createGymApi,
    createMuscleApi,
    createUserApi,
} from '@/services/apiDefinitions';
import { webHttpClient } from './httpClient';

// Export configured API methods for Web platform
export const workoutApi = createWorkoutApi(webHttpClient);
export const routineApi = createRoutineApi(webHttpClient);
export const exerciseApi = createExerciseApi(webHttpClient);
export const gymApi = createGymApi(webHttpClient);
export const muscleApi = createMuscleApi(webHttpClient);
export const userApi = createUserApi(webHttpClient);
