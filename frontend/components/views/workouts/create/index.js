const { workoutApi, routineApi, gymApi } = require('../../../../services/api');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
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
          const routineResponse = await routineApi.getAll();
          const routines = routineResponse.data?.data || routineResponse.data || [];
          this.setData({ routines });
        } catch (error) {
          console.error('Failed to fetch routines:', error);
        }

        try {
          const gymResponse = await gymApi.getAll();
          const gyms = gymResponse.data?.data || gymResponse.data || [];
          this.setData({ gyms });
        } catch (error) {
          console.error('Failed to fetch gyms:', error);
        }

        const mockTargets = [
          { id: 1, name: 'Strength' },
          { id: 2, name: 'Endurance' },
          { id: 3, name: 'Flexibility' },
          { id: 4, name: 'Cardio' }
        ];
        this.setData({ targets: mockTargets });
        this.syncSelections();
      } finally {
        this.setData({ loading: false });
      }
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
      const { routines, gyms, selectedRoutineIndex, selectedGymIndex, selectedTargets, note } = this.data;

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

        await workoutApi.create(workoutData);

        wx.showToast({
          title: 'Workout created successfully',
          icon: 'success'
        });

        setTimeout(() => {
          this.triggerEvent('submitted', { resource: 'workout', action: 'create' });
        }, 800);
      } catch (error) {
        console.error('Failed to create workout:', error);
        wx.showToast({
          title: 'Failed to create workout',
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
