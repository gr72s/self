import axios from 'axios';
import type {Response, RoutineResponse, WorkoutResponse} from '@/types';

// 创建基础axios实例配置
const createApiInstance = (baseURL: string) => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // 添加请求拦截器，自动添加认证令牌
  instance.interceptors.request.use(
    config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

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
const authApi = createApiInstance('http://localhost:8080/api/auth');

// 训练记录相关API
export const workoutApi = {
  // 获取所有训练记录
  getAll: () => liftingApi.get<Response<WorkoutResponse[]>>('/workout'),
  // 创建训练记录
  create: (data: unknown) => liftingApi.post<Response<unknown>>('/workout', data),
  // 结束训练
  stop: (data: unknown) => liftingApi.post<Response<unknown>>('/workout/stop', data),
  // 获取进行中的训练
  getInProcess: () => liftingApi.get<Response<WorkoutResponse>>('/workout/in-process')
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
  addExercise: (data: unknown) => liftingApi.post<Response<unknown>>('/routine/exercise', data)
};

// 动作相关API
export const exerciseApi = {
  // 创建动作
  create: (data: unknown) => liftingApi.post<Response<unknown>>('/exercise', data),
  // 获取所有动作
  getAll: () => liftingApi.get<Response<unknown>>('/exercise'),
  // 获取动作详情
  getById: (id: string) => liftingApi.get<Response<unknown>>(`/exercise/${id}`)
};

// 健身场所相关API
export const gymApi = {
  // 创建健身场所
  create: (data: unknown) => liftingApi.post<Response<unknown>>('/gym', data),
  // 获取所有健身场所
  getAll: () => liftingApi.get<Response<unknown>>('/gym')
};

// 登录相关API
export const loginApi = {
  // 用户名密码登录
  login: (data: { username: string; password: string }) => authApi.post<Response<string>>('/authenticate', data),
  // 设备认证登录
  deviceLogin: (data: { deviceId: string; deviceInfo: string }) => authApi.post<Response<string>>('/authenticate-device', data)
};

// 用户相关API
export const userApi = {
  // 获取当前用户信息
  getCurrent: () => createApiInstance('http://localhost:8080/api/users').get<Response<unknown>>('/current')
};

export default liftingApi;
