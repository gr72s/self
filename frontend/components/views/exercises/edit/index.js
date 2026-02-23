const {
  exerciseApi,
  muscleApi,
  unwrapResponseData,
  parsePageItems
} = require('../../../../services/api');

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
    keypoint: '',
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

        const [exerciseResponse, muscleResponse] = await Promise.all([
          exerciseApi.getById(exerciseId),
          muscleApi.getAll()
        ]);

        const exercise = unwrapResponseData(exerciseResponse);
        const muscles = parsePageItems(muscleResponse);

        this.setData({ exercise, muscles });
        this.initFormData(exercise);
      } catch (error) {
        console.error('Failed to fetch exercise data:', error);
        wx.showToast({ title: '加载动作数据失败', icon: 'none' });
      } finally {
        this.setData({ loading: false });
      }
    },

    initFormData(exercise) {
      const selectedMainMuscles = Array.isArray(exercise && exercise.main_muscles)
        ? exercise.main_muscles.map((item) => item.id).filter((id) => typeof id === 'number')
        : [];

      const selectedSupportMuscles = Array.isArray(exercise && exercise.support_muscles)
        ? exercise.support_muscles.map((item) => item.id).filter((id) => typeof id === 'number')
        : [];

      this.setData({
        name: (exercise && exercise.name) || '',
        originName: (exercise && exercise.origin_name) || '',
        description: (exercise && exercise.description) || '',
        keypoint: (exercise && exercise.keypoint) || '',
        selectedMainMuscles,
        selectedSupportMuscles,
        cues: Array.isArray(exercise && exercise.cues) ? exercise.cues : []
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

    handleKeypointChange(e) {
      this.setData({ keypoint: e.detail.value });
    },

    toggleMainMuscle(e) {
      const muscleId = e.currentTarget?.dataset?.id;
      if (typeof muscleId !== 'number') return;

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
      if (typeof muscleId !== 'number') return;

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
      const { entityId, name, originName, description, keypoint, selectedMainMuscles, selectedSupportMuscles, cues } = this.data;
      const trimmedName = name.trim();

      if (trimmedName.length < 2) {
        wx.showToast({ title: '动作名称至少2个字符', icon: 'none' });
        return;
      }

      if (!Array.isArray(selectedMainMuscles) || selectedMainMuscles.length === 0) {
        wx.showToast({ title: '请至少选择一个主要肌肉', icon: 'none' });
        return;
      }

      this.setData({ submitting: true });

      try {
        const exerciseData = {
          name: trimmedName,
          origin_name: originName.trim() || undefined,
          description: description.trim() || undefined,
          keypoint: keypoint.trim() || undefined,
          main_muscles: selectedMainMuscles,
          support_muscles: selectedSupportMuscles,
          cues: cues.map((cue) => cue.trim()).filter((cue) => cue)
        };

        await exerciseApi.update(entityId, exerciseData);

        wx.showToast({
          title: '动作更新成功',
          icon: 'success'
        });

        setTimeout(() => {
          this.triggerEvent('submitted', { resource: 'exercise', action: 'update' });
        }, 800);
      } catch (error) {
        console.error('Failed to update exercise:', error);
        wx.showToast({
          title: '更新动作失败',
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
