const { routineApi } = require('../../../../services/api');
const { VIEW_KEYS } = require('../../../../types/view-router');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    routines: [],
    loading: true
  },

  lifetimes: {
    attached() {
      this.fetchRoutines();
    }
  },

  methods: {
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

    handleRefresh() {
      if (!this.data.loading) {
        this.fetchRoutines();
      }
    },

    navigateToCreate() {
      this.triggerEvent('navigate', { view: VIEW_KEYS.ROUTINES_CREATE });
    },

    navigateToEdit(e) {
      const id = e.currentTarget?.dataset?.id;
      if (!id) return;
      this.triggerEvent('navigate', {
        view: VIEW_KEYS.ROUTINES_EDIT,
        params: { id }
      });
    },

    confirmDelete(e) {
      const id = e.currentTarget?.dataset?.id;
      if (!id) return;

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
    },

    async deleteRoutine(id) {
      try {
        await routineApi.delete(id);
        wx.showToast({
          title: 'Routine deleted',
          icon: 'success'
        });
        this.fetchRoutines();
      } catch (error) {
        console.error('Failed to delete routine:', error);
        wx.showToast({
          title: 'Failed to delete routine',
          icon: 'none'
        });
      }
    }
  }
});
