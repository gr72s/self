import axios from 'axios';
import type { Response, RoutineResponse, WorkoutResponse } from '@/types';

// 创建基础axios实例配置
const createApiInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // 拦截器处理响应
  instance.interceptors.response.use(
    response => response,
    error => {
      console.error('API请求错误:', error);
      return Promise.reject(error);
    }
  );

  return instance;
};

// 创建不同模块的API实例
const liftingApi = createApiInstance('http://localhost:8080/api/lifting');

// 训练记录相关API
export const workoutApi = {
  // 获取所有训练记录
  getAll: () => liftingApi.get<Response<WorkoutResponse[]>>('/workout'),
  // 创建训练记录
  create: (data: unknown) => liftingApi.post<Response<unknown>>('/workout', data),
  // 结束训练
  stop: (data: unknown) => liftingApi.post<Response<unknown>>('/workout/stop', data),
  // 获取进行中的训练
  getInProcess: () => liftingApi.get<Response<WorkoutResponse>>('/workout/in-process'),
  // 获取训练记录详情
  getById: (id: number) => liftingApi.get<Response<WorkoutResponse>>(`/workout/${id}`),
  // 更新训练记录
  update: (id: number, data: unknown) => liftingApi.put<Response<unknown>>(`/workout/${id}`, data)
};

// 训练计划相关API
export const routineApi = {
  // 获取所有训练计划
  getAll: () => liftingApi.get<Response<RoutineResponse[]>>('/routine'),
  // 创建训练计划
  create: (data: unknown) => liftingApi.post<Response<unknown>>('/routine', data),
  // 创建训练计划模板
  createTemplate: (data: unknown) => liftingApi.post<Response<unknown>>('/routine/template', data),
  // 添加动作到训练计划
  addExercise: (data: unknown) => liftingApi.post<Response<unknown>>('/routine/exercise', data),
  // 获取训练计划详情
  getById: (id: number) => liftingApi.get<Response<RoutineResponse>>(`/routine/${id}`),
  // 更新训练计划
  update: (id: number, data: unknown) => liftingApi.put<Response<unknown>>(`/routine/${id}`, data),
  // 删除训练计划
  delete: (id: number) => liftingApi.delete<Response<unknown>>(`/routine/${id}`)
};

// 动作相关API
// 动作相关API
export const exerciseApi = {
  // 创建动作
  create: (data: unknown) => liftingApi.post<Response<unknown>>('/exercise', data),
  // 更新动作
  update: (id: string | number, data: unknown) => liftingApi.put<Response<unknown>>(`/exercise/${id}`, data),
  // 获取所有动作
  getAll: () => liftingApi.get<Response<unknown>>('/exercise'),
  // 获取动作详情
  getById: (id: string | number) => liftingApi.get<Response<unknown>>(`/exercise/${id}`),
  // 删除动作
  delete: (id: number) => liftingApi.delete<Response<unknown>>(`/exercise/${id}`)
};

// 健身场所相关API
// 健身场所相关API
export const gymApi = {
  // 创建健身场所
  create: (data: unknown) => liftingApi.post<Response<unknown>>('/gym', data),
  // 更新健身场所
  update: (id: string | number, data: unknown) => liftingApi.put<Response<unknown>>(`/gym/${id}`, data),
  // 获取所有健身场所
  getAll: () => liftingApi.get<Response<unknown>>('/gym'),
  // 获取健身场所详情
  getById: (id: string | number) => liftingApi.get<Response<unknown>>(`/gym/${id}`),
  // 删除健身场所
  delete: (id: number) => liftingApi.delete<Response<unknown>>(`/gym/${id}`)
};

// 肌肉相关API
export const muscleApi = {
  // 创建肌肉
  create: (data: unknown) => liftingApi.post<Response<unknown>>('/muscle', data),
  // 更新肌肉
  update: (id: string | number, data: unknown) => liftingApi.put<Response<unknown>>(`/muscle/${id}`, data),
  // 获取所有肌肉
  getAll: () => liftingApi.get<Response<unknown>>('/muscle'),
  // 获取肌肉详情
  getById: (id: string | number) => liftingApi.get<Response<unknown>>(`/muscle/${id}`),
  // 删除肌肉
  delete: (id: number) => liftingApi.delete<Response<unknown>>(`/muscle/${id}`)
};



// 用户相关API
export const userApi = {
  // 获取当前用户信息
  getCurrent: () => createApiInstance('http://localhost:8080/api/users').get<Response<unknown>>('/current')
};

export default liftingApi;
