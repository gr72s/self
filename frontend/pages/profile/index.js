const { userApi } = require('../../services/api');

Page({
  data: {
    user: null,
    menuOpen: false
  },

  onLoad() {
    this.fetchUser();
  },

  onShow() {
    this.fetchUser();
  },

  async fetchUser() {
    try {
      const response = await userApi.getCurrent();
      const userData = (response.data && response.data.data) || response.data;
      this.setData({ user: userData });
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // 当请求失败时（例如未登录或token过期），将user设置为null
      this.setData({ user: null });
    }
  },

  navigateToSettings() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  handleLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.reLaunch({ url: '/pages/login/index' });
        }
      }
    });
  },

  handleMenuToggle() {
    this.setData({ menuOpen: !this.data.menuOpen });
  }
});
