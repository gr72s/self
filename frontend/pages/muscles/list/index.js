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
    this.loadMuscles();
  },

  loadMuscles() {
    this.setData({ loading: true, error: '' });

    muscleApi.getAll()
      .then((res) => {
        const muscles = res?.data?.items;
        if (!Array.isArray(muscles)) {
          throw new Error('Invalid muscle list response format');
        }
        this.setData({ muscles, loading: false });
      })
      .catch((err) => {
        console.error('加载肌肉列表失败:', err);
        this.setData({
          error: '加载失败，请重试',
          loading: false
        });
      });
  },

  handleRefresh() {
    if (!this.data.loading) {
      this.loadMuscles();
    }
  },

  handleAddMuscle() {
    wx.navigateTo({
      url: '/pages/muscles/create/index'
    });
  },

  handleEditMuscle(e) {
    const muscleId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/muscles/edit/index?id=${muscleId}`
    });
  },

  handleDeleteMuscle(e) {
    const muscleId = e.currentTarget.dataset.id;
    this.setData({
      showDeleteConfirm: true,
      muscleIdToDelete: muscleId
    });
  },

  cancelDelete() {
    this.setData({
      showDeleteConfirm: false,
      muscleIdToDelete: null
    });
  },

  confirmDelete() {
    if (!this.data.muscleIdToDelete) return;

    muscleApi.delete(this.data.muscleIdToDelete)
      .then(() => {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });

        this.loadMuscles();

        this.setData({
          showDeleteConfirm: false,
          muscleIdToDelete: null
        });
      })
      .catch((err) => {
        console.error('删除肌肉失败:', err);
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
