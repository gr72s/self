const { exerciseApi, muscleApi, parsePageItems } = require('../../../../services/api');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
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

  lifetimes: {
    attached() {
      this.fetchInitialData();
    }
  },

  methods: {
    async fetchInitialData() {
      this.setData({ loading: true });
      try {
        const muscleResponse = await muscleApi.getAll();
        this.setData({ muscles: parsePageItems(muscleResponse) });
      } catch (error) {
        console.error('Failed to fetch muscles:', error);
        wx.showToast({ title: '加载肌肉数据失败', icon: 'none' });
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
      const { name, originName, description, keypoint, selectedMainMuscles, selectedSupportMuscles, cues } = this.data;
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

        await exerciseApi.create(exerciseData);

        wx.showToast({
          title: '动作创建成功',
          icon: 'success'
        });

        setTimeout(() => {
          this.triggerEvent('submitted', { resource: 'exercise', action: 'create' });
        }, 800);
      } catch (error) {
        console.error('Failed to create exercise:', error);
        wx.showToast({
          title: '创建动作失败',
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
