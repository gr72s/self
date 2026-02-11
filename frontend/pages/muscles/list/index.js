// 肌肉列表页面
const { muscleApi } = require('../../../services/api');

Page({
  data: {
    muscles: [],
    loading: true,
    error: '',
    showDeleteConfirm: false,
    muscleIdToDelete: null,
    menuOpen: false
  },

  onLoad() {
    this.loadMuscles();
  },

  onShow() {
    // 页面显示时重新加载数据，确保数据最新
    this.loadMuscles();
  },

  // 加载肌肉列表
  loadMuscles() {
    this.setData({ loading: true, error: '' });
    
    muscleApi.getAll()
      .then(res => {
        const muscles = res.data?.data || res.data || [];
        this.setData({ muscles, loading: false });
      })
      .catch(err => {
        console.error('加载肌肉列表失败:', err);
        this.setData({ 
          error: '加载失败，请重试', 
          loading: false 
        });
      });
  },

  // 处理刷新
  handleRefresh() {
    if (!this.data.loading) {
      this.loadMuscles();
    }
  },

  // 跳转到添加肌肉页面
  handleAddMuscle() {
    wx.navigateTo({
      url: '/pages/muscles/create/index'
    });
  },

  // 跳转到编辑肌肉页面
  handleEditMuscle(e) {
    const muscleId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/muscles/edit/index?id=${muscleId}`
    });
  },

  // 显示删除确认对话框
  handleDeleteMuscle(e) {
    const muscleId = e.currentTarget.dataset.id;
    this.setData({
      showDeleteConfirm: true,
      muscleIdToDelete: muscleId
    });
  },

  // 取消删除
  cancelDelete() {
    this.setData({
      showDeleteConfirm: false,
      muscleIdToDelete: null
    });
  },

  // 确认删除
  confirmDelete() {
    if (!this.data.muscleIdToDelete) return;
    
    muscleApi.delete(this.data.muscleIdToDelete)
      .then(() => {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        // 刷新列表
        this.loadMuscles();
        
        // 关闭对话框
        this.setData({
          showDeleteConfirm: false,
          muscleIdToDelete: null
        });
      })
      .catch(err => {
        console.error('删除肌肉失败:', err);
        wx.showToast({
          title: '删除失败，请重试',
          icon: 'none'
        });
      });
  },

  // 处理菜单切换
  handleMenuToggle(e) {
    this.setData({ menuOpen: e.detail.open });
  }
});