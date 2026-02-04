// Platform-agnostic API definitions
// This file defines the API interface and creates API methods
// Platform-specific HTTP clients will be injected

import type { Response, WorkoutResponse, RoutineResponse, ExerciseResponse, GymResponse, MuscleResponse } from '@/types';

/**
 * Generic HTTP client interface
 * Each platform (Web/Miniprogram) will implement this differently
 */
export interface ApiClient {
    get<T>(url: string): Promise<T>;
    post<T>(url: string, data?: any): Promise<T>;
    put<T>(url: string, data?: any): Promise<T>;
    delete<T>(url: string): Promise<T>;
}

/**
 * Create workout API methods with injected client
 */
export const createWorkoutApi = (client: ApiClient) => ({
    getAll: () => client.get<Response<WorkoutResponse[]>>('/lifting/workout'),
    create: (data: unknown) => client.post<Response<unknown>>('/lifting/workout', data),
    stop: (data: unknown) => client.post<Response<unknown>>('/lifting/workout/stop', data),
    getInProcess: () => client.get<Response<WorkoutResponse>>('/lifting/workout/in-process'),
    getById: (id: number) => client.get<Response<WorkoutResponse>>(`/lifting/workout/${id}`),
    update: (id: number, data: unknown) => client.put<Response<unknown>>(`/lifting/workout/${id}`, data),
    delete: (id: number) => client.delete<Response<unknown>>(`/lifting/workout/${id}`),
});

/**
 * Create routine API methods with injected client
 */
export const createRoutineApi = (client: ApiClient) => ({
    getAll: () => client.get<Response<RoutineResponse[]>>('/lifting/routine'),
    create: (data: unknown) => client.post<Response<unknown>>('/lifting/routine', data),
    createTemplate: (data: unknown) => client.post<Response<unknown>>('/lifting/routine/template', data),
    addExercise: (data: unknown) => client.post<Response<unknown>>('/lifting/routine/exercise', data),
    getById: (id: number) => client.get<Response<RoutineResponse>>(`/lifting/routine/${id}`),
    update: (id: number, data: unknown) => client.put<Response<unknown>>(`/lifting/routine/${id}`, data),
    delete: (id: number) => client.delete<Response<unknown>>(`/lifting/routine/${id}`),
});

/**
 * Create exercise API methods with injected client
 */
export const createExerciseApi = (client: ApiClient) => ({
    create: (data: unknown) => client.post<Response<unknown>>('/lifting/exercise', data),
    update: (id: string | number, data: unknown) => client.put<Response<unknown>>(`/lifting/exercise/${id}`, data),
    getAll: () => client.get<Response<ExerciseResponse[]>>('/lifting/exercise'),
    getById: (id: string | number) => client.get<Response<ExerciseResponse>>(`/lifting/exercise/${id}`),
    delete: (id: number) => client.delete<Response<unknown>>(`/lifting/exercise/${id}`),
});

/**
 * Create gym API methods with injected client
 */
export const createGymApi = (client: ApiClient) => ({
    create: (data: unknown) => client.post<Response<unknown>>('/lifting/gym', data),
    update: (id: string | number, data: unknown) => client.put<Response<unknown>>(`/lifting/gym/${id}`, data),
    getAll: () => client.get<Response<GymResponse[]>>('/lifting/gym'),
    getById: (id: string | number) => client.get<Response<GymResponse>>(`/lifting/gym/${id}`),
    delete: (id: number) => client.delete<Response<unknown>>(`/lifting/gym/${id}`),
});

/**
 * Create muscle API methods with injected client
 */
export const createMuscleApi = (client: ApiClient) => ({
    create: (data: unknown) => client.post<Response<unknown>>('/lifting/muscle', data),
    update: (id: string | number, data: unknown) => client.put<Response<unknown>>(`/lifting/muscle/${id}`, data),
    getAll: () => client.get<Response<MuscleResponse[]>>('/lifting/muscle'),
    getById: (id: string | number) => client.get<Response<MuscleResponse>>(`/lifting/muscle/${id}`),
    delete: (id: number) => client.delete<Response<unknown>>(`/lifting/muscle/${id}`),
});

/**
 * Create user API methods with injected client
 */
export const createUserApi = (client: ApiClient) => ({
    getCurrent: () => client.get<Response<unknown>>('/users/current'),
});
