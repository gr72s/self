// 肌肉创建页面
const { muscleApi } = require('../../../services/api');

Page({
  data: {
    name: '',
    group: '',
    loading: false,
    errors: {}
  },

  // 处理名称输入变化
  handleNameChange(e) {
    this.setData({ name: e.detail.value });
    // 清除错误信息
    if (this.data.errors.name) {
      this.setData({ 'errors.name': '' });
    }
  },

  // 处理分组输入变化
  handleGroupChange(e) {
    this.setData({ group: e.detail.value });
    // 清除错误信息
    if (this.data.errors.group) {
      this.setData({ 'errors.group': '' });
    }
  },

  // 表单验证
  validateForm() {
    const errors = {};
    
    if (!this.data.name.trim()) {
      errors.name = '请输入肌肉名称';
    }
    
    if (!this.data.group.trim()) {
      errors.group = '请输入肌肉分组';
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
    const muscleData = {
      name: this.data.name.trim(),
      group: this.data.group.trim()
    };
    
    // 调用API创建肌肉
    muscleApi.create(muscleData)
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
        console.error('创建肌肉失败:', err);
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
  }
});