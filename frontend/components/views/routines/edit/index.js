const { routineApi, exerciseApi } = require('../../../../services/api');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  properties: {
    entityId: {
      type: String,
      value: ''
    }
  },

  data: {
    routine: null,
    name: '',
    description: '',
    targets: [],
    exercises: [],
    selectedTargets: [],
    selectedExercises: [],
    note: '',
    loading: true,
    submitting: false
  },

  observers: {
    entityId() {
      this.bootstrap();
    }
  },

  lifetimes: {
    attached() {
      this.bootstrap();
    }
  },

  methods: {
    bootstrap() {
      if (!this.data.entityId) {
        return;
      }
      this.fetchRoutineData();
    },

    async fetchRoutineData() {
      this.setData({ loading: true });
      try {
        const routineId = this.data.entityId;
        if (!routineId) {
          throw new Error('需要计划ID');
        }

        const routineResponse = await routineApi.getById(routineId);
        const routine = routineResponse.data?.data || routineResponse.data;
        this.setData({ routine });

        const exerciseResponse = await exerciseApi.getAll();
        const exercises = exerciseResponse.data?.data || exerciseResponse.data || [];
        this.setData({ exercises });

        const mockTargets = [
          { id: 1, name: 'Strength' },
          { id: 2, name: 'Endurance' },
          { id: 3, name: 'Flexibility' },
          { id: 4, name: 'Cardio' }
        ];
        this.setData({ targets: mockTargets });

        this.initFormData(routine);
      } catch (error) {
        console.error('Failed to fetch routine data:', error);
        wx.showToast({ title: '加载计划数据失败', icon: 'none' });
      } finally {
        this.setData({ loading: false });
      }
    },

    initFormData(routine) {
      const { name, description, targets, exercises, note } = routine;

      const selectedTargets = [];
      if (targets && Array.isArray(targets)) {
        targets.forEach((target) => {
          if (typeof target === 'object' && target.id) {
            selectedTargets.push(target.id);
          }
        });
      }

      const selectedExercises = [];
      if (exercises && Array.isArray(exercises)) {
        exercises.forEach((exercise) => {
          if (typeof exercise === 'object' && exercise.id) {
            selectedExercises.push(exercise.id);
          }
        });
      }

      this.setData({
        name: name || '',
        description: description || '',
        selectedTargets,
        selectedExercises,
        note: note || ''
      });
    },

    handleNameChange(e) {
      this.setData({ name: e.detail.value });
    },

    handleDescriptionChange(e) {
      this.setData({ description: e.detail.value });
    },

    handleNoteChange(e) {
      this.setData({ note: e.detail.value });
    },

    toggleTarget(e) {
      const targetId = e.currentTarget?.dataset?.id;
      if (typeof targetId !== 'number') return;

      const selectedTargets = [...this.data.selectedTargets];
      const index = selectedTargets.indexOf(targetId);
      if (index > -1) {
        selectedTargets.splice(index, 1);
      } else {
        selectedTargets.push(targetId);
      }

      this.setData({ selectedTargets });
    },

    toggleExercise(e) {
      const exerciseId = e.currentTarget?.dataset?.id;
      if (!exerciseId) return;

      const selectedExercises = [...this.data.selectedExercises];
      const index = selectedExercises.indexOf(exerciseId);
      if (index > -1) {
        selectedExercises.splice(index, 1);
      } else {
        selectedExercises.push(exerciseId);
      }

      this.setData({ selectedExercises });
    },

    async handleSubmit() {
      const { entityId, name, description, selectedTargets, selectedExercises, note } = this.data;

      if (!name.trim()) {
        wx.showToast({ title: '请输入计划名称', icon: 'none' });
        return;
      }

      if (!entityId) {
        wx.showToast({ title: '无效的计划ID', icon: 'none' });
        return;
      }

      this.setData({ submitting: true });

      try {
        const routineData = {
          name: name.trim(),
          description: description.trim(),
          targetIds: selectedTargets,
          exerciseIds: selectedExercises,
          note: note.trim()
        };

        await routineApi.update(entityId, routineData);

        wx.showToast({
          title: '计划更新成功',
          icon: 'success'
        });

        setTimeout(() => {
          this.triggerEvent('submitted', { resource: 'routine', action: 'update' });
        }, 800);
      } catch (error) {
        console.error('Failed to update routine:', error);
        wx.showToast({
          title: '更新计划失败',
          icon: 'none'
        });
      } finally {
        this.setData({ submitting: false });
      }
    },

    navigateBack() {
      this.triggerEvent('cancel');
    }
  }
});
