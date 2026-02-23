const { gymApi } = require('../../../../services/api');

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
    address: '',
    loading: true,
    submitting: false,
    error: '',
    errors: {}
  },

  observers: {
    entityId(value) {
      if (!value) return;
      this.setData({ id: value }, () => this.loadGymData());
    }
  },

  lifetimes: {
    attached() {
      if (this.data.entityId) {
        this.setData({ id: this.data.entityId }, () => this.loadGymData());
      } else {
        this.setData({
          error: '缺少健身房 ID',
          loading: false
        });
      }
    }
  },

  methods: {
    loadGymData() {
      this.setData({ loading: true, error: '' });

      gymApi.getById(this.data.id)
        .then((res) => {
          const gym = res.data?.data || res.data;
          this.setData({
            name: gym.name,
            address: gym.location || '',
            loading: false
          });
        })
        .catch((err) => {
          console.error('Failed to load gym data:', err);
          this.setData({
            error: '加载失败，请重试',
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

    handleAddressChange(e) {
      this.setData({ address: e.detail.value });
    },

    validateForm() {
      const errors = {};
      if (!this.data.name.trim()) {
        errors.name = '请输入健身房名称';
      } else if (this.data.name.trim().length < 2) {
        errors.name = '健身房名称至少 2 个字符';
      }
      this.setData({ errors });
      return Object.keys(errors).length === 0;
    },

    handleSubmit() {
      if (!this.validateForm()) {
        return;
      }

      this.setData({ submitting: true });

      const gymData = {
        name: this.data.name.trim(),
        location: this.data.address.trim()
      };

      gymApi.update(this.data.id, gymData)
        .then(() => {
          wx.showToast({
            title: '健身房已更新',
            icon: 'success'
          });
          setTimeout(() => {
            this.triggerEvent('submitted', { resource: 'gym', action: 'update' });
          }, 800);
        })
        .catch((err) => {
          console.error('Failed to update gym:', err);
          wx.showToast({
            title: '更新健身房失败，请重试',
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
