const { exerciseApi } = require('../../../../services/api');
const { VIEW_KEYS } = require('../../../../types/view-router');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    exercises: [],
    loading: true
  },

  lifetimes: {
    attached() {
      this.fetchExercises();
    }
  },

  methods: {
    async fetchExercises() {
      this.setData({ loading: true });
      try {
        const response = await exerciseApi.getAll();
        const data = response.data?.data || response.data || [];
        const exercises = Array.isArray(data) ? data : [];
        this.setData({ exercises });
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
        wx.showToast({
          title: '加载动作失败',
          icon: 'none'
        });
      } finally {
        this.setData({ loading: false });
      }
    },

    handleRefresh() {
      if (!this.data.loading) {
        this.fetchExercises();
      }
    },

    navigateToCreate() {
      this.triggerEvent('navigate', { view: VIEW_KEYS.EXERCISES_CREATE });
    },

    navigateToEdit(e) {
      const id = e.currentTarget?.dataset?.id;
      if (!id) return;
      this.triggerEvent('navigate', {
        view: VIEW_KEYS.EXERCISES_EDIT,
        params: { id }
      });
    },

    confirmDelete(e) {
      const id = e.currentTarget?.dataset?.id;
      if (!id) return;

      wx.showModal({
        title: '删除动作',
        content: '确定删除该动作吗？',
        confirmText: '删除',
        cancelText: '取消',
        success: async (res) => {
          if (res.confirm) {
            await this.deleteExercise(id);
          }
        }
      });
    },

    async deleteExercise(id) {
      try {
        await exerciseApi.delete(id);
        wx.showToast({
          title: '动作已删除',
          icon: 'success'
        });
        this.fetchExercises();
      } catch (error) {
        console.error('Failed to delete exercise:', error);
        wx.showToast({
          title: '删除动作失败',
          icon: 'none'
        });
      }
    },

    getMusclesList(exercise) {
      const mainMuscles = exercise.mainMuscles ? Array.from(exercise.mainMuscles).map((m) => m.name).join(', ') : '';
      const supportMuscles = exercise.supportMuscles ? Array.from(exercise.supportMuscles).map((m) => m.name).join(', ') : '';

      if (mainMuscles && supportMuscles) {
        return `${mainMuscles} (Main), ${supportMuscles} (Support)`;
      }
      if (mainMuscles) {
        return `${mainMuscles} (Main)`;
      }
      if (supportMuscles) {
        return `${supportMuscles} (Support)`;
      }
      return '';
    }
  }
});
