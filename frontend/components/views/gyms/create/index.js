const { gymApi } = require('../../../../services/api');

Component({
  options: {
    styleIsolation: 'apply-shared'
  },

  data: {
    name: '',
    address: '',
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

    handleAddressChange(e) {
      this.setData({ address: e.detail.value });
      if (this.data.errors.address) {
        this.setData({ 'errors.address': '' });
      }
    },

    validateForm() {
      const errors = {};

      if (!this.data.name.trim()) {
        errors.name = '请输入健身房名称';
      }

      if (!this.data.address.trim()) {
        errors.address = '请输入健身房地址';
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
        address: this.data.address.trim()
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
            title: '创建健身房失败',
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
