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

    this.setData({ loading: true });

    const gymData = {
      name: this.data.name.trim(),
      location: this.data.address.trim()
    };

    gymApi.create(gymData)
      .then(() => {
        wx.showToast({
          title: '鍒涘缓鎴愬姛',
          icon: 'success'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      })
      .catch((err) => {
        console.error('鍒涘缓鍋ヨ韩鎴垮け璐?', err);
        wx.showToast({
          title: '鍒涘缓澶辫触锛岃閲嶈瘯',
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

