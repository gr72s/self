// 微信小程序入口文件
App({
  globalData: {
    userInfo: null,
    isLoggedIn: false
  },
  
  onLaunch() {
    // 小程序启动时执行
    console.log('App launched');
    
    // 立即检查登录状态，不延迟
    console.log('onLaunch: 开始检查登录状态');
    this.checkLoginStatus();
  },
  
  onShow(options) {
    // 小程序显示时执行
    console.log('App show', options);
    
    // 立即检查登录状态，不延迟
    console.log('onShow: 开始检查登录状态');
    this.checkLoginStatus();
  },
  
  onHide() {
    // 小程序隐藏时执行
    console.log('App hide');
  },
  
  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    console.log('开始检查登录状态');
    
    try {
      const userInfo = wx.getStorageSync('userInfo');
      const token = wx.getStorageSync('token');
      
      console.log('本地存储中的用户信息:', userInfo);
      console.log('本地存储中的token:', token);
      
      if (userInfo && token) {
        this.globalData.userInfo = userInfo;
        this.globalData.isLoggedIn = true;
        console.log('用户已登录');
      } else {
        this.globalData.userInfo = null;
        this.globalData.isLoggedIn = false;
        console.log('用户未登录');
        
        // 显示登录窗口
        console.log('准备显示登录窗口');
        this.showLoginModal();
      }
    } catch (error) {
      console.error('检查登录状态时出错:', error);
      // 出错时也显示登录窗口
      this.showLoginModal();
    }
  },
  
  /**
   * 显示登录窗口
   */
  showLoginModal() {
    console.log('显示登录提示');
    
    // 使用showModal显示登录提示，确保用户能够主动点击确认按钮
    wx.showModal({
      title: '登录提示',
      content: '请登录后使用小程序',
      showCancel: false,
      confirmText: '立即登录',
      success: (res) => {
        if (res.confirm) {
          console.log('用户点击了登录按钮');
          // 用户主动点击确认后，调用登录方法
          this.login();
        }
      },
      fail: (err) => {
        console.error('显示登录提示失败:', err);
      }
    });
  },
  
  /**
   * 登录方法
   */
  login() {
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
            
            // 3. 导入 API 模块
            console.log('准备导入API模块');
            try {
              const api = require('./services/api');
              
              // 4. 调用后端微信登录接口
              console.log('准备调用后端微信登录接口');
              api.wechatLogin(loginRes.code)
                .then((response) => {
                  console.log('微信登录成功', response);
                  
                  // 5. 保存用户信息和 token 到本地存储
                  console.log('准备保存用户信息和token');
                  wx.setStorageSync('userInfo', userProfileRes.userInfo);
                  wx.setStorageSync('token', response.access_token);
                  
                  // 6. 更新全局数据
                  console.log('准备更新全局数据');
                  this.globalData.userInfo = userProfileRes.userInfo;
                  this.globalData.isLoggedIn = true;
                  
                  wx.showToast({
                    title: '登录成功',
                    icon: 'success'
                  });
                })
                .catch((err) => {
                  console.error('微信登录失败', err);
                  wx.showToast({
                    title: '登录失败，请重试',
                    icon: 'none'
                  });
                });
            } catch (error) {
              console.error('导入API模块或调用后端接口时出错:', error);
              wx.showToast({
                title: '登录失败，请重试',
                icon: 'none'
              });
            }
          },
          fail: (err) => {
            console.error('获取登录凭证失败', err);
            wx.showToast({
              title: '登录失败，请重试',
              icon: 'none'
            });
          }
        });
      },
      fail: (err) => {
        console.error('获取用户信息失败', err);
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      }
    });
  }
});