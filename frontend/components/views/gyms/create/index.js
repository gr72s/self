const { gymApi } = require('../../../../services/api');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    name: '',
    location: '',
    loading: false,
    errors: {}
  },

  methods: {
    handleNameChange(e) {
      this.setData({ name: e.detail.value });
      if (this.data.errors.name) {
        this.setData({ 'errors.name': '' });
      }
    },

    handleLocationChange(e) {
      this.setData({ location: e.detail.value });
    },

    validateForm() {
      const errors = {};
      const trimmedName = this.data.name.trim();
      if (trimmedName.length < 2) {
        errors.name = '健身房名称至少2个字符';
      }
      this.setData({ errors });
      return Object.keys(errors).length === 0;
    },

    handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      this.setData({ loading: true });

      const gymData = {
        name: this.data.name.trim(),
        location: this.data.location.trim() || undefined
      };

      gymApi.create(gymData)
        .then(() => {
          wx.showToast({
            title: '健身房已创建',
            icon: 'success'
          });
          setTimeout(() => {
            this.triggerEvent('submitted', { resource: 'gym', action: 'create' });
          }, 800);
        })
        .catch((err) => {
          console.error('Failed to create gym:', err);
          wx.showToast({
            title: '创建健身房失败，请重试',
            icon: 'none'
          });
        })
        .finally(() => {
          this.setData({ loading: false });
        });
    },

    handleBack() {
      this.triggerEvent('cancel');
    }
  }
});
