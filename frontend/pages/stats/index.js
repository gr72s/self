const { workoutApi } = require('../../services/api');
const { SHELL_VIEW_STORAGE_KEY, buildView, VIEW_KEYS } = require('../../types/view-router');

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

Page({
  data: {
    workouts: [],
    thisMonthCount: 0,
    uniqueRoutines: 0,
    totalExercises: 0,
    recentWorkouts: [],
    menuOpen: false
  },

  onLoad() {
    this.fetchData();
  },

  onShow() {
    this.fetchData();
  },

  async fetchData() {
    try {
      const response = await workoutApi.getAll();
      const data = (response.data && response.data.data) || response.data || [];
      const workouts = Array.isArray(data) ? data : [];

      const now = new Date();
      const thisMonthCount = workouts.filter((w) => {
        const date = new Date(w.startTime || '');
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length;

      const uniqueRoutines = new Set(workouts.map((w) => w.routineId)).size;
      const totalExercises = workouts.reduce((sum, workout) => {
        return sum + ((workout.exercises && workout.exercises.length) || 0);
      }, 0);

      this.setData({
        workouts,
        thisMonthCount,
        uniqueRoutines,
        totalExercises,
        recentWorkouts: workouts.slice(0, 10)
      });
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
    }
  },

  navigateToWorkout(e) {
    const id = e.currentTarget.dataset.id;
    wx.setStorageSync(
      SHELL_VIEW_STORAGE_KEY,
      buildView(VIEW_KEYS.WORKOUTS_EDIT, id ? { id } : {})
    );
    wx.switchTab({ url: '/pages/index/index' });
  },

  handleMenuToggle() {
    this.setData({ menuOpen: !this.data.menuOpen });
  },

  formatDate
});
