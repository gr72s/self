const { exerciseApi, muscleApi } = require('../../../../services/api');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
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
          const muscleResponse = await muscleApi.getAll();
          const muscles = muscleResponse.data?.data || muscleResponse.data || [];
          this.setData({ muscles });
        } catch (error) {
          console.error('Failed to fetch muscles:', error);
        }
      } finally {
        this.setData({ loading: false });
      }
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
      const muscleId = e.currentTarget?.dataset?.id;
      if (!muscleId) return;

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
      const muscleId = e.currentTarget?.dataset?.id;
      if (!muscleId) return;

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
      const index = e.currentTarget?.dataset?.index;
      if (typeof index !== 'number') return;
      const cues = [...this.data.cues];
      cues.splice(index, 1);
      this.setData({ cues });
    },

    handleCueChange(e) {
      const index = e.currentTarget?.dataset?.index;
      if (typeof index !== 'number') return;
      const value = e.detail.value;
      const cues = [...this.data.cues];
      cues[index] = value;
      this.setData({ cues });
    },

    async handleSubmit() {
      const { name, originName, description, selectedMainMuscles, selectedSupportMuscles, cues } = this.data;

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

        await exerciseApi.create(exerciseData);

        wx.showToast({
          title: 'Exercise created successfully',
          icon: 'success'
        });

        setTimeout(() => {
          this.triggerEvent('submitted', { resource: 'exercise', action: 'create' });
        }, 800);
      } catch (error) {
        console.error('Failed to create exercise:', error);
        wx.showToast({
          title: 'Failed to create exercise',
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
