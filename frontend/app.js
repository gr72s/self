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
   * 显示登录页面
   */
  showLoginModal() {
    console.log('显示登录页面');
    
    // 跳转到登录页面
    wx.redirectTo({
      url: '/pages/login/index/index',
      success: (res) => {
        console.log('跳转到登录页面成功');
      },
      fail: (err) => {
        console.error('跳转到登录页面失败:', err);
      }
    });
  },
  
  /**
   * 登录方法
   */
  login() {
    console.log('调用登录方法，跳转到登录页面');
    // 跳转到登录页面
    this.showLoginModal();
  }
});