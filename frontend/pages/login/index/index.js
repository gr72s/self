// 登录页面逻辑
const api = require('../../../services/api');

// 默认头像URL
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna4a2F2t24Lcia07jQodd2FJGIYQfGOLIAJGFxM4FbnQP6yF1kxMBgJ0F3Y/';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    avatarUrl: defaultAvatarUrl,
    nickname: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('登录页面加载');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('登录页面显示');
  },

  /**
   * 选择头像
   */
  onChooseAvatar(e) {
    console.log('选择头像', e);
    const { avatarUrl } = e.detail;
    console.log('获取到头像URL:', avatarUrl);
    this.setData({ avatarUrl });
    console.log('设置头像URL后的数据:', this.data);
  },

  /**
   * 昵称输入
   */
  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value });
  },

  /**
   * 登录方法
   */
  login() {
    if (this.data.loading) return;
    
    const { nickname, avatarUrl } = this.data;
    
    // 验证输入
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
    
    console.log('用户点击了登录按钮');
    
    // 检查微信版本
    const systemInfo = wx.getSystemInfoSync();
    const version = systemInfo.version;
    const versionArr = version.split('.');
    const majorVersion = parseInt(versionArr[0]);
    const minorVersion = parseInt(versionArr[1]);
    console.log('微信版本:', version);
    
    if (majorVersion < 7 || (majorVersion === 7 && minorVersion < 0)) {
      wx.showToast({
        title: '微信版本过低，请升级',
        icon: 'none'
      });
      return;
    }
    
    this.setData({ loading: true });
    
    console.log('开始执行登录流程');
    
    // 1. 获取微信登录凭证 code
    console.log('准备调用wx.login');
    wx.login({
      success: (loginRes) => {
        console.log('获取登录凭证成功', loginRes.code);
        
        // 2. 调用后端微信登录接口
        console.log('准备调用后端微信登录接口');
        api.wechatLogin(loginRes.code)
          .then((response) => {
            console.log('微信登录成功', response);
            
            // 3. 保存用户信息和 token 到本地存储
            console.log('准备保存用户信息和token');
            const userInfo = {
              nickname: nickname,
              avatarUrl: avatarUrl
            };
            wx.setStorageSync('userInfo', userInfo);
            wx.setStorageSync('token', response.access_token);
            
            // 4. 更新全局数据
            console.log('准备更新全局数据');
            const app = getApp();
            if (app) {
              app.globalData.userInfo = userInfo;
              app.globalData.isLoggedIn = true;
            }
            
            // 5. 登录成功，跳转到首页
            console.log('登录成功，跳转到首页');
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1500,
              success: () => {
                setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/index/index'
                  });
                }, 1500);
              }
            });
          })
          .catch((err) => {
            console.error('微信登录失败', err);
            wx.showToast({
              title: '登录失败，请重试',
              icon: 'none'
            });
          })
          .finally(() => {
            this.setData({ loading: false });
          });
      },
      fail: (err) => {
        console.error('获取登录凭证失败', err);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
  }
});
