// 训练列表逻辑
const { workoutApi } = require('../../../services/api');


// 格式化工具函数
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '00:00';
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const duration = Math.floor((end - start) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    workouts: [],
    loading: true,
    menuOpen: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    console.log('WorkoutListPage loaded');
    this.fetchWorkouts();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时刷新数据
    this.fetchWorkouts();
  },

  /**
   * 获取训练列表
   */
  async fetchWorkouts() {
    this.setData({ loading: true });
    try {
      const response = await workoutApi.getAll();
      const data = response.data?.data || response.data || [];
      const workouts = Array.isArray(data) ? data : [];
      this.setData({ workouts });
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
      wx.showToast({
        title: 'Failed to load workouts',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 处理刷新
   */
  handleRefresh() {
    if (!this.data.loading) {
      this.fetchWorkouts();
    }
  },

  /**
   * 导航到创建页面
   */
  navigateToCreate() {
    wx.navigateTo({
      url: '/pages/workouts/create/index'
    });
  },

  /**
   * 导航到编辑页面
   */
  navigateToEdit(e) {
    const id = e.currentTarget?.dataset?.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/workouts/edit/index?id=${id}`
      });
    }
  },

  /**
   * 导航到详情页面
   */
  navigateToDetail(e) {
    const id = e.currentTarget?.dataset?.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/workouts/edit/index?id=${id}`
      });
    }
  },

  /**
   * 确认删除
   */
  confirmDelete(e) {
    const id = e.currentTarget?.dataset?.id;
    if (id) {
      wx.showModal({
        title: 'Delete Workout',
        content: 'Are you sure you want to delete this workout?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        success: async (res) => {
          if (res.confirm) {
            await this.deleteWorkout(id);
          }
        }
      });
    }
  },

  /**
   * 删除训练
   */
  async deleteWorkout(id) {
    try {
      await workoutApi.delete(id);
      wx.showToast({
        title: 'Workout deleted',
        icon: 'success'
      });
      // 重新获取数据
      this.fetchWorkouts();
    } catch (error) {
      console.error('Failed to delete workout:', error);
      wx.showToast({
        title: 'Failed to delete workout',
        icon: 'none'
      });
    }
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
   * 计算时长
   */
  calculateDuration
});