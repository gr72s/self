const { muscleApi } = require('../../../../services/api');

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
    id: '',
    name: '',
    group: '',
    loading: true,
    submitting: false,
    error: '',
    errors: {}
  },

  observers: {
    entityId(value) {
      if (!value) return;
      this.setData({ id: value }, () => this.loadMuscleData());
    }
  },

  lifetimes: {
    attached() {
      if (this.data.entityId) {
        this.setData({ id: this.data.entityId }, () => this.loadMuscleData());
      } else {
        this.setData({
          error: 'Missing muscle id',
          loading: false
        });
      }
    }
  },

  methods: {
    loadMuscleData() {
      this.setData({ loading: true, error: '' });

      muscleApi.getById(this.data.id)
        .then((res) => {
          const muscle = res.data?.data || res.data;
          this.setData({
            name: muscle.name,
            group: muscle.group,
            loading: false
          });
        })
        .catch((err) => {
          console.error('Failed to load muscle data:', err);
          this.setData({
            error: 'Failed to load muscle data. Please retry.',
            loading: false
          });
        });
    },

    handleNameChange(e) {
      this.setData({ name: e.detail.value });
      if (this.data.errors.name) {
        this.setData({ 'errors.name': '' });
      }
    },

    handleGroupChange(e) {
      this.setData({ group: e.detail.value });
      if (this.data.errors.group) {
        this.setData({ 'errors.group': '' });
      }
    },

    validateForm() {
      const errors = {};

      if (!this.data.name.trim()) {
        errors.name = 'Please enter muscle name';
      }

      if (!this.data.group.trim()) {
        errors.group = 'Please enter muscle group';
      }

      this.setData({ errors });
      return Object.keys(errors).length === 0;
    },

    handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      this.setData({ submitting: true });

      const muscleData = {
        name: this.data.name.trim(),
        group: this.data.group.trim()
      };

      muscleApi.update(this.data.id, muscleData)
        .then(() => {
          wx.showToast({
            title: 'Muscle updated',
            icon: 'success'
          });

          setTimeout(() => {
            this.triggerEvent('submitted', { resource: 'muscle', action: 'update' });
          }, 800);
        })
        .catch((err) => {
          console.error('Failed to update muscle:', err);
          wx.showToast({
            title: 'Failed to update muscle',
            icon: 'none'
          });
        })
        .finally(() => {
          this.setData({ submitting: false });
        });
    },

    handleBack() {
      this.triggerEvent('cancel');
    }
  }
});
