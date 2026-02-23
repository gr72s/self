// 微信小程序原生 API 服务
// 使用 wx.request 实现网络请求

const API_BASE_URL = 'https://8.137.33.126:8443/';

/**
 * 通用请求方法
 * @param {string} url - 请求路径
 * @param {string} method - 请求方法 (GET, POST, PUT, DELETE)
 * @param {object} data - 请求数据
 * @returns {Promise<any>}
 */
const request = (url, method, data = {}) => {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');

    if (!token) {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const isLoginPage = currentPage && currentPage.route === 'pages/login/index/index';

      if (!isLoginPage) {
        const app = getApp();
        if (app && app.showLoginModal) {
          app.showLoginModal();
        }
        reject(new Error('未登录，请先登录'));
        return;
      }
    }

    let fullUrl = `${API_BASE_URL}${url}`;
    const protocolMatch = fullUrl.match(/^(https?:\/\/)/i);
    if (protocolMatch) {
      const protocol = protocolMatch[1];
      const path = fullUrl.substring(protocol.length);
      const normalizedPath = path.replace(/\/+\//g, '/').replace(/\/+$/, '');
      fullUrl = protocol + normalizedPath;
    } else {
      fullUrl = fullUrl.replace(/\/+\//g, '/').replace(/\/+$/, '');
    }

    wx.request({
      url: fullUrl,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
          return;
        }

        if (res.statusCode === 401) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('token');

          const app = getApp();
          if (app && app.showLoginModal) {
            app.showLoginModal();
          }

          reject(new Error('登录已过期，请重新登录'));
          return;
        }

        const error = new Error(`请求失败: ${res.statusCode}`);
        error.statusCode = res.statusCode;
        error.response = res.data;
        reject(error);
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

const apiClient = {
  get: (url) => request(url, 'GET'),
  post: (url, data) => request(url, 'POST', data),
  put: (url, data) => request(url, 'PUT', data),
  delete: (url) => request(url, 'DELETE')
};

const unwrapResponseData = (response) => {
  if (!response || typeof response !== 'object') {
    return null;
  }
  if (Object.prototype.hasOwnProperty.call(response, 'data')) {
    return response.data;
  }
  return null;
};

const parsePageItems = (response) => {
  const data = unwrapResponseData(response);
  if (!data || typeof data !== 'object') {
    return [];
  }
  if (!Array.isArray(data.items)) {
    return [];
  }
  return data.items;
};

/**
 * 训练记录 API
 */
const workoutApi = {
  getAll: () => apiClient.get('api/lifting/workout'),
  create: (data) => apiClient.post('api/lifting/workout', data),
  stop: (data) => apiClient.post('api/lifting/workout/stop', data),
  getInProcess: () => apiClient.get('api/lifting/workout/in-process'),
  getById: (id) => apiClient.get(`api/lifting/workout/${id}`),
  update: (id, data) => apiClient.put(`api/lifting/workout/${id}`, data),
  delete: (id) => apiClient.delete(`api/lifting/workout/${id}`)
};

/**
 * 训练计划 API
 */
const routineApi = {
  getAll: () => apiClient.get('api/lifting/routine'),
  create: (data) => apiClient.post('api/lifting/routine', data),
  createTemplate: (data) => apiClient.post('api/lifting/routine/template', data),
  addExercise: (data) => apiClient.post('api/lifting/routine/exercise', data),
  getById: (id) => apiClient.get(`api/lifting/routine/${id}`),
  update: (id, data) => apiClient.put(`api/lifting/routine/${id}`, data),
  delete: (id) => apiClient.delete(`api/lifting/routine/${id}`)
};

/**
 * 动作 API
 */
const exerciseApi = {
  getAll: () => apiClient.get('api/lifting/exercise'),
  create: (data) => apiClient.post('api/lifting/exercise', data),
  update: (id, data) => apiClient.put(`api/lifting/exercise/${id}`, data),
  getById: (id) => apiClient.get(`api/lifting/exercise/${id}`),
  delete: (id) => apiClient.delete(`api/lifting/exercise/${id}`)
};

/**
 * 健身房 API
 */
const gymApi = {
  getAll: () => apiClient.get('api/lifting/gym'),
  create: (data) => apiClient.post('api/lifting/gym', data),
  update: (id, data) => apiClient.put(`api/lifting/gym/${id}`, data),
  getById: (id) => apiClient.get(`api/lifting/gym/${id}`),
  delete: (id) => apiClient.delete(`api/lifting/gym/${id}`)
};

/**
 * 肌肉 API
 */
const muscleApi = {
  getAll: () => apiClient.get('api/lifting/muscle'),
  create: (data) => apiClient.post('api/lifting/muscle', data),
  update: (id, data) => apiClient.put(`api/lifting/muscle/${id}`, data),
  getById: (id) => apiClient.get(`api/lifting/muscle/${id}`),
  delete: (id) => apiClient.delete(`api/lifting/muscle/${id}`)
};

/**
 * 目标 API
 */
const targetApi = {
  getAll: () => apiClient.get('api/lifting/target'),
  getById: (id) => apiClient.get(`api/lifting/target/${id}`)
};

/**
 * 用户 API
 */
const userApi = {
  getCurrent: () => apiClient.get('api/auth/current')
};

/**
 * 微信登录 API
 */
const wechatApi = {
  login: (code, nickname, avatar) => apiClient.post('api/auth/wechat', { code, nickname, avatar })
};

module.exports = {
  workoutApi,
  routineApi,
  exerciseApi,
  gymApi,
  muscleApi,
  targetApi,
  userApi,
  wechatApi,
  unwrapResponseData,
  parsePageItems,

  getWorkouts: workoutApi.getAll,
  createWorkout: workoutApi.create,
  stopWorkout: workoutApi.stop,
  getWorkoutInProcess: workoutApi.getInProcess,
  getWorkout: workoutApi.getById,
  updateWorkout: workoutApi.update,
  deleteWorkout: workoutApi.delete,

  getRoutines: routineApi.getAll,
  createRoutine: routineApi.create,
  createRoutineTemplate: routineApi.createTemplate,
  addExerciseToRoutine: routineApi.addExercise,
  getRoutine: routineApi.getById,
  updateRoutine: routineApi.update,
  deleteRoutine: routineApi.delete,

  getExercises: exerciseApi.getAll,
  createExercise: exerciseApi.create,
  updateExercise: exerciseApi.update,
  getExercise: exerciseApi.getById,
  deleteExercise: exerciseApi.delete,

  getGyms: gymApi.getAll,
  createGym: gymApi.create,
  updateGym: gymApi.update,
  getGym: gymApi.getById,
  deleteGym: gymApi.delete,

  getMuscles: muscleApi.getAll,
  createMuscle: muscleApi.create,
  updateMuscle: muscleApi.update,
  getMuscle: muscleApi.getById,
  deleteMuscle: muscleApi.delete,

  getTargets: targetApi.getAll,
  getTarget: targetApi.getById,

  getCurrentUser: userApi.getCurrent,
  wechatLogin: wechatApi.login
};
