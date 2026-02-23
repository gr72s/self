const { routineApi, targetApi, unwrapResponseData, parsePageItems } = require('../../../../services/api');

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
    selectedTargets: [],
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
          throw new Error('缺少计划 ID');
        }

        const [routineResponse, targetResponse] = await Promise.all([
          routineApi.getById(routineId),
          targetApi.getAll()
        ]);

        const routine = unwrapResponseData(routineResponse);
        const targets = parsePageItems(targetResponse);

        this.setData({ routine, targets }, () => this.initFormData(routine));
      } catch (error) {
        console.error('Failed to fetch routine data:', error);
        wx.showToast({ title: '加载计划数据失败', icon: 'none' });
      } finally {
        this.setData({ loading: false });
      }
    },

    initFormData(routine) {
      const selectedTargets = Array.isArray(routine && routine.targets)
        ? routine.targets.map((item) => item.id).filter((id) => typeof id === 'number')
        : [];

      this.setData({
        name: (routine && routine.name) || '',
        description: (routine && routine.description) || '',
        selectedTargets,
        note: (routine && routine.note) || ''
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

    async handleSubmit() {
      const { entityId, name, description, selectedTargets, note } = this.data;
      const trimmedName = name.trim();

      if (trimmedName.length < 2) {
        wx.showToast({ title: '计划名称至少2个字符', icon: 'none' });
        return;
      }

      if (!entityId) {
        wx.showToast({ title: '无效的计划 ID', icon: 'none' });
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
