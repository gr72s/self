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
    
    this.setData({ loading: true });
    
    console.log('开始执行登录流程');
    
    // 1. 请求用户授权，获取用户信息
    console.log('准备调用wx.getUserProfile');
    wx.getUserProfile({
      desc: '用于完善用户资料',
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
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
        this.setData({ loading: false });
      }
    });
  }
});
