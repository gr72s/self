const { routineApi, parsePageItems } = require('../../../../services/api');
const { VIEW_KEYS } = require('../../../../types/view-router');

const normalizeRoutine = (item) => ({
  ...item,
  slot_count: Array.isArray(item.slots) ? item.slots.length : 0,
  target_count: Array.isArray(item.targets) ? item.targets.length : 0
});

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    routines: [],
    loading: true,
    showDeleteConfirm: false,
    routineIdToDelete: null
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
        const routines = parsePageItems(response).map(normalizeRoutine);
        this.setData({ routines });
      } catch (error) {
        console.error('Failed to fetch routines:', error);
        wx.showToast({
          title: '加载计划失败',
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

    requestDelete(e) {
      const id = e.currentTarget?.dataset?.id;
      if (!id) return;

      this.setData({
        showDeleteConfirm: true,
        routineIdToDelete: id
      });
    },

    cancelDelete() {
      this.setData({
        showDeleteConfirm: false,
        routineIdToDelete: null
      });
    },

    async confirmDelete() {
      const { routineIdToDelete } = this.data;
      if (!routineIdToDelete) return;
      await this.deleteRoutine(routineIdToDelete);
    },

    async deleteRoutine(id) {
      try {
        await routineApi.delete(id);
        wx.showToast({
          title: '计划已删除',
          icon: 'success'
        });

        this.setData({
          showDeleteConfirm: false,
          routineIdToDelete: null
        });

        this.fetchRoutines();
      } catch (error) {
        console.error('Failed to delete routine:', error);
        wx.showToast({
          title: '删除计划失败',
          icon: 'none'
        });
      }
    }
  }
});
