// 微信小程序原生 API 服务
// 使用 wx.request 实现网络请求

import type { Workout, Routine, Exercise, Gym, Muscle } from '../types';



const API_BASE_URL = 'https://api.example.com'; // 替换为实际的 API 基础地址

/**
 * 通用请求方法
 * @param {string} url - 请求路径
 * @param {string} method - 请求方法 (GET, POST, PUT, DELETE)
 * @param {object} data - 请求数据
 * @returns {Promise<T>} - 返回 Promise
 */
export const request = <T>(url: string, method: string, data: any = {}): Promise<T> => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        // 可以在这里添加认证 token 等
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as T);
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * API 客户端
 */
export const apiClient = {
  get: <T>(url: string): Promise<T> => request<T>(url, 'GET'),
  post: <T>(url: string, data: any): Promise<T> => request<T>(url, 'POST', data),
  put: <T>(url: string, data: any): Promise<T> => request<T>(url, 'PUT', data),
  delete: <T>(url: string): Promise<T> => request<T>(url, 'DELETE')
};

/**
 * 训练记录 API
 */
export const workoutApi = {
  getAll: (): Promise<Workout[]> => apiClient.get<Workout[]>('/lifting/workout'),
  create: (data: Partial<Workout>): Promise<Workout> => apiClient.post<Workout>('/lifting/workout', data),
  stop: (data: { workoutId: string }): Promise<Workout> => apiClient.post<Workout>('/lifting/workout/stop', data),
  getInProcess: (): Promise<Workout | null> => apiClient.get<Workout | null>('/lifting/workout/in-process'),
  getById: (id: string): Promise<Workout> => apiClient.get<Workout>(`/lifting/workout/${id}`),
  update: (id: string, data: Partial<Workout>): Promise<Workout> => apiClient.put<Workout>(`/lifting/workout/${id}`, data),
  delete: (id: string): Promise<void> => apiClient.delete<void>(`/lifting/workout/${id}`)
};

/**
 * 训练计划 API
 */
export const routineApi = {
  getAll: (): Promise<Routine[]> => apiClient.get<Routine[]>('/lifting/routine'),
  create: (data: Partial<Routine>): Promise<Routine> => apiClient.post<Routine>('/lifting/routine', data),
  createTemplate: (data: Partial<Routine>): Promise<Routine> => apiClient.post<Routine>('/lifting/routine/template', data),
  addExercise: (data: { routineId: string; exerciseId: string; sets: number; reps: number }): Promise<Routine> => 
    apiClient.post<Routine>('/lifting/routine/exercise', data),
  getById: (id: string): Promise<Routine> => apiClient.get<Routine>(`/lifting/routine/${id}`),
  update: (id: string, data: Partial<Routine>): Promise<Routine> => apiClient.put<Routine>(`/lifting/routine/${id}`, data),
  delete: (id: string): Promise<void> => apiClient.delete<void>(`/lifting/routine/${id}`)
};

/**
 * 动作 API
 */
export const exerciseApi = {
  getAll: (): Promise<Exercise[]> => apiClient.get<Exercise[]>('/lifting/exercise'),
  create: (data: Partial<Exercise>): Promise<Exercise> => apiClient.post<Exercise>('/lifting/exercise', data),
  update: (id: string, data: Partial<Exercise>): Promise<Exercise> => apiClient.put<Exercise>(`/lifting/exercise/${id}`, data),
  getById: (id: string): Promise<Exercise> => apiClient.get<Exercise>(`/lifting/exercise/${id}`),
  delete: (id: string): Promise<void> => apiClient.delete<void>(`/lifting/exercise/${id}`)
};

/**
 * 健身房 API
 */
export const gymApi = {
  getAll: (): Promise<Gym[]> => apiClient.get<Gym[]>('/lifting/gym'),
  create: (data: Partial<Gym>): Promise<Gym> => apiClient.post<Gym>('/lifting/gym', data),
  update: (id: string, data: Partial<Gym>): Promise<Gym> => apiClient.put<Gym>(`/lifting/gym/${id}`, data),
  getById: (id: string): Promise<Gym> => apiClient.get<Gym>(`/lifting/gym/${id}`),
  delete: (id: string): Promise<void> => apiClient.delete<void>(`/lifting/gym/${id}`)
};

/**
 * 肌肉 API
 */
export const muscleApi = {
  getAll: (): Promise<Muscle[]> => apiClient.get<Muscle[]>('/lifting/muscle'),
  create: (data: Partial<Muscle>): Promise<Muscle> => apiClient.post<Muscle>('/lifting/muscle', data),
  update: (id: string, data: Partial<Muscle>): Promise<Muscle> => apiClient.put<Muscle>(`/lifting/muscle/${id}`, data),
  getById: (id: string): Promise<Muscle> => apiClient.get<Muscle>(`/lifting/muscle/${id}`),
  delete: (id: string): Promise<void> => apiClient.delete<void>(`/lifting/muscle/${id}`)
};

/**
 * 用户 API
 */
export const userApi = {
  getCurrent: (): Promise<any> => apiClient.get<any>('/users/current')
};

/**
 * 统一导出的 API 对象
 */
export default {
  // 训练记录 API
  getWorkouts: workoutApi.getAll,
  createWorkout: workoutApi.create,
  stopWorkout: workoutApi.stop,
  getWorkoutInProcess: workoutApi.getInProcess,
  getWorkout: workoutApi.getById,
  updateWorkout: workoutApi.update,
  deleteWorkout: workoutApi.delete,
  
  // 训练计划 API
  getRoutines: routineApi.getAll,
  createRoutine: routineApi.create,
  createRoutineTemplate: routineApi.createTemplate,
  addExerciseToRoutine: routineApi.addExercise,
  getRoutine: routineApi.getById,
  updateRoutine: routineApi.update,
  deleteRoutine: routineApi.delete,
  
  // 动作 API
  getExercises: exerciseApi.getAll,
  createExercise: exerciseApi.create,
  updateExercise: exerciseApi.update,
  getExercise: exerciseApi.getById,
  deleteExercise: exerciseApi.delete,
  
  // 健身房 API
  getGyms: gymApi.getAll,
  createGym: gymApi.create,
  updateGym: gymApi.update,
  getGym: gymApi.getById,
  deleteGym: gymApi.delete,
  
  // 肌肉 API
  getMuscles: muscleApi.getAll,
  createMuscle: muscleApi.create,
  updateMuscle: muscleApi.update,
  getMuscle: muscleApi.getById,
  deleteMuscle: muscleApi.delete,
  
  // 用户 API
  getCurrentUser: userApi.getCurrent
};
