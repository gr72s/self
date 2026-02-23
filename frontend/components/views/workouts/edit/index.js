const {
  workoutApi,
  routineApi,
  gymApi,
  targetApi,
  unwrapResponseData,
  parsePageItems
} = require('../../../../services/api');

const OPTIONAL_ROUTINE = { id: null, name: '不关联训练计划' };

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
    workout: null,
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
      this.fetchWorkoutData();
    },

    async fetchWorkoutData() {
      this.setData({ loading: true });
      try {
        const workoutId = this.data.entityId;
        if (!workoutId) {
          throw new Error('缺少训练 ID');
        }

        const [workoutResponse, routineResponse, gymResponse, targetResponse] = await Promise.all([
          workoutApi.getById(workoutId),
          routineApi.getAll(),
          gymApi.getAll(),
          targetApi.getAll()
        ]);

        const workout = unwrapResponseData(workoutResponse);
        const routines = [OPTIONAL_ROUTINE, ...parsePageItems(routineResponse)];
        const gyms = parsePageItems(gymResponse);
        const targets = parsePageItems(targetResponse);

        this.setData({ workout, routines, gyms, targets }, () => {
          this.initFormData(workout, routines, gyms);
        });
      } catch (error) {
        console.error('Failed to fetch workout data:', error);
        wx.showToast({ title: '加载训练数据失败', icon: 'none' });
      } finally {
        this.setData({ loading: false });
      }
    },

    initFormData(workout, routines, gyms) {
      const routineId = workout && workout.routine ? workout.routine.id : null;
      const gymId = workout && workout.gym ? workout.gym.id : null;

      const selectedRoutineIndex = routines.findIndex((item) => item.id === routineId);
      const selectedGymIndex = gyms.findIndex((item) => item.id === gymId);

      const selectedTargets = Array.isArray(workout && workout.target)
        ? workout.target.map((item) => item.id).filter((id) => typeof id === 'number')
        : [];

      this.setData(
        {
          selectedRoutineIndex: selectedRoutineIndex > -1 ? selectedRoutineIndex : 0,
          selectedGymIndex: selectedGymIndex > -1 ? selectedGymIndex : 0,
          selectedTargets,
          note: (workout && workout.note) || ''
        },
        () => this.syncSelections()
      );
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
      const targetId = e?.currentTarget?.dataset?.id;
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
      const { entityId, routines, gyms, selectedRoutineIndex, selectedGymIndex, selectedTargets, note } = this.data;

      if (!entityId) {
        wx.showToast({ title: '无效的训练 ID', icon: 'none' });
        return;
      }

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

        await workoutApi.update(entityId, workoutData);

        wx.showToast({
          title: '训练更新成功',
          icon: 'success'
        });

        setTimeout(() => {
          this.triggerEvent('submitted', { resource: 'workout', action: 'update' });
        }, 800);
      } catch (error) {
        console.error('Failed to update workout:', error);
        wx.showToast({
          title: '更新训练失败',
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
