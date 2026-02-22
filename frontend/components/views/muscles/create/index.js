const { muscleApi } = require('../../../../services/api');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    name: '',
    group: '',
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

    handleGroupChange(e) {
      this.setData({ group: e.detail.value });
      if (this.data.errors.group) {
        this.setData({ 'errors.group': '' });
      }
    },

    validateForm() {
      const errors = {};

      if (!this.data.name.trim()) {
        errors.name = '请输入肌肉名称';
      }

      if (!this.data.group.trim()) {
        errors.group = '请输入肌肉分组';
      }

      this.setData({ errors });
      return Object.keys(errors).length === 0;
    },

    handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      this.setData({ loading: true });

      const muscleData = {
        name: this.data.name.trim(),
        group: this.data.group.trim()
      };

      muscleApi.create(muscleData)
        .then(() => {
          wx.showToast({
            title: '肌肉已创建',
            icon: 'success'
          });

          setTimeout(() => {
            this.triggerEvent('submitted', { resource: 'muscle', action: 'create' });
          }, 800);
        })
        .catch((err) => {
          console.error('Failed to create muscle:', err);
          wx.showToast({
            title: '创建肌肉失败',
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
