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
        error: '缂哄皯鍋ヨ韩鎴?ID',
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
        console.error('鍔犺浇鍋ヨ韩鎴挎暟鎹け璐?', err);
        this.setData({
          error: '鍔犺浇澶辫触锛岃閲嶈瘯',
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
          title: '鏇存柊鎴愬姛',
          icon: 'success'
        });
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      })
      .catch((err) => {
        console.error('鏇存柊鍋ヨ韩鎴垮け璐?', err);
        wx.showToast({
          title: '鏇存柊澶辫触锛岃閲嶈瘯',
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

