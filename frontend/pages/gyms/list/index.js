// 健身房列表页面
const { gymApi } = require('../../../services/api');

Page({
  data: {
    gyms: [],
    loading: true,
    error: '',
    showDeleteConfirm: false,
    gymIdToDelete: null
  },

  onLoad() {
    this.loadGyms();
  },

  onShow() {
    // 页面显示时重新加载数据，确保数据最新
    this.loadGyms();
  },

  // 加载健身房列表
  loadGyms() {
    this.setData({ loading: true, error: '' });
    
    gymApi.getAll()
      .then(res => {
        const gyms = res.data?.data || res.data || [];
        this.setData({ gyms, loading: false });
      })
      .catch(err => {
        console.error('加载健身房列表失败:', err);
        this.setData({ 
          error: '加载失败，请重试', 
          loading: false 
        });
      });
  },

  // 跳转到添加健身房页面
  handleAddGym() {
    wx.navigateTo({
      url: '/pages/gyms/create/index'
    });
  },

  // 跳转到编辑健身房页面
  handleEditGym(e) {
    const gymId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/gyms/edit/index?id=${gymId}`
    });
  },

  // 显示删除确认对话框
  handleDeleteGym(e) {
    const gymId = e.currentTarget.dataset.id;
    this.setData({
      showDeleteConfirm: true,
      gymIdToDelete: gymId
    });
  },

  // 取消删除
  cancelDelete() {
    this.setData({
      showDeleteConfirm: false,
      gymIdToDelete: null
    });
  },

  // 确认删除
  confirmDelete() {
    if (!this.data.gymIdToDelete) return;
    
    gymApi.delete(this.data.gymIdToDelete)
      .then(() => {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        // 刷新列表
        this.loadGyms();
        
        // 关闭对话框
        this.setData({
          showDeleteConfirm: false,
          gymIdToDelete: null
        });
      })
      .catch(err => {
        console.error('删除健身房失败:', err);
        wx.showToast({
          title: '删除失败，请重试',
          icon: 'none'
        });
      });
  }
});