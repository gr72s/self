import axios from 'axios';
import type {Response, RoutineResponse, WorkoutResponse} from '@/types';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8080/api/lifting',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 拦截器处理
api.interceptors.response.use(
  response => response.data,
  error => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 训练记录相关API
export const workoutApi = {
  // 获取所有训练记录
  getAll: () => api.get<Response<WorkoutResponse[]>>('/workout'),
  // 创建训练记录
  create: (data: unknown) => api.post<Response<unknown>>('/workout', data),
  // 结束训练
  stop: (data: unknown) => api.post<Response<unknown>>('/workout/stop', data),
  // 获取进行中的训练
  getInProcess: () => api.get<Response<WorkoutResponse>>('/workout/in-process')
};

// 训练计划相关API
export const routineApi = {
  // 获取所有训练计划
  getAll: () => api.get<Response<RoutineResponse[]>>('/routine'),
  // 创建训练计划
  create: (data: unknown) => api.post<Response<unknown>>('/routine', data),
  // 创建训练计划模板
  createTemplate: (data: unknown) => api.post<Response<unknown>>('/routine/template', data),
  // 添加动作到训练计划
  addExercise: (data: unknown) => api.post<Response<unknown>>('/routine/exercise', data)
};

// 动作相关API
export const exerciseApi = {
  // 创建动作
  create: (data: unknown) => api.post<Response<unknown>>('/exercise', data)
};

export default api;
