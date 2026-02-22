// 计划编辑逻辑
const { routineApi, exerciseApi } = require('../../../services/api');


Page({
  /**
   * 页面的初始数据
   */
  data: {
    routineId: null,
    routine: null,
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
  onLoad(options) {
    console.log('RoutineEditPage loaded', options);
    const routineId = options.id;
    if (!routineId) {
      wx.showToast({ title: 'Invalid routine ID', icon: 'none' });
      wx.navigateBack();
      return;
    }
    
    this.setData({ routineId });
    this.fetchRoutineData();
  },

  /**
   * 获取计划数据
   */
  async fetchRoutineData() {
    this.setData({ loading: true });
    try {
      const { routineId } = this.data;
      
      if (!routineId) {
        throw new Error('Routine ID is required');
      }
      
      // 获取计划详情
      const routineResponse = await routineApi.getById(routineId);
      const routine = routineResponse.data?.data || routineResponse.data;
      this.setData({ routine });
      
      // 获取动作列表
      const exerciseResponse = await exerciseApi.getAll();
      const exercises = exerciseResponse.data?.data || exerciseResponse.data || [];
      this.setData({ exercises });
      
      // 模拟目标数据（实际应该从 API 获取）
      const mockTargets = [
        { id: 1, name: 'Strength' },
        { id: 2, name: 'Endurance' },
        { id: 3, name: 'Flexibility' },
        { id: 4, name: 'Cardio' }
      ];
      this.setData({ targets: mockTargets });
      
      // 初始化表单数据
      this.initFormData(routine);
    } catch (error) {
      console.error('Failed to fetch routine data:', error);
      wx.showToast({ title: 'Failed to load routine data', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 初始化表单数据
   */
  initFormData(routine) {
    const { name, description, targets, exercises, note } = routine;
    
    // 处理目标选择
    const selectedTargets = [];
    if (targets && Array.isArray(targets)) {
      targets.forEach(target => {
        if (typeof target === 'object' && target.id) {
          selectedTargets.push(target.id);
        }
      });
    }
    
    // 处理动作选择
    const selectedExercises = [];
    if (exercises && Array.isArray(exercises)) {
      exercises.forEach(exercise => {
        if (typeof exercise === 'object' && exercise.id) {
          selectedExercises.push(exercise.id);
        }
      });
    }
    
    this.setData({
      name: name || '',
      description: description || '',
      selectedTargets,
      selectedExercises,
      note: note || ''
    });
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
    const { routineId, name, description, selectedTargets, selectedExercises, note } = this.data;
    
    // 验证表单
    if (!name.trim()) {
      wx.showToast({ title: 'Please enter routine name', icon: 'none' });
      return;
    }
    
    if (!routineId) {
      wx.showToast({ title: 'Invalid routine ID', icon: 'none' });
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
      await routineApi.update(routineId, routineData);
      
      wx.showToast({
        title: 'Routine updated successfully',
        icon: 'success'
      });
      
      // 跳转回列表页面
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (error) {
      console.error('Failed to update routine:', error);
      wx.showToast({
        title: 'Failed to update routine',
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