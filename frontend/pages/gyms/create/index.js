// 健身房创建页面
const { gymApi } = require('../../../services/api');

Page({
  data: {
    name: '',
    address: '',
    loading: false,
    errors: {},
    menuOpen: false
  },

  // 处理名称输入变化
  handleNameChange(e) {
    this.setData({ name: e.detail.value });
    // 清除错误信息
    if (this.data.errors.name) {
      this.setData({ 'errors.name': '' });
    }
  },

  // 处理地址输入变化
  handleAddressChange(e) {
    this.setData({ address: e.detail.value });
    // 清除错误信息
    if (this.data.errors.address) {
      this.setData({ 'errors.address': '' });
    }
  },

  // 表单验证
  validateForm() {
    const errors = {};
    
    if (!this.data.name.trim()) {
      errors.name = '请输入健身房名称';
    }
    
    if (!this.data.address.trim()) {
      errors.address = '请输入健身房地址';
    }
    
    this.setData({ errors });
    return Object.keys(errors).length === 0;
  },

  // 提交表单
  handleSubmit() {
    // 验证表单
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({ loading: true });
    
    // 准备请求数据
    const gymData = {
      name: this.data.name.trim(),
      address: this.data.address.trim()
    };
    
    // 调用API创建健身房
    gymApi.create(gymData)
      .then(() => {
        wx.showToast({
          title: '创建成功',
          icon: 'success'
        });
        
        // 延迟返回列表页
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      })
      .catch(err => {
        console.error('创建健身房失败:', err);
        wx.showToast({
          title: '创建失败，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ loading: false });
      });
  },

  // 返回上一页
  handleBack() {
    wx.navigateBack();
  },

  // 处理菜单切换
  handleMenuToggle() {
    this.setData({ menuOpen: !this.data.menuOpen });
  }
});