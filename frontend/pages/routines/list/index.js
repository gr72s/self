// 计划列表逻辑
const { routineApi } = require('../../../services/api');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    routines: [],
    loading: true,
    menuOpen: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    console.log('RoutineListPage loaded');
    this.fetchRoutines();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时刷新数据
    this.fetchRoutines();
  },

  /**
   * 获取计划列表
   */
  async fetchRoutines() {
    this.setData({ loading: true });
    try {
      const response = await routineApi.getAll();
      const data = response.data?.data || response.data || [];
      const routines = Array.isArray(data) ? data : [];
      this.setData({ routines });
    } catch (error) {
      console.error('Failed to fetch routines:', error);
      wx.showToast({
        title: 'Failed to load routines',
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
      this.fetchRoutines();
    }
  },

  /**
   * 导航到创建页面
   */
  navigateToCreate() {
    wx.navigateTo({
      url: '/pages/routines/create/index'
    });
  },

  /**
   * 导航到编辑页面
   */
  navigateToEdit(e) {
    const id = e.currentTarget?.dataset?.id;
    if (id) {
      wx.navigateTo({
        url: `/pages/routines/edit/index?id=${id}`
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
        title: 'Delete Routine',
        content: 'Are you sure you want to delete this routine?',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        success: async (res) => {
          if (res.confirm) {
            await this.deleteRoutine(id);
          }
        }
      });
    }
  },

  /**
   * 删除计划
   */
  async deleteRoutine(id) {
    try {
      await routineApi.delete(id);
      wx.showToast({
        title: 'Routine deleted',
        icon: 'success'
      });
      // 重新获取数据
      this.fetchRoutines();
    } catch (error) {
      console.error('Failed to delete routine:', error);
      wx.showToast({
        title: 'Failed to delete routine',
        icon: 'none'
      });
    }
  },

  /**
   * 处理菜单切换
   */
  handleMenuToggle(e) {
    this.setData({ menuOpen: e.detail.open });
  }
});