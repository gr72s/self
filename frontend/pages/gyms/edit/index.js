// 健身房编辑页面
const { gymApi } = require('../../../services/api');

Page({
  data: {
    id: '',
    name: '',
    address: '',
    loading: true,
    submitting: false,
    error: '',
    errors: {}
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.loadGymData();
    } else {
      this.setData({ 
        error: '缺少健身房ID',
        loading: false 
      });
    }
  },

  // 加载健身房数据
  loadGymData() {
    this.setData({ loading: true, error: '' });
    
    gymApi.getById(this.data.id)
      .then(res => {
        const gym = res.data?.data || res.data;
        this.setData({
          name: gym.name,
          address: gym.address,
          loading: false
        });
      })
      .catch(err => {
        console.error('加载健身房数据失败:', err);
        this.setData({ 
          error: '加载失败，请重试', 
          loading: false 
        });
      });
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
    
    this.setData({ submitting: true });
    
    // 准备请求数据
    const gymData = {
      name: this.data.name.trim(),
      address: this.data.address.trim()
    };
    
    // 调用API更新健身房
    gymApi.update(this.data.id, gymData)
      .then(() => {
        wx.showToast({
          title: '更新成功',
          icon: 'success'
        });
        
        // 延迟返回列表页
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      })
      .catch(err => {
        console.error('更新健身房失败:', err);
        wx.showToast({
          title: '更新失败，请重试',
          icon: 'none'
        });
      })
      .finally(() => {
        this.setData({ submitting: false });
      });
  },

  // 返回上一页
  handleBack() {
    wx.navigateBack();
  }
});