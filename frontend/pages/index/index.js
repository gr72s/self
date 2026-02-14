// 首页逻辑
const { workoutApi, userApi } = require('../../services/api');



// 格式化工具函数
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const formatDateTime = (dateString) => {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    workouts: [],
    loading: true,
    currentWorkout: null,
    user: null,
    userInfo: null,
    thisMonthCount: 0,
    uniqueRoutines: 0,
    totalExercises: 0,
    recentWorkouts: [],
    menuOpen: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    console.log('HomePage loaded');
    this.fetchData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时可以刷新数据
    this.fetchData();
  },

  /**
   * 获取数据
   */
  async fetchData() {
    this.setData({ loading: true });
    try {
      // 从本地存储中获取用户信息
      try {
        const storedUserInfo = wx.getStorageSync('userInfo');
        if (storedUserInfo) {
          this.setData({ userInfo: storedUserInfo });
        }
      } catch (error) {
        console.error('Failed to get stored user info:', error);
      }
      
      // 获取用户信息
      try {
        const userResponse = await userApi.getCurrent();
        const userData = (userResponse.data && userResponse.data.data) || userResponse.data;
        this.setData({ user: userData });
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }

      // 获取训练记录
      try {
        const workoutResponse = await workoutApi.getAll();
        const workoutData = (workoutResponse.data && workoutResponse.data.data) || workoutResponse.data || [];
        const workouts = Array.isArray(workoutData) ? workoutData : [];
        this.setData({ workouts });
        
        // 计算统计数据
        this.calculateStats(workouts);
        
        // 获取最近训练
        this.setData({ recentWorkouts: workouts.slice(0, 5) });
      } catch (error) {
        console.error('Failed to fetch workouts:', error);
      }

      // 获取当前训练
      try {
        const currentResponse = await workoutApi.getInProcess();
        const currentData = (currentResponse.data && currentResponse.data.data) || currentResponse.data;
        this.setData({ currentWorkout: currentData });
      } catch (error) {
        console.error('Failed to fetch current workout:', error);
      }
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 计算统计数据
   */
  calculateStats(workouts) {
    // 计算本月训练次数
    const now = new Date();
    const thisMonthCount = workouts.filter(w => {
      const date = new Date(w.startTime || '');
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    // 计算使用过的训练计划数量
    const uniqueRoutines = new Set(workouts.map(w => w.routineId)).size;

    // 计算总训练动作数
    const totalExercises = workouts.reduce((sum, workout) => {
      return sum + ((workout.exercises && workout.exercises.length) || 0);
    }, 0);

    this.setData({ thisMonthCount, uniqueRoutines, totalExercises });
  },

  /**
   * 导航到训练列表
   */
  navigateToWorkouts() {
    wx.navigateTo({
      url: '/pages/workouts/list/index'
    });
  },

  /**
   * 导航到训练计划列表
   */
  navigateToRoutines() {
    wx.navigateTo({
      url: '/pages/routines/list/index'
    });
  },

  /**
   * 导航到训练详情
   */
  navigateToWorkoutDetail(e) {
    const workoutId = (e && e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.id) || (this.data.currentWorkout && this.data.currentWorkout.id);
    if (workoutId) {
      wx.navigateTo({
        url: `/pages/workouts/list/index?id=${workoutId}`
      });
    }
  },

  /**
   * 开始新训练
   */
  startNewWorkout() {
    wx.navigateTo({
      url: '/pages/workouts/create/index'
    });
  },

  /**
   * 处理菜单切换
   */
  handleMenuToggle(e) {
    this.setData({ menuOpen: e.detail.open });
  },

  /**
   * 格式化日期
   */
  formatDate,

  /**
   * 格式化时间
   */
  formatTime,

  /**
   * 格式化日期时间
   */
  formatDateTime
});