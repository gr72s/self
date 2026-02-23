const { workoutApi, routineApi, gymApi, targetApi, parsePageItems } = require('../../../../services/api');

const OPTIONAL_ROUTINE = { id: null, name: '不关联训练计划' };

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    routines: [OPTIONAL_ROUTINE],
    gyms: [],
    targets: [],
    selectedRoutineIndex: 0,
    selectedGymIndex: 0,
    selectedRoutine: OPTIONAL_ROUTINE,
    selectedGym: null,
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
        const [routineResponse, gymResponse, targetResponse] = await Promise.all([
          routineApi.getAll(),
          gymApi.getAll(),
          targetApi.getAll()
        ]);

        const routines = [OPTIONAL_ROUTINE, ...parsePageItems(routineResponse)];
        const gyms = parsePageItems(gymResponse);
        const targets = parsePageItems(targetResponse);

        this.setData({ routines, gyms, targets }, () => this.syncSelections());
      } catch (error) {
        console.error('Failed to fetch workout create data:', error);
        wx.showToast({
          title: '加载数据失败',
          icon: 'none'
        });
      } finally {
        this.setData({ loading: false });
      }
    },

    syncSelections() {
      const { routines, gyms, selectedRoutineIndex, selectedGymIndex } = this.data;
      this.setData({
        selectedRoutine: routines[selectedRoutineIndex] || OPTIONAL_ROUTINE,
        selectedGym: gyms[selectedGymIndex] || null
      });
    },

    handleRoutineChange(e) {
      const index = parseInt(e.detail.value, 10);
      this.setData({ selectedRoutineIndex: Number.isNaN(index) ? 0 : index }, () => this.syncSelections());
    },

    handleGymChange(e) {
      const index = parseInt(e.detail.value, 10);
      this.setData({ selectedGymIndex: Number.isNaN(index) ? 0 : index }, () => this.syncSelections());
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

    handleNoteChange(e) {
      this.setData({ note: e.detail.value });
    },

    async handleSubmit() {
      const {
        routines,
        gyms,
        selectedRoutineIndex,
        selectedGymIndex,
        selectedTargets,
        note
      } = this.data;

      const selectedRoutine = routines[selectedRoutineIndex] || OPTIONAL_ROUTINE;
      const selectedGym = gyms[selectedGymIndex] || null;

      if (!selectedGym) {
        wx.showToast({ title: '请选择健身房', icon: 'none' });
        return;
      }

      if (!Array.isArray(selectedTargets) || selectedTargets.length === 0) {
        wx.showToast({ title: '请至少选择一个目标', icon: 'none' });
        return;
      }

      this.setData({ submitting: true });

      try {
        const workoutData = {
          gym: selectedGym.id,
          target: selectedTargets,
          note: note.trim() || undefined
        };

        if (selectedRoutine.id) {
          workoutData.routine = selectedRoutine.id;
        }

        await workoutApi.create(workoutData);

        wx.showToast({
          title: '训练创建成功',
          icon: 'success'
        });

        setTimeout(() => {
          this.triggerEvent('submitted', { resource: 'workout', action: 'create' });
        }, 800);
      } catch (error) {
        console.error('Failed to create workout:', error);
        wx.showToast({
          title: '创建训练失败',
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
