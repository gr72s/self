const { routineApi, exerciseApi } = require('../../../../services/api');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
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

  lifetimes: {
    attached() {
      this.fetchInitialData();
    }
  },

  methods: {
    async fetchInitialData() {
      this.setData({ loading: true });
      try {
        try {
          const exerciseResponse = await exerciseApi.getAll();
          const exercises = exerciseResponse.data?.data || exerciseResponse.data || [];
          this.setData({ exercises });
        } catch (error) {
          console.error('Failed to fetch exercises:', error);
        }

        const mockTargets = [
          { id: 1, name: 'Strength' },
          { id: 2, name: 'Endurance' },
          { id: 3, name: 'Flexibility' },
          { id: 4, name: 'Cardio' }
        ];
        this.setData({ targets: mockTargets });
      } finally {
        this.setData({ loading: false });
      }
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
      const { name, description, selectedTargets, selectedExercises, note } = this.data;

      if (!name.trim()) {
        wx.showToast({ title: 'Please enter routine name', icon: 'none' });
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

        await routineApi.create(routineData);

        wx.showToast({
          title: 'Routine created successfully',
          icon: 'success'
        });

        setTimeout(() => {
          this.triggerEvent('submitted', { resource: 'routine', action: 'create' });
        }, 800);
      } catch (error) {
        console.error('Failed to create routine:', error);
        wx.showToast({
          title: 'Failed to create routine',
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
