const { VIEW_KEYS, SHELL_VIEW_STORAGE_KEY } = require('../../../types/view-router');

Page({
  onLoad(options = {}) {
    const params = {};
    if (options.id) {
      params.id = options.id;
    }

    wx.setStorageSync(SHELL_VIEW_STORAGE_KEY, {
      view: VIEW_KEYS.ROUTINES_EDIT,
      params
    });

    wx.reLaunch({
      url: '/pages/index/index'
    });
  }
});
