// 动作创建逻辑
const { exerciseApi, muscleApi } = require('../../../services/api');


Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    originName: '',
    description: '',
    muscles: [],
    selectedMainMuscles: [],
    selectedSupportMuscles: [],
    cues: [],
    loading: true,
    submitting: false,
    menuOpen: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    console.log('ExerciseCreatePage loaded');
    this.fetchInitialData();
  },

  /**
   * 获取初始数据
   */
  async fetchInitialData() {
    this.setData({ loading: true });
    try {
      // 获取肌肉列表
      try {
        const muscleResponse = await muscleApi.getAll();
        const muscles = muscleResponse.data?.data || muscleResponse.data || [];
        this.setData({ muscles });
      } catch (error) {
        console.error('Failed to fetch muscles:', error);
      }
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 处理名称输入
   */
  handleNameChange(e) {
    this.setData({ name: e.detail.value });
  },

  /**
   * 处理原始名称输入
   */
  handleOriginNameChange(e) {
    this.setData({ originName: e.detail.value });
  },

  /**
   * 处理描述输入
   */
  handleDescriptionChange(e) {
    this.setData({ description: e.detail.value });
  },

  /**
   * 切换主要肌肉选择
   */
  toggleMainMuscle(e) {
    const muscleId = e.currentTarget?.dataset?.id;
    if (typeof muscleId === 'string') {
      const selectedMainMuscles = [...this.data.selectedMainMuscles];
      
      const index = selectedMainMuscles.indexOf(muscleId);
      if (index > -1) {
        selectedMainMuscles.splice(index, 1);
      } else {
        selectedMainMuscles.push(muscleId);
      }
      
      this.setData({ selectedMainMuscles });
    }
  },

  /**
   * 切换辅助肌肉选择
   */
  toggleSupportMuscle(e) {
    const muscleId = e.currentTarget?.dataset?.id;
    if (typeof muscleId === 'string') {
      const selectedSupportMuscles = [...this.data.selectedSupportMuscles];
      
      const index = selectedSupportMuscles.indexOf(muscleId);
      if (index > -1) {
        selectedSupportMuscles.splice(index, 1);
      } else {
        selectedSupportMuscles.push(muscleId);
      }
      
      this.setData({ selectedSupportMuscles });
    }
  },

  /**
   * 添加动作提示
   */
  addCue() {
    const cues = [...this.data.cues, ''];
    this.setData({ cues });
  },

  /**
   * 移除动作提示
   */
  removeCue(e) {
    const index = e.currentTarget?.dataset?.index;
    if (typeof index === 'number') {
      const cues = [...this.data.cues];
      cues.splice(index, 1);
      this.setData({ cues });
    }
  },

  /**
   * 处理动作提示输入
   */
  handleCueChange(e) {
    const index = e.currentTarget?.dataset?.index;
    if (typeof index === 'number') {
      const value = e.detail.value;
      const cues = [...this.data.cues];
      cues[index] = value;
      this.setData({ cues });
    }
  },

  /**
   * 处理表单提交
   */
  async handleSubmit(e) {
    const { name, originName, description, selectedMainMuscles, selectedSupportMuscles, cues } = this.data;
    
    // 验证表单
    if (!name.trim()) {
      wx.showToast({ title: '请输入动作名称', icon: 'none' });
      return;
    }
    
    this.setData({ submitting: true });
    
    try {
      // 准备提交数据
      const exerciseData = {
        name: name.trim(),
        originName: originName.trim(),
        description: description.trim(),
        mainMuscleIds: selectedMainMuscles,
        supportMuscleIds: selectedSupportMuscles,
        cues: cues.filter(cue => cue.trim())
      };
      
      // 提交数据
      await exerciseApi.create(exerciseData);
      
      wx.showToast({
        title: '动作创建成功',
        icon: 'success'
      });
      
      // 跳转回列表页面
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (error) {
      console.error('Failed to create exercise:', error);
      wx.showToast({
        title: '创建动作失败',
        icon: 'none'
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  /**
   * 返回上一页
   */
  navigateBack() {
    wx.navigateBack();
  },

  /**
   * 处理菜单切换
   */
  handleMenuToggle() {
    this.setData({ menuOpen: !this.data.menuOpen });
  }
});