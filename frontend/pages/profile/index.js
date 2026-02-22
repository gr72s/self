const { userApi } = require('../../services/api');

const extractApiPayload = (response) => {
  if (!response) {
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(response, 'data')) {
    const firstLayer = response.data;
    if (
      firstLayer &&
      typeof firstLayer === 'object' &&
      Object.prototype.hasOwnProperty.call(firstLayer, 'data')
    ) {
      return firstLayer.data;
    }
    return firstLayer;
  }

  return response;
};

const buildUserFromStorage = () => {
  const stored = wx.getStorageSync('userInfo');
  if (!stored || typeof stored !== 'object') {
    return null;
  }

  return {
    username: stored.username || stored.nickname || '',
    nickname: stored.nickname || '',
    avatar: stored.avatar || stored.avatarUrl || ''
  };
};

Page({
  data: {
    user: null
  },

  onLoad() {
    this.fetchUser();
  },

  onShow() {
    this.fetchUser();
  },

  async fetchUser() {
    const fallbackUser = buildUserFromStorage();
    if (fallbackUser) {
      this.setData({ user: fallbackUser });
    }

    try {
      const response = await userApi.getCurrent();
      const userData = extractApiPayload(response);
      if (userData && typeof userData === 'object') {
        this.setData({ user: userData });
      } else {
        this.setData({ user: fallbackUser || null });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      this.setData({ user: fallbackUser || null });
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
          wx.removeStorageSync('userInfo');
          wx.reLaunch({ url: '/pages/login/index/index' });
        }
      }
    });
  }
});
