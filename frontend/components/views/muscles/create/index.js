const { muscleApi } = require('../../../../services/api');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    name: '',
    functionText: '',
    originName: '',
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

    handleFunctionChange(e) {
      this.setData({ functionText: e.detail.value });
    },

    handleOriginNameChange(e) {
      this.setData({ originName: e.detail.value });
    },

    validateForm() {
      const errors = {};
      const trimmedName = this.data.name.trim();
      if (trimmedName.length < 2) {
        errors.name = '肌肉名称至少2个字符';
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
        function: this.data.functionText.trim() || undefined,
        origin_name: this.data.originName.trim() || undefined
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
