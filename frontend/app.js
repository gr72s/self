// 微信小程序入口文件
App({
  onLaunch() {
    // 小程序启动时执行
    console.log('App launched');
    
    // 可以在这里进行初始化操作
    // 例如：获取用户信息、初始化数据等
  },
  
  onShow(options) {
    // 小程序显示时执行
    console.log('App show', options);
  },
  
  onHide() {
    // 小程序隐藏时执行
    console.log('App hide');
  },
  
  globalData: {
    // 全局数据
    userInfo: null,
    apiBaseUrl: 'https://api.example.com' // 替换为实际的 API 基础地址
  }
});