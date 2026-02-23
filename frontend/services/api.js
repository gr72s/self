// 寰俊灏忕▼搴忓師鐢?API 鏈嶅姟
// 浣跨敤 wx.request 瀹炵幇缃戠粶璇锋眰

const API_BASE_URL = 'https://8.137.33.126:8443/'; // 鏇挎崲涓哄疄闄呯殑 API 鍩虹鍦板潃

/**
 * 閫氱敤璇锋眰鏂规硶
 * @param {string} url - 璇锋眰璺緞
 * @param {string} method - 璇锋眰鏂规硶 (GET, POST, PUT, DELETE)
 * @param {object} data - 璇锋眰鏁版嵁
 * @returns {Promise} - 杩斿洖 Promise
 */
const request = (url, method, data = {}) => {
  return new Promise((resolve, reject) => {
    // 鑾峰彇鏈湴瀛樺偍鐨則oken
    const token = wx.getStorageSync('token');
    
    // 褰搕oken涓簄ull鎴杣ndefined鏃讹紝璺宠浆鍒扮櫥褰曢〉闈?
    // 浣嗘槸鍏佽鐧诲綍椤甸潰鍙戣捣鐨勭櫥褰曡姹?
    if (!token) {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const isLoginPage = currentPage && currentPage.route === 'pages/login/index/index';
      
      // 鍙湁褰撲笉鏄櫥褰曢〉闈㈡椂锛屾墠璺宠浆鍒扮櫥褰曢〉闈?
      // 鐧诲綍椤甸潰鍙戣捣鐨勭櫥褰曡姹傚厑璁告墽琛岋紝鍗充娇token涓簄ull鎴杣ndefined
      if (!isLoginPage) {
        console.log('token涓簄ull鎴杣ndefined锛岃烦杞埌鐧诲綍椤甸潰');
        const app = getApp();
        if (app && app.showLoginModal) {
          app.showLoginModal();
        }
        reject(new Error('鏈櫥褰曪紝璇峰厛鐧诲綍'));
        return;
      }
    }
    
    console.log('token鍊?', token);
    
    // 鏋勫缓 URL锛岀‘淇濆彧鏈変竴涓枩鏉?
    let fullUrl = `${API_BASE_URL}${url}`;
    // 鍒嗙鍗忚閮ㄥ垎鍜岃矾寰勯儴鍒?
    const protocolMatch = fullUrl.match(/^(https?:\/\/)/i);
    if (protocolMatch) {
      const protocol = protocolMatch[1];
      const path = fullUrl.substring(protocol.length);
      // 澶勭悊璺緞涓殑閲嶅鏂滄潬
      const normalizedPath = path.replace(/\/+\//g, '/');
      // 澶勭悊鏈熬鐨勬枩鏉?
      const trimmedPath = normalizedPath.replace(/\/+$/, '');
      fullUrl = protocol + trimmedPath;
    } else {
      // 娌℃湁鍗忚锛岀洿鎺ュ鐞嗘墍鏈夐噸澶嶆枩鏉?
      fullUrl = fullUrl.replace(/\/+\//g, '/').replace(/\/+$/, '');
    }
    console.log('鏋勫缓鐨勫畬鏁碪RL:', fullUrl);
    
    wx.request({
      url: fullUrl,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        // 鍙湁褰?token 瀛樺湪涓斾笉鏄?undefined 鏃舵墠娣诲姞璁よ瘉澶?
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else if (res.statusCode === 401) {
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('token');

          const app = getApp();
          if (app && app.showLoginModal) {
            app.showLoginModal();
          }

          reject(new Error('登录已过期，请重新登录'));
        } else {
          const error = new Error(`请求失败: ${res.statusCode}`);
          error.statusCode = res.statusCode;
          error.response = res.data;
          reject(error);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
};

/**
 * API 瀹㈡埛绔?
 */
const apiClient = {
  get: (url) => request(url, 'GET'),
  post: (url, data) => request(url, 'POST', data),
  put: (url, data) => request(url, 'PUT', data),
  delete: (url) => request(url, 'DELETE')
};

const getGymLocation = (data = {}) => {
  if (typeof data.location === 'string') return data.location;
  if (typeof data.address === 'string') return data.address;
  return '';
};

const hasLocationValidationError = (error) => {
  if (!error || error.statusCode !== 422) return false;
  const details = error.response && error.response.detail;
  if (!Array.isArray(details)) return false;
  return details.some((item) => Array.isArray(item && item.loc) && item.loc.includes('location'));
};

const shouldRetryGymWithFallbackLocation = (error, payload) => {
  const location = (payload.location || '').trim();
  if (location) return false;
  return hasLocationValidationError(error);
};

/**
 * 璁粌璁板綍 API
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
 * 璁粌璁″垝 API
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
 * 鍔ㄤ綔 API
 */
const exerciseApi = {
  getAll: () => apiClient.get('api/lifting/exercise'),
  create: (data) => apiClient.post('api/lifting/exercise', data),
  update: (id, data) => apiClient.put(`api/lifting/exercise/${id}`, data),
  getById: (id) => apiClient.get(`api/lifting/exercise/${id}`),
  delete: (id) => apiClient.delete(`api/lifting/exercise/${id}`)
};

/**
 * 鍋ヨ韩鎴?API
 */
const gymApi = {
  getAll: () => apiClient.get('api/lifting/gym'),
  create: (data) => {
    const payload = { ...data, location: getGymLocation(data).trim() };
    return apiClient.post('api/lifting/gym', payload).catch((error) => {
      if (shouldRetryGymWithFallbackLocation(error, payload)) {
        const retryPayload = { ...payload, location: '未填写地址' };
        return apiClient.post('api/lifting/gym', retryPayload);
      }
      throw error;
    });
  },
  update: (id, data) => {
    const payload = { ...data, location: getGymLocation(data).trim() };
    return apiClient.put(`api/lifting/gym/${id}`, payload).catch((error) => {
      if (shouldRetryGymWithFallbackLocation(error, payload)) {
        const retryPayload = { ...payload, location: '未填写地址' };
        return apiClient.put(`api/lifting/gym/${id}`, retryPayload);
      }
      throw error;
    });
  },
  getById: (id) => apiClient.get(`api/lifting/gym/${id}`),
  delete: (id) => apiClient.delete(`api/lifting/gym/${id}`)
};

/**
 * 鑲岃倝 API
 */
const muscleApi = {
  getAll: () => apiClient.get('api/lifting/muscle'),
  create: (data) => apiClient.post('api/lifting/muscle', data),
  update: (id, data) => apiClient.put(`api/lifting/muscle/${id}`, data),
  getById: (id) => apiClient.get(`api/lifting/muscle/${id}`),
  delete: (id) => apiClient.delete(`api/lifting/muscle/${id}`)
};

/**
 * 鐢ㄦ埛 API
 */
const userApi = {
  getCurrent: () => apiClient.get('api/auth/current')
};

/**
 * 寰俊鐧诲綍 API
 */
const wechatApi = {
  login: (code, nickname, avatar) => apiClient.post('api/auth/wechat', { code, nickname, avatar })
};

/**
 * 缁熶竴瀵煎嚭鐨?API 瀵硅薄
 */
module.exports = {
  workoutApi,
  routineApi,
  exerciseApi,
  gymApi,
  muscleApi,
  userApi,
  wechatApi,
  
  // 璁粌璁板綍 API
  getWorkouts: workoutApi.getAll,
  createWorkout: workoutApi.create,
  stopWorkout: workoutApi.stop,
  getWorkoutInProcess: workoutApi.getInProcess,
  getWorkout: workoutApi.getById,
  updateWorkout: workoutApi.update,
  deleteWorkout: workoutApi.delete,
  
  // 璁粌璁″垝 API
  getRoutines: routineApi.getAll,
  createRoutine: routineApi.create,
  createRoutineTemplate: routineApi.createTemplate,
  addExerciseToRoutine: routineApi.addExercise,
  getRoutine: routineApi.getById,
  updateRoutine: routineApi.update,
  deleteRoutine: routineApi.delete,
  
  // 鍔ㄤ綔 API
  getExercises: exerciseApi.getAll,
  createExercise: exerciseApi.create,
  updateExercise: exerciseApi.update,
  getExercise: exerciseApi.getById,
  deleteExercise: exerciseApi.delete,
  
  // 鍋ヨ韩鎴?API
  getGyms: gymApi.getAll,
  createGym: gymApi.create,
  updateGym: gymApi.update,
  getGym: gymApi.getById,
  deleteGym: gymApi.delete,
  
  // 鑲岃倝 API
  getMuscles: muscleApi.getAll,
  createMuscle: muscleApi.create,
  updateMuscle: muscleApi.update,
  getMuscle: muscleApi.getById,
  deleteMuscle: muscleApi.delete,
  
  // 鐢ㄦ埛 API
  getCurrentUser: userApi.getCurrent,
  
  // 寰俊鐧诲綍 API
  wechatLogin: wechatApi.login
};

// 棰濆瀵煎嚭 ES 妯″潡鏍煎紡锛屼互鍏煎涓嶅悓鐨勫鍏ユ柟寮?
if (typeof module !== 'undefined' && module.exports) {
  // 淇濇寔 CommonJS 瀵煎嚭
} else if (typeof window !== 'undefined') {
  // 鍦ㄦ祻瑙堝櫒鐜涓鍑哄埌鍏ㄥ眬瀵硅薄
  window.Api = module.exports;
} else if (typeof self !== 'undefined') {
  // 鍦?Worker 鐜涓鍑?
  self.Api = module.exports;
}


