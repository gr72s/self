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
  [VIEW_KEYS.HOME]: 'Home',
  [VIEW_KEYS.WORKOUTS_LIST]: 'Workouts',
  [VIEW_KEYS.WORKOUTS_CREATE]: 'Create Workout',
  [VIEW_KEYS.WORKOUTS_EDIT]: 'Edit Workout',
  [VIEW_KEYS.ROUTINES_LIST]: 'Routines',
  [VIEW_KEYS.ROUTINES_CREATE]: 'Create Routine',
  [VIEW_KEYS.ROUTINES_EDIT]: 'Edit Routine',
  [VIEW_KEYS.EXERCISES_LIST]: 'Exercises',
  [VIEW_KEYS.EXERCISES_CREATE]: 'Create Exercise',
  [VIEW_KEYS.EXERCISES_EDIT]: 'Edit Exercise',
  [VIEW_KEYS.GYMS_LIST]: 'Gyms',
  [VIEW_KEYS.GYMS_CREATE]: 'Create Gym',
  [VIEW_KEYS.GYMS_EDIT]: 'Edit Gym',
  [VIEW_KEYS.MUSCLES_LIST]: 'Muscles',
  [VIEW_KEYS.MUSCLES_CREATE]: 'Create Muscle',
  [VIEW_KEYS.MUSCLES_EDIT]: 'Edit Muscle'
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
    try {
      const userResponse = await userApi.getCurrent();
      const userData = (userResponse.data && userResponse.data.data) || userResponse.data;
      this.setData({ user: userData });
    } catch (error) {
      console.error('Failed to fetch user:', error);
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
