Component({
  /**
   * 组件的方法列表
   */
  methods: {
    switchToHome() {
      wx.switchTab({ url: '/pages/index/index' });
    },
    
    switchToStats() {
      wx.switchTab({ url: '/pages/stats/index' });
    },
    
    switchToProfile() {
      wx.switchTab({ url: '/pages/profile/index' });
    }
  }
});