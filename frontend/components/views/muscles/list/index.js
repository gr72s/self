const { muscleApi } = require('../../../../services/api');
const { VIEW_KEYS } = require('../../../../types/view-router');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    muscles: [],
    loading: true,
    error: '',
    showDeleteConfirm: false,
    muscleIdToDelete: null
  },

  lifetimes: {
    attached() {
      this.loadMuscles();
    }
  },

  methods: {
    loadMuscles() {
      this.setData({ loading: true, error: '' });

      muscleApi.getAll()
        .then((res) => {
          const muscles = res.data?.data || res.data || [];
          this.setData({ muscles, loading: false });
        })
        .catch((err) => {
          console.error('Failed to load muscles:', err);
          this.setData({
            error: '加载肌肉失败，请重试',
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
      this.triggerEvent('navigate', { view: VIEW_KEYS.MUSCLES_CREATE });
    },

    handleEditMuscle(e) {
      const id = e.currentTarget?.dataset?.id;
      if (!id) return;
      this.triggerEvent('navigate', {
        view: VIEW_KEYS.MUSCLES_EDIT,
        params: { id }
      });
    },

    handleDeleteMuscle(e) {
      const muscleId = e.currentTarget?.dataset?.id;
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
            title: '肌肉已删除',
            icon: 'success'
          });

          this.loadMuscles();

          this.setData({
            showDeleteConfirm: false,
            muscleIdToDelete: null
          });
        })
        .catch((err) => {
          console.error('Failed to delete muscle:', err);
          wx.showToast({
            title: '删除肌肉失败',
            icon: 'none'
          });
        });
    }
  }
});
