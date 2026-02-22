const api = require('../../../services/api');

const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

const extractApiPayload = (response) => {
  if (!response) {
    return null;
  }
  if (Object.prototype.hasOwnProperty.call(response, 'data')) {
    return response.data;
  }
  return response;
};

const wxLogin = () => {
  return new Promise((resolve, reject) => {
    wx.login({
      success: resolve,
      fail: reject
    });
  });
};

Page({
  data: {
    loading: false,
    avatarUrl: defaultAvatarUrl,
    nickname: '',
    showAvatarPlaceholder: true
  },

  onChooseAvatar(e) {
    if (e.detail && e.detail.avatarUrl) {
      this.setData({
        avatarUrl: e.detail.avatarUrl,
        showAvatarPlaceholder: false
      });
    }
  },

  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  async login() {
    if (this.data.loading) {
      return;
    }

    const { nickname, avatarUrl } = this.data;

    if (!nickname) {
      wx.showToast({
        title: '请输入昵称',
        icon: 'none'
      });
      return;
    }

    if (!avatarUrl) {
      wx.showToast({
        title: '请选择头像',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      const loginRes = await wxLogin();
      if (!loginRes || !loginRes.code) {
        throw new Error('获取微信登录凭证失败');
      }

      const response = await api.wechatLogin(loginRes.code, nickname, avatarUrl);
      const payload = extractApiPayload(response) || {};

      const token = payload.access_token || response.access_token;
      if (!token) {
        throw new Error('登录返回缺少令牌');
      }

      const backendUser = payload.user || response.user || {};
      const userInfo = {
        id: backendUser.id,
        username: backendUser.username || nickname,
        nickname: backendUser.nickname || nickname,
        avatar: backendUser.avatar || avatarUrl,
        avatarUrl: backendUser.avatar || avatarUrl
      };

      wx.setStorageSync('userInfo', userInfo);
      wx.setStorageSync('token', token);

      const app = getApp();
      if (app) {
        app.globalData.userInfo = userInfo;
        app.globalData.isLoggedIn = true;
      }

      wx.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1000
      });

      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});
