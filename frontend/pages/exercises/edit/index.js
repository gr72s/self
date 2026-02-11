// 动作编辑逻辑
const { exerciseApi, muscleApi } = require('../../../services/api');


Page({
  /**
   * 页面的初始数据
   */
  data: {
    exerciseId: null,
    exercise: null,
    name: '',
    originName: '',
    description: '',
    muscles: [],
    selectedMainMuscles: [],
    selectedSupportMuscles: [],
    cues: [],
    loading: true,
    submitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('ExerciseEditPage loaded', options);
    const exerciseId = options.id;
    if (!exerciseId) {
      wx.showToast({ title: 'Invalid exercise ID', icon: 'none' });
      wx.navigateBack();
      return;
    }
    
    this.setData({ exerciseId });
    this.fetchExerciseData();
  },

  /**
   * 获取动作数据
   */
  async fetchExerciseData() {
    this.setData({ loading: true });
    try {
      const { exerciseId } = this.data;
      
      // 获取动作详情
      const exerciseResponse = await exerciseApi.getById(exerciseId);
      const exercise = exerciseResponse.data?.data || exerciseResponse.data;
      this.setData({ exercise });
      
      // 获取肌肉列表
      const muscleResponse = await muscleApi.getAll();
      const muscles = muscleResponse.data?.data || muscleResponse.data || [];
      this.setData({ muscles });
      
      // 初始化表单数据
      this.initFormData(exercise);
    } catch (error) {
      console.error('Failed to fetch exercise data:', error);
      wx.showToast({ title: 'Failed to load exercise data', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 初始化表单数据
   */
  initFormData(exercise) {
    const { name, originName, description, mainMuscles, supportMuscles, cues } = exercise;
    
    // 处理主要肌肉选择
    const selectedMainMuscles = [];
    if (mainMuscles) {
      mainMuscles.forEach(muscle => {
        selectedMainMuscles.push(muscle.id);
      });
    }
    
    // 处理辅助肌肉选择
    const selectedSupportMuscles = [];
    if (supportMuscles) {
      supportMuscles.forEach(muscle => {
        selectedSupportMuscles.push(muscle.id);
      });
    }
    
    this.setData({
      name: name || '',
      originName: originName || '',
      description: description || '',
      selectedMainMuscles,
      selectedSupportMuscles,
      cues: cues || []
    });
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
    const muscleId = e.currentTarget.dataset.id;
    const selectedMainMuscles = [...this.data.selectedMainMuscles];
    
    const index = selectedMainMuscles.indexOf(muscleId);
    if (index > -1) {
      selectedMainMuscles.splice(index, 1);
    } else {
      selectedMainMuscles.push(muscleId);
    }
    
    this.setData({ selectedMainMuscles });
  },

  /**
   * 切换辅助肌肉选择
   */
  toggleSupportMuscle(e) {
    const muscleId = e.currentTarget.dataset.id;
    const selectedSupportMuscles = [...this.data.selectedSupportMuscles];
    
    const index = selectedSupportMuscles.indexOf(muscleId);
    if (index > -1) {
      selectedSupportMuscles.splice(index, 1);
    } else {
      selectedSupportMuscles.push(muscleId);
    }
    
    this.setData({ selectedSupportMuscles });
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
    const index = e.currentTarget.dataset.index;
    const cues = [...this.data.cues];
    cues.splice(index, 1);
    this.setData({ cues });
  },

  /**
   * 处理动作提示输入
   */
  handleCueChange(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const cues = [...this.data.cues];
    cues[index] = value;
    this.setData({ cues });
  },

  /**
   * 处理表单提交
   */
  async handleSubmit(e) {
    const { exerciseId, name, originName, description, selectedMainMuscles, selectedSupportMuscles, cues } = this.data;
    
    // 验证表单
    if (!name.trim()) {
      wx.showToast({ title: 'Please enter exercise name', icon: 'none' });
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
      await exerciseApi.update(exerciseId, exerciseData);
      
      wx.showToast({
        title: 'Exercise updated successfully',
        icon: 'success'
      });
      
      // 跳转回列表页面
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (error) {
      console.error('Failed to update exercise:', error);
      wx.showToast({
        title: 'Failed to update exercise',
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
  }
});