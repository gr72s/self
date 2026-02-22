const { workoutApi, userApi } = require('../../services/api');

Page({
  data: {
    workouts: [],
    user: null,
    uniqueRoutines: 0,
    totalExercises: 0
  },

  onLoad() {
    this.fetchData();
  },

  onShow() {
    this.fetchData();
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

      const uniqueRoutines = new Set(workouts.map(w => w.routineId)).size;
      const totalExercises = workouts.reduce((sum, workout) => {
        return sum + ((workout.exercises && workout.exercises.length) || 0);
      }, 0);

      this.setData({ workouts, uniqueRoutines, totalExercises });
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
    }
  },

  navigateToWorkouts() {
    wx.navigateTo({ url: '/pages/workouts/list/index' });
  },

  navigateToRoutines() {
    wx.navigateTo({ url: '/pages/routines/list/index' });
  },

  navigateToExercises() {
    wx.navigateTo({ url: '/pages/exercises/list/index' });
  },

  navigateToGyms() {
    wx.navigateTo({ url: '/pages/gyms/list/index' });
  },

  navigateToMuscles() {
    wx.navigateTo({ url: '/pages/muscles/list/index' });
  },

  navigateToProfile() {
    wx.switchTab({ url: '/pages/profile/index' });
  },

  startNewWorkout() {
    wx.navigateTo({ url: '/pages/workouts/create/index' });
  }
});