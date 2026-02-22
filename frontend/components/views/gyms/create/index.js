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
        errors.name = 'Please enter gym name';
      }

      if (!this.data.address.trim()) {
        errors.address = 'Please enter gym address';
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
            title: 'Gym created',
            icon: 'success'
          });

          setTimeout(() => {
            this.triggerEvent('submitted', { resource: 'gym', action: 'create' });
          }, 800);
        })
        .catch((err) => {
          console.error('Failed to create gym:', err);
          wx.showToast({
            title: 'Failed to create gym',
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
