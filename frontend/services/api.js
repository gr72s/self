// 微信小程序原生 API 服务
// 使用 wx.request 实现网络请求

const API_BASE_URL = 'https://api.example.com'; // 替换为实际的 API 基础地址

/**
 * 通用请求方法
 * @param {string} url - 请求路径
 * @param {string} method - 请求方法 (GET, POST, PUT, DELETE)
 * @param {object} data - 请求数据
 * @returns {Promise} - 返回 Promise
 */
const request = (url, method, data = {}) => {
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
          resolve(res.data);
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
const apiClient = {
  get: (url) => request(url, 'GET'),
  post: (url, data) => request(url, 'POST', data),
  put: (url, data) => request(url, 'PUT', data),
  delete: (url) => request(url, 'DELETE')
};

/**
 * 训练记录 API
 */
const workoutApi = {
  getAll: () => apiClient.get('/lifting/workout'),
  create: (data) => apiClient.post('/lifting/workout', data),
  stop: (data) => apiClient.post('/lifting/workout/stop', data),
  getInProcess: () => apiClient.get('/lifting/workout/in-process'),
  getById: (id) => apiClient.get(`/lifting/workout/${id}`),
  update: (id, data) => apiClient.put(`/lifting/workout/${id}`, data),
  delete: (id) => apiClient.delete(`/lifting/workout/${id}`)
};

/**
 * 训练计划 API
 */
const routineApi = {
  getAll: () => apiClient.get('/lifting/routine'),
  create: (data) => apiClient.post('/lifting/routine', data),
  createTemplate: (data) => apiClient.post('/lifting/routine/template', data),
  addExercise: (data) => apiClient.post('/lifting/routine/exercise', data),
  getById: (id) => apiClient.get(`/lifting/routine/${id}`),
  update: (id, data) => apiClient.put(`/lifting/routine/${id}`, data),
  delete: (id) => apiClient.delete(`/lifting/routine/${id}`)
};

/**
 * 动作 API
 */
const exerciseApi = {
  getAll: () => apiClient.get('/lifting/exercise'),
  create: (data) => apiClient.post('/lifting/exercise', data),
  update: (id, data) => apiClient.put(`/lifting/exercise/${id}`, data),
  getById: (id) => apiClient.get(`/lifting/exercise/${id}`),
  delete: (id) => apiClient.delete(`/lifting/exercise/${id}`)
};

/**
 * 健身房 API
 */
const gymApi = {
  getAll: () => apiClient.get('/lifting/gym'),
  create: (data) => apiClient.post('/lifting/gym', data),
  update: (id, data) => apiClient.put(`/lifting/gym/${id}`, data),
  getById: (id) => apiClient.get(`/lifting/gym/${id}`),
  delete: (id) => apiClient.delete(`/lifting/gym/${id}`)
};

/**
 * 肌肉 API
 */
const muscleApi = {
  getAll: () => apiClient.get('/lifting/muscle'),
  create: (data) => apiClient.post('/lifting/muscle', data),
  update: (id, data) => apiClient.put(`/lifting/muscle/${id}`, data),
  getById: (id) => apiClient.get(`/lifting/muscle/${id}`),
  delete: (id) => apiClient.delete(`/lifting/muscle/${id}`)
};

/**
 * 用户 API
 */
const userApi = {
  getCurrent: () => apiClient.get('/users/current')
};

/**
 * 统一导出的 API 对象
 */
module.exports = {
  workoutApi,
  routineApi,
  exerciseApi,
  gymApi,
  muscleApi,
  userApi,
  
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

// 额外导出 ES 模块格式，以兼容不同的导入方式
if (typeof module !== 'undefined' && module.exports) {
  // 保持 CommonJS 导出
} else if (typeof window !== 'undefined') {
  // 在浏览器环境中导出到全局对象
  window.Api = module.exports;
} else if (typeof self !== 'undefined') {
  // 在 Worker 环境中导出
  self.Api = module.exports;
}
