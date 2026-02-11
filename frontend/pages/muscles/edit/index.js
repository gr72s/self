// 肌肉编辑页面
const { muscleApi } = require('../../../services/api');

Page({
  data: {
    id: '',
    name: '',
    group: '',
    loading: true,
    submitting: false,
    error: '',
    errors: {}
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id });
      this.loadMuscleData();
    } else {
      this.setData({ 
        error: '缺少肌肉ID',
        loading: false 
      });
    }
  },

  // 加载肌肉数据
  loadMuscleData() {
    this.setData({ loading: true, error: '' });
    
    muscleApi.getById(this.data.id)
      .then(res => {
        const muscle = res.data?.data || res.data;
        this.setData({
          name: muscle.name,
          group: muscle.group,
          loading: false
        });
      })
      .catch(err => {
        console.error('加载肌肉数据失败:', err);
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
    
    this.setData({ submitting: true });
    
    // 准备请求数据
    const muscleData = {
      name: this.data.name.trim(),
      group: this.data.group.trim()
    };
    
    // 调用API更新肌肉
    muscleApi.update(this.data.id, muscleData)
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
        console.error('更新肌肉失败:', err);
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