const { gymApi } = require('../../../services/api');

Page({
  data: {
    name: '',
    address: '',
    loading: false,
    errors: {},
    menuOpen: false
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

    this.setData({ loading: true });

    const gymData = {
      name: this.data.name.trim(),
      location: this.data.address.trim()
    };

    gymApi.create(gymData)
      .then(() => {
        wx.showToast({
          title: '创建成功',
          icon: 'success'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      })
      .catch((err) => {
        console.error('创建健身房失败:', err);
        wx.showToast({
          title: '创建失败，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  handleBack() {
    wx.navigateBack();
  },

  handleMenuToggle() {
    this.setData({ menuOpen: !this.data.menuOpen });
  }
});
