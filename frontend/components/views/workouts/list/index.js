const { workoutApi } = require('../../../../services/api');
const { VIEW_KEYS } = require('../../../../types/view-router');

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '00:00';
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const duration = Math.floor((end - start) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    workouts: [],
    loading: true
  },

  lifetimes: {
    attached() {
      this.fetchWorkouts();
    }
  },

  methods: {
    async fetchWorkouts() {
      this.setData({ loading: true });
      try {
        const response = await workoutApi.getAll();
        const data = (response.data && response.data.data) || response.data || [];
        const workouts = Array.isArray(data) ? data : [];
        this.setData({ workouts });
      } catch (error) {
        console.error('Failed to fetch workouts:', error);
        wx.showToast({
          title: '加载训练记录失败',
          icon: 'none'
        });
      } finally {
        this.setData({ loading: false });
      }
    },

    handleRefresh() {
      if (!this.data.loading) {
        this.fetchWorkouts();
      }
    },

    navigateToCreate() {
      this.triggerEvent('navigate', { view: VIEW_KEYS.WORKOUTS_CREATE });
    },

    navigateToEdit(e) {
      const id = e?.currentTarget?.dataset?.id;
      if (!id) return;
      this.triggerEvent('navigate', {
        view: VIEW_KEYS.WORKOUTS_EDIT,
        params: { id }
      });
    },

    navigateToDetail(e) {
      const id = e?.currentTarget?.dataset?.id;
      if (!id) return;
      this.triggerEvent('navigate', {
        view: VIEW_KEYS.WORKOUTS_EDIT,
        params: { id }
      });
    },

    confirmDelete(e) {
      const id = e?.currentTarget?.dataset?.id;
      if (!id) return;
      wx.showModal({
        title: '删除训练记录',
        content: '确定删除该训练记录吗？',
        confirmText: '删除',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            await this.deleteWorkout(id);
          }
        }
      });
    },

    async deleteWorkout(id) {
      try {
        await workoutApi.delete(id);
        wx.showToast({
          title: '训练记录已删除',
          icon: 'success'
        });
        this.fetchWorkouts();
      } catch (error) {
        console.error('Failed to delete workout:', error);
        wx.showToast({
          title: '删除训练记录失败',
          icon: 'none'
        });
      }
    },

    formatDate,
    formatTime,
    calculateDuration
  }
});
