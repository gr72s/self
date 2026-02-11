// 动作列表逻辑
const { exerciseApi } = require('../../../services/api');


Page({
  /**
   * 页面的初始数据
   */
  data: {
    exercises: [],
    loading: true,
    menuOpen: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    console.log('ExerciseListPage loaded');
    this.fetchExercises();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时刷新数据
    this.fetchExercises();
  },

  /**
   * 获取动作列表
   */
  async fetchExercises() {
    this.setData({ loading: true });
    try {
      const response = await exerciseApi.getAll();
      const data = response.data?.data || response.data || [];
      const exercises = Array.isArray(data) ? data : [];
      this.setData({ exercises });
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
      wx.showToast({
        title: 'Failed to load exercises',
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
      this.fetchExercises();
    }
  },

  /**
   * 导航到创建页面
   */
  navigateToCreate() {
    wx.navigateTo({
      url: '/pages/exercises/create/index'
    });
  },

  /**
   * 导航到编辑页面
   */
  navigateToEdit(e) {
    const id = e.currentTarget?.dataset?.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/exercises/edit/index?id=${id}`
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
        title: 'Delete Exercise',
        content: 'Are you sure you want to delete this exercise?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        success: async (res) => {
          if (res.confirm) {
            await this.deleteExercise(id);
          }
        }
      });
    }
  },

  /**
   * 删除动作
   */
  async deleteExercise(id) {
    try {
      await exerciseApi.delete(id);
      wx.showToast({
        title: 'Exercise deleted',
        icon: 'success'
      });
      // 重新获取数据
      this.fetchExercises();
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      wx.showToast({
        title: 'Failed to delete exercise',
        icon: 'none'
      });
    }
  },

  /**
   * 获取肌肉列表文本
   */
  getMusclesList(exercise) {
    const mainMuscles = exercise.mainMuscles ? Array.from(exercise.mainMuscles).map(m => m.name).join(', ') : '';
    const supportMuscles = exercise.supportMuscles ? Array.from(exercise.supportMuscles).map(m => m.name).join(', ') : '';
    
    if (mainMuscles && supportMuscles) {
      return `${mainMuscles} (Main), ${supportMuscles} (Support)`;
    } else if (mainMuscles) {
      return `${mainMuscles} (Main)`;
    } else if (supportMuscles) {
      return `${supportMuscles} (Support)`;
    }
    return '';
  },

  /**
   * 处理菜单切换
   */
  handleMenuToggle(e) {
    this.setData({ menuOpen: e.detail.open });
  }
});