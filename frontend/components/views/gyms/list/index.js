const { gymApi } = require('../../../../services/api');
const { VIEW_KEYS } = require('../../../../types/view-router');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    gyms: [],
    loading: true,
    error: '',
    showDeleteConfirm: false,
    gymIdToDelete: null
  },

  lifetimes: {
    attached() {
      this.loadGyms();
    }
  },

  methods: {
    loadGyms() {
      this.setData({ loading: true, error: '' });

      gymApi.getAll()
        .then((res) => {
          const gyms = res.data?.data || res.data || [];
          this.setData({ gyms, loading: false });
        })
        .catch((err) => {
          console.error('Failed to load gyms:', err);
          this.setData({
            error: 'Failed to load gyms. Please retry.',
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
      this.triggerEvent('navigate', { view: VIEW_KEYS.GYMS_CREATE });
    },

    handleEditGym(e) {
      const id = e.currentTarget?.dataset?.id;
      if (!id) return;
      this.triggerEvent('navigate', {
        view: VIEW_KEYS.GYMS_EDIT,
        params: { id }
      });
    },

    handleDeleteGym(e) {
      const gymId = e.currentTarget?.dataset?.id;
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
            title: 'Gym deleted',
            icon: 'success'
          });

          this.loadGyms();

          this.setData({
            showDeleteConfirm: false,
            gymIdToDelete: null
          });
        })
        .catch((err) => {
          console.error('Failed to delete gym:', err);
          wx.showToast({
            title: 'Failed to delete gym',
            icon: 'none'
          });
        });
    }
  }
});
