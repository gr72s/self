// 计划创建逻辑
const { routineApi, exerciseApi } = require('../../../services/api');


Page({
  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    description: '',
    targets: [],
    exercises: [],
    selectedTargets: [],
    selectedExercises: [],
    note: '',
    loading: true,
    submitting: false,
    menuOpen: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    console.log('RoutineCreatePage loaded');
    this.fetchInitialData();
  },

  /**
   * 获取初始数据
   */
  async fetchInitialData() {
    this.setData({ loading: true });
    try {
      // 获取动作列表
      try {
        const exerciseResponse = await exerciseApi.getAll();
        const exercises = exerciseResponse.data?.data || exerciseResponse.data || [];
        this.setData({ exercises });
      } catch (error) {
        console.error('Failed to fetch exercises:', error);
      }

      // 模拟目标数据（实际应该从 API 获取）
      const mockTargets = [
        { id: 1, name: 'Strength' },
        { id: 2, name: 'Endurance' },
        { id: 3, name: 'Flexibility' },
        { id: 4, name: 'Cardio' }
      ];
      this.setData({ targets: mockTargets });
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
   * 处理描述输入
   */
  handleDescriptionChange(e) {
    this.setData({ description: e.detail.value });
  },

  /**
   * 处理备注输入
   */
  handleNoteChange(e) {
    this.setData({ note: e.detail.value });
  },

  /**
   * 切换目标选择
   */
  toggleTarget(e) {
    const targetId = e.currentTarget?.dataset?.id;
    if (typeof targetId === 'number') {
      const selectedTargets = [...this.data.selectedTargets];
      
      const index = selectedTargets.indexOf(targetId);
      if (index > -1) {
        selectedTargets.splice(index, 1);
      } else {
        selectedTargets.push(targetId);
      }
      
      this.setData({ selectedTargets });
    }
  },

  /**
   * 切换动作选择
   */
  toggleExercise(e) {
    const exerciseId = e.currentTarget?.dataset?.id;
    if (typeof exerciseId === 'string') {
      const selectedExercises = [...this.data.selectedExercises];
      
      const index = selectedExercises.indexOf(exerciseId);
      if (index > -1) {
        selectedExercises.splice(index, 1);
      } else {
        selectedExercises.push(exerciseId);
      }
      
      this.setData({ selectedExercises });
    }
  },

  /**
   * 处理表单提交
   */
  async handleSubmit(e) {
    const { name, description, selectedTargets, selectedExercises, note } = this.data;
    
    // 验证表单
    if (!name.trim()) {
      wx.showToast({ title: 'Please enter routine name', icon: 'none' });
      return;
    }
    
    this.setData({ submitting: true });
    
    try {
      // 准备提交数据
      const routineData = {
        name: name.trim(),
        description: description.trim(),
        targetIds: selectedTargets,
        exerciseIds: selectedExercises,
        note: note.trim()
      };
      
      // 提交数据
      await routineApi.create(routineData);
      
      wx.showToast({
        title: 'Routine created successfully',
        icon: 'success'
      });
      
      // 跳转回列表页面
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (error) {
      console.error('Failed to create routine:', error);
      wx.showToast({
        title: 'Failed to create routine',
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