const { workoutApi, userApi } = require('../../services/api');
const {
  VIEW_KEYS,
  SHELL_VIEW_STORAGE_KEY,
  normalizeView,
  parseViewQuery
} = require('../../types/view-router');

const RESOURCE_TO_LIST_VIEW = {
  workout: VIEW_KEYS.WORKOUTS_LIST,
  routine: VIEW_KEYS.ROUTINES_LIST,
  exercise: VIEW_KEYS.EXERCISES_LIST,
  gym: VIEW_KEYS.GYMS_LIST,
  muscle: VIEW_KEYS.MUSCLES_LIST
};

const VIEW_TITLES = {
  [VIEW_KEYS.HOME]: '首页',
  [VIEW_KEYS.WORKOUTS_LIST]: '训练记录',
  [VIEW_KEYS.WORKOUTS_CREATE]: '新建训练',
  [VIEW_KEYS.WORKOUTS_EDIT]: '编辑训练',
  [VIEW_KEYS.ROUTINES_LIST]: '训练计划',
  [VIEW_KEYS.ROUTINES_CREATE]: '新建计划',
  [VIEW_KEYS.ROUTINES_EDIT]: '编辑计划',
  [VIEW_KEYS.EXERCISES_LIST]: '动作库',
  [VIEW_KEYS.EXERCISES_CREATE]: '新建动作',
  [VIEW_KEYS.EXERCISES_EDIT]: '编辑动作',
  [VIEW_KEYS.GYMS_LIST]: '健身房',
  [VIEW_KEYS.GYMS_CREATE]: '新建健身房',
  [VIEW_KEYS.GYMS_EDIT]: '编辑健身房',
  [VIEW_KEYS.MUSCLES_LIST]: '肌肉',
  [VIEW_KEYS.MUSCLES_CREATE]: '新建肌肉',
  [VIEW_KEYS.MUSCLES_EDIT]: '编辑肌肉'
};

const extractApiPayload = (response) => {
  if (!response) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(response, 'data')) {
    const firstLayer = response.data;
    if (firstLayer && typeof firstLayer === 'object' && Object.prototype.hasOwnProperty.call(firstLayer, 'data')) {
      return firstLayer.data;
    }
    return firstLayer;
  }

  return response;
};

const buildUserFromStorage = () => {
  const stored = wx.getStorageSync('userInfo');
  if (!stored || typeof stored !== 'object') {
    return null;
  }

  return {
    username: stored.username || stored.nickname || '',
    nickname: stored.nickname || '',
    avatar: stored.avatar || stored.avatarUrl || ''
  };
};

Page({
  data: {
    workouts: [],
    user: null,
    uniqueRoutines: 0,
    totalExercises: 0,
    currentView: VIEW_KEYS.HOME,
    currentViewTitle: VIEW_TITLES[VIEW_KEYS.HOME],
    viewParams: {},
    viewKeys: VIEW_KEYS
  },

  onLoad(options) {
    this.fetchData();
    this.applyEntryView(options || {});
  },

  onShow() {
    this.fetchData();
    this.applyPendingView();
  },

  applyEntryView(options) {
    const hasView = options && options.view;
    if (!hasView) {
      return;
    }

    const { view, params } = parseViewQuery(options);
    this.setView(view, params);
  },

  applyPendingView() {
    const pending = wx.getStorageSync(SHELL_VIEW_STORAGE_KEY);
    if (!pending || typeof pending !== 'object') {
      return;
    }

    const view = normalizeView(pending.view);
    const params = pending.params || {};
    wx.removeStorageSync(SHELL_VIEW_STORAGE_KEY);
    this.setView(view, params);
  },

  async fetchData() {
    const fallbackUser = buildUserFromStorage();
    if (fallbackUser) {
      this.setData({ user: fallbackUser });
    }

    try {
      const userResponse = await userApi.getCurrent();
      const userData = extractApiPayload(userResponse);
      if (userData && typeof userData === 'object') {
        this.setData({ user: userData });
      } else {
        this.setData({ user: fallbackUser || null });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      this.setData({ user: fallbackUser || null });
    }

    try {
      const workoutResponse = await workoutApi.getAll();
      const workoutData = (workoutResponse.data && workoutResponse.data.data) || workoutResponse.data || [];
      const workouts = Array.isArray(workoutData) ? workoutData : [];

      const uniqueRoutines = new Set(workouts.map((w) => w.routineId)).size;
      const totalExercises = workouts.reduce((sum, workout) => {
        return sum + ((workout.exercises && workout.exercises.length) || 0);
      }, 0);

      this.setData({ workouts, uniqueRoutines, totalExercises });
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
    }
  },

  setView(view, params = {}) {
    const nextView = normalizeView(view);
    this.setData({
      currentView: nextView,
      currentViewTitle: VIEW_TITLES[nextView] || VIEW_TITLES[VIEW_KEYS.HOME],
      viewParams: params || {}
    });

    if (nextView === VIEW_KEYS.HOME) {
      this.fetchData();
    }
  },

  goHome() {
    this.setView(VIEW_KEYS.HOME);
  },

  handleChildNavigate(e) {
    const detail = e && e.detail ? e.detail : {};
    if (!detail.view) {
      return;
    }
    this.setView(detail.view, detail.params || {});
  },

  handleChildCancel() {
    this.goHome();
  },

  handleChildSubmitted(e) {
    const detail = e && e.detail ? e.detail : {};
    const listView = RESOURCE_TO_LIST_VIEW[detail.resource];
    if (listView) {
      this.setView(listView);
    } else {
      this.goHome();
    }
    this.fetchData();
  },

  navigateToWorkouts() {
    this.setView(VIEW_KEYS.WORKOUTS_LIST);
  },

  navigateToRoutines() {
    this.setView(VIEW_KEYS.ROUTINES_LIST);
  },

  navigateToExercises() {
    this.setView(VIEW_KEYS.EXERCISES_LIST);
  },

  navigateToGyms() {
    this.setView(VIEW_KEYS.GYMS_LIST);
  },

  navigateToMuscles() {
    this.setView(VIEW_KEYS.MUSCLES_LIST);
  },

  navigateToProfile() {
    wx.switchTab({ url: '/pages/profile/index' });
  },

  startNewWorkout() {
    this.setView(VIEW_KEYS.WORKOUTS_CREATE);
  }
});
