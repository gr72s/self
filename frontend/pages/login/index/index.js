// 登录页面逻辑
const api = require('../../../services/api');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: false
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
   * 登录方法
   */
  login() {
    if (this.data.loading) return;
    
    console.log('用户点击了登录按钮');
    
    // 检查微信版本是否支持wx.getUserProfile
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
    
    try {
      // 1. 请求用户授权，获取用户信息
      console.log('准备调用wx.getUserProfile');
      wx.getUserProfile({
        desc: '用于完善用户资料',
        lang: 'zh_CN',
        success: (userProfileRes) => {
          console.log('获取用户信息成功', userProfileRes.userInfo);
          
          // 2. 获取微信登录凭证 code
          console.log('准备调用wx.login');
          wx.login({
            success: (loginRes) => {
              console.log('获取登录凭证成功', loginRes.code);
              
              // 3. 调用后端微信登录接口
              console.log('准备调用后端微信登录接口');
              api.wechatLogin(loginRes.code)
                .then((response) => {
                  console.log('微信登录成功', response);
                  
                  // 4. 保存用户信息和 token 到本地存储
                  console.log('准备保存用户信息和token');
                  wx.setStorageSync('userInfo', userProfileRes.userInfo);
                  wx.setStorageSync('token', response.access_token);
                  
                  // 5. 更新全局数据
                  console.log('准备更新全局数据');
                  const app = getApp();
                  if (app) {
                    app.globalData.userInfo = userProfileRes.userInfo;
                    app.globalData.isLoggedIn = true;
                  }
                  
                  // 6. 登录成功，跳转到首页
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
        },
        fail: (err) => {
          console.error('获取用户信息失败', err);
          
          // 显示具体的错误信息
          let errorMsg = '登录失败，请重试';
          if (err.errMsg.includes('cancel')) {
            errorMsg = '您取消了登录';
          } else if (err.errMsg.includes('auth denied')) {
            errorMsg = '授权失败，请在设置中开启授权';
          }
          
          wx.showToast({
            title: errorMsg,
            icon: 'none'
          });
          this.setData({ loading: false });
        }
      });
    } catch (error) {
      console.error('调用wx.getUserProfile时出错:', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  }
});
