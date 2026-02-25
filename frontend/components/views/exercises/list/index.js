const { exerciseApi, parsePageItems } = require('../../../../services/api');
const { VIEW_KEYS } = require('../../../../types/view-router');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    exercises: [],
    loading: true,
    showDeleteConfirm: false,
    exerciseIdToDelete: null
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
        this.setData({ exercises: parsePageItems(response) });
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

    requestDelete(e) {
      const id = e.currentTarget?.dataset?.id;
      if (!id) return;

      this.setData({
        showDeleteConfirm: true,
        exerciseIdToDelete: id
      });
    },

    cancelDelete() {
      this.setData({
        showDeleteConfirm: false,
        exerciseIdToDelete: null
      });
    },

    async confirmDelete() {
      const { exerciseIdToDelete } = this.data;
      if (!exerciseIdToDelete) return;
      await this.deleteExercise(exerciseIdToDelete);
    },

    async deleteExercise(id) {
      try {
        await exerciseApi.delete(id);
        wx.showToast({
          title: '动作已删除',
          icon: 'success'
        });

        this.setData({
          showDeleteConfirm: false,
          exerciseIdToDelete: null
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
      const mainMuscles = Array.isArray(exercise.main_muscles)
        ? exercise.main_muscles.map((m) => m.name).join(', ')
        : '';
      const supportMuscles = Array.isArray(exercise.support_muscles)
        ? exercise.support_muscles.map((m) => m.name).join(', ')
        : '';

      if (mainMuscles && supportMuscles) {
        return `${mainMuscles}（主肌群），${supportMuscles}（辅助肌群）`;
      }
      if (mainMuscles) {
        return `${mainMuscles}（主肌群）`;
      }
      if (supportMuscles) {
        return `${supportMuscles}（辅助肌群）`;
      }
      return '-';
    }
  }
});
