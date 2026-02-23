const { gymApi } = require('../../../services/api');

Page({
  data: {
    id: '',
    name: '',
    address: '',
    loading: true,
    submitting: false,
    error: '',
    errors: {},
    menuOpen: false
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.loadGymData();
    } else {
      this.setData({
        error: '缺少健身房 ID',
        loading: false
      });
    }
  },

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
        console.error('加载健身房数据失败:', err);
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
          title: '更新成功',
          icon: 'success'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      })
      .catch((err) => {
        console.error('更新健身房失败:', err);
        wx.showToast({
          title: '更新失败，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ submitting: false });
      });
  },

  handleBack() {
    wx.navigateBack();
  },

  handleMenuToggle() {
    this.setData({ menuOpen: !this.data.menuOpen });
  }
});
