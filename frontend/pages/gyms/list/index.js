// 健身房列表页面
const { gymApi } = require('../../../services/api');

Page({
  data: {
    gyms: [],
    loading: true,
    error: '',
    showDeleteConfirm: false,
    gymIdToDelete: null,
    menuOpen: false
  },

  onLoad() {
    this.loadGyms();
  },

  onShow() {
    this.loadGyms();
  },

  loadGyms() {
    this.setData({ loading: true, error: '' });

    gymApi.getAll()
      .then((res) => {
        const gyms = res?.data?.items;
        if (!Array.isArray(gyms)) {
          throw new Error('Invalid gym list response format');
        }
        this.setData({ gyms, loading: false });
      })
      .catch((err) => {
        console.error('加载健身房列表失败:', err);
        this.setData({
          error: '加载失败，请重试',
          loading: false
        });
      });
  },

  handleRefresh() {
    if (!this.data.loading) {
      this.loadGyms();
    }
  },

  handleAddGym() {
    wx.navigateTo({
      url: '/pages/gyms/create/index'
    });
  },

  handleEditGym(e) {
    const gymId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/gyms/edit/index?id=${gymId}`
    });
  },

  handleDeleteGym(e) {
    const gymId = e.currentTarget.dataset.id;
    this.setData({
      showDeleteConfirm: true,
      gymIdToDelete: gymId
    });
  },

  cancelDelete() {
    this.setData({
      showDeleteConfirm: false,
      gymIdToDelete: null
    });
  },

  confirmDelete() {
    if (!this.data.gymIdToDelete) return;

    gymApi.delete(this.data.gymIdToDelete)
      .then(() => {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });

        this.loadGyms();

        this.setData({
          showDeleteConfirm: false,
          gymIdToDelete: null
        });
      })
      .catch((err) => {
        console.error('删除健身房失败:', err);
        wx.showToast({
          title: '删除失败，请重试',
          icon: 'none'
        });
      });
  },

  handleMenuToggle(e) {
    this.setData({ menuOpen: e.detail.open });
  }
});
