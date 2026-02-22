const { exerciseApi, muscleApi } = require('../../../../services/api');

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
    exercise: null,
    name: '',
    originName: '',
    description: '',
    muscles: [],
    selectedMainMuscles: [],
    selectedSupportMuscles: [],
    cues: [],
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
      this.fetchExerciseData();
    },

    async fetchExerciseData() {
      this.setData({ loading: true });
      try {
        const exerciseId = this.data.entityId;

        const exerciseResponse = await exerciseApi.getById(exerciseId);
        const exercise = exerciseResponse.data?.data || exerciseResponse.data;
        this.setData({ exercise });

        const muscleResponse = await muscleApi.getAll();
        const muscles = muscleResponse.data?.data || muscleResponse.data || [];
        this.setData({ muscles });

        this.initFormData(exercise);
      } catch (error) {
        console.error('Failed to fetch exercise data:', error);
        wx.showToast({ title: 'Failed to load exercise data', icon: 'none' });
      } finally {
        this.setData({ loading: false });
      }
    },

    initFormData(exercise) {
      const { name, originName, description, mainMuscles, supportMuscles, cues } = exercise;

      const selectedMainMuscles = [];
      if (mainMuscles) {
        mainMuscles.forEach((muscle) => {
          selectedMainMuscles.push(muscle.id);
        });
      }

      const selectedSupportMuscles = [];
      if (supportMuscles) {
        supportMuscles.forEach((muscle) => {
          selectedSupportMuscles.push(muscle.id);
        });
      }

      this.setData({
        name: name || '',
        originName: originName || '',
        description: description || '',
        selectedMainMuscles,
        selectedSupportMuscles,
        cues: cues || []
      });
    },

    handleNameChange(e) {
      this.setData({ name: e.detail.value });
    },

    handleOriginNameChange(e) {
      this.setData({ originName: e.detail.value });
    },

    handleDescriptionChange(e) {
      this.setData({ description: e.detail.value });
    },

    toggleMainMuscle(e) {
      const muscleId = e.currentTarget.dataset.id;
      const selectedMainMuscles = [...this.data.selectedMainMuscles];

      const index = selectedMainMuscles.indexOf(muscleId);
      if (index > -1) {
        selectedMainMuscles.splice(index, 1);
      } else {
        selectedMainMuscles.push(muscleId);
      }

      this.setData({ selectedMainMuscles });
    },

    toggleSupportMuscle(e) {
      const muscleId = e.currentTarget.dataset.id;
      const selectedSupportMuscles = [...this.data.selectedSupportMuscles];

      const index = selectedSupportMuscles.indexOf(muscleId);
      if (index > -1) {
        selectedSupportMuscles.splice(index, 1);
      } else {
        selectedSupportMuscles.push(muscleId);
      }

      this.setData({ selectedSupportMuscles });
    },

    addCue() {
      const cues = [...this.data.cues, ''];
      this.setData({ cues });
    },

    removeCue(e) {
      const index = e.currentTarget.dataset.index;
      const cues = [...this.data.cues];
      cues.splice(index, 1);
      this.setData({ cues });
    },

    handleCueChange(e) {
      const index = e.currentTarget.dataset.index;
      const value = e.detail.value;
      const cues = [...this.data.cues];
      cues[index] = value;
      this.setData({ cues });
    },

    async handleSubmit() {
      const { entityId, name, originName, description, selectedMainMuscles, selectedSupportMuscles, cues } = this.data;

      if (!name.trim()) {
        wx.showToast({ title: 'Please enter exercise name', icon: 'none' });
        return;
      }

      this.setData({ submitting: true });

      try {
        const exerciseData = {
          name: name.trim(),
          originName: originName.trim(),
          description: description.trim(),
          mainMuscleIds: selectedMainMuscles,
          supportMuscleIds: selectedSupportMuscles,
          cues: cues.filter((cue) => cue.trim())
        };

        await exerciseApi.update(entityId, exerciseData);

        wx.showToast({
          title: 'Exercise updated successfully',
          icon: 'success'
        });

        setTimeout(() => {
          this.triggerEvent('submitted', { resource: 'exercise', action: 'update' });
        }, 800);
      } catch (error) {
        console.error('Failed to update exercise:', error);
        wx.showToast({
          title: 'Failed to update exercise',
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
