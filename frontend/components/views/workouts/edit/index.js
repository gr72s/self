const { workoutApi, routineApi, gymApi } = require('../../../../services/api');

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
    routines: [],
    gyms: [],
    targets: [],
    selectedRoutineIndex: 0,
    selectedGymIndex: 0,
    selectedRoutine: null,
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
          throw new Error('Workout ID is required');
        }

        const workoutResponse = await workoutApi.getById(workoutId);
        const workout = (workoutResponse.data && workoutResponse.data.data) || workoutResponse.data;
        this.setData({ workout });

        const routineResponse = await routineApi.getAll();
        const routines = (routineResponse.data && routineResponse.data.data) || routineResponse.data || [];
        this.setData({ routines });

        const gymResponse = await gymApi.getAll();
        const gyms = (gymResponse.data && gymResponse.data.data) || gymResponse.data || [];
        this.setData({ gyms });

        const mockTargets = [
          { id: 1, name: 'Strength' },
          { id: 2, name: 'Endurance' },
          { id: 3, name: 'Flexibility' },
          { id: 4, name: 'Cardio' }
        ];
        this.setData({ targets: mockTargets });

        this.initFormData(workout, routines, gyms);
      } catch (error) {
        console.error('Failed to fetch workout data:', error);
        wx.showToast({ title: 'Failed to load workout data', icon: 'none' });
      } finally {
        this.setData({ loading: false });
      }
    },

    initFormData(workout, routines, gyms) {
      const selectedRoutineIndex = routines.findIndex((r) => r.id === workout.routineId);
      const selectedGymIndex = gyms.findIndex((g) => g.id === workout.gymId);

      const selectedTargets = [];
      if (Array.isArray(workout.target)) {
        workout.target.forEach((target) => {
          if (target && target.id) {
            selectedTargets.push(target.id);
          }
        });
      }

      this.setData({
        selectedRoutineIndex: selectedRoutineIndex > -1 ? selectedRoutineIndex : 0,
        selectedGymIndex: selectedGymIndex > -1 ? selectedGymIndex : 0,
        selectedTargets,
        note: workout.note || ''
      }, () => this.syncSelections());
    },

    syncSelections() {
      const { routines, gyms, selectedRoutineIndex, selectedGymIndex } = this.data;
      this.setData({
        selectedRoutine: routines[selectedRoutineIndex] || null,
        selectedGym: gyms[selectedGymIndex] || null
      });
    },

    handleRoutineChange(e) {
      const index = parseInt(e.detail.value, 10);
      this.setData({ selectedRoutineIndex: index }, () => this.syncSelections());
    },

    handleGymChange(e) {
      const index = parseInt(e.detail.value, 10);
      this.setData({ selectedGymIndex: index }, () => this.syncSelections());
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
        wx.showToast({ title: 'Invalid workout ID', icon: 'none' });
        return;
      }
      if (!routines[selectedRoutineIndex]) {
        wx.showToast({ title: 'Please select a routine', icon: 'none' });
        return;
      }
      if (!gyms[selectedGymIndex]) {
        wx.showToast({ title: 'Please select a gym', icon: 'none' });
        return;
      }

      this.setData({ submitting: true });

      try {
        const workoutData = {
          routineId: routines[selectedRoutineIndex].id,
          gymId: gyms[selectedGymIndex].id,
          targetIds: selectedTargets,
          note
        };

        await workoutApi.update(entityId, workoutData);

        wx.showToast({
          title: 'Workout updated successfully',
          icon: 'success'
        });

        setTimeout(() => {
          this.triggerEvent('submitted', { resource: 'workout', action: 'update' });
        }, 800);
      } catch (error) {
        console.error('Failed to update workout:', error);
        wx.showToast({
          title: 'Failed to update workout',
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
