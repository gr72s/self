const { routineApi, targetApi, parsePageItems } = require('../../../../services/api');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    name: '',
    description: '',
    targets: [],
    selectedTargets: [],
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
        const targetResponse = await targetApi.getAll();
        this.setData({ targets: parsePageItems(targetResponse) });
      } catch (error) {
        console.error('Failed to fetch targets:', error);
        wx.showToast({ title: '加载目标失败', icon: 'none' });
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

    async handleSubmit() {
      const { name, description, selectedTargets, note } = this.data;
      const trimmedName = name.trim();
      if (trimmedName.length < 2) {
        wx.showToast({ title: '计划名称至少2个字符', icon: 'none' });
        return;
      }

      this.setData({ submitting: true });

      try {
        const routineData = {
          name: trimmedName,
          description: description.trim() || undefined,
          target_ids: selectedTargets,
          note: note.trim() || undefined
        };

        await routineApi.create(routineData);

        wx.showToast({
          title: '计划创建成功',
          icon: 'success'
        });

        setTimeout(() => {
          this.triggerEvent('submitted', { resource: 'routine', action: 'create' });
        }, 800);
      } catch (error) {
        console.error('Failed to create routine:', error);
        wx.showToast({
          title: '创建计划失败',
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
