// 训练编辑逻辑
const { workoutApi, routineApi, gymApi } = require('../../../services/api');


Page({
  /**
   * 页面的初始数据
   */
  data: {
    workoutId: null,
    workout: null,
    routines: [],
    gyms: [],
    targets: [],
    selectedRoutineIndex: 0,
    selectedGymIndex: 0,
    selectedTargets: [],
    note: '',
    loading: true,
    submitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('WorkoutEditPage loaded', options);
    const workoutId = options.id;
    if (!workoutId) {
      wx.showToast({ title: 'Invalid workout ID', icon: 'none' });
      wx.navigateBack();
      return;
    }
    
    this.setData({ workoutId });
    this.fetchWorkoutData();
  },

  /**
   * 获取训练数据
   */
  async fetchWorkoutData() {
    this.setData({ loading: true });
    try {
      const { workoutId } = this.data;
      
      if (!workoutId) {
        throw new Error('Workout ID is required');
      }
      
      // 获取训练详情
      const workoutResponse = await workoutApi.getById(workoutId);
      const workout = workoutResponse.data?.data || workoutResponse.data;
      this.setData({ workout });
      
      // 获取训练计划列表
      const routineResponse = await routineApi.getAll();
      const routines = routineResponse.data?.data || routineResponse.data || [];
      this.setData({ routines });
      
      // 获取健身房列表
      const gymResponse = await gymApi.getAll();
      const gyms = gymResponse.data?.data || gymResponse.data || [];
      this.setData({ gyms });
      
      // 模拟目标数据（实际应该从 API 获取）
      const mockTargets = [
        { id: 1, name: 'Strength' },
        { id: 2, name: 'Endurance' },
        { id: 3, name: 'Flexibility' },
        { id: 4, name: 'Cardio' }
      ];
      this.setData({ targets: mockTargets });
      
      // 初始化表单数据
      this.initFormData(workout, routines, gyms);
    } catch (error) {
      console.error('Failed to fetch workout data:', error);
      wx.showToast({ title: 'Failed to load workout data', icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 初始化表单数据
   */
  initFormData(workout, routines, gyms) {
    // 找到选中的训练计划索引
    const selectedRoutineIndex = routines.findIndex(r => r.id === workout.routineId);
    
    // 找到选中的健身房索引
    const selectedGymIndex = gyms.findIndex(g => g.id === workout.gymId);
    
    // 处理目标选择
    const selectedTargets = [];
    if (workout.target) {
      // 假设 workout.target 是一个包含目标对象的集合
      if (Array.isArray(workout.target)) {
        workout.target.forEach(target => {
          if (typeof target === 'object' && target.id) {
            selectedTargets.push(target.id);
          }
        });
      }
    }
    
    this.setData({
      selectedRoutineIndex: selectedRoutineIndex > -1 ? selectedRoutineIndex : 0,
      selectedGymIndex: selectedGymIndex > -1 ? selectedGymIndex : 0,
      selectedTargets,
      note: workout.note || ''
    });
  },

  /**
   * 处理训练计划选择
   */
  handleRoutineChange(e) {
    const index = parseInt(e.detail.value, 10);
    this.setData({ selectedRoutineIndex: index });
  },

  /**
   * 处理健身房选择
   */
  handleGymChange(e) {
    const index = parseInt(e.detail.value, 10);
    this.setData({ selectedGymIndex: index });
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
   * 处理备注输入
   */
  handleNoteChange(e) {
    this.setData({ note: e.detail.value });
  },

  /**
   * 处理表单提交
   */
  async handleSubmit(e) {
    const { workoutId, routines, gyms, selectedRoutineIndex, selectedGymIndex, selectedTargets, note } = this.data;
    
    // 验证表单
    if (!workoutId) {
      wx.showToast({ title: 'Invalid workout ID', icon: 'none' });
      return;
    }
    
    if (!routines[selectedRoutineIndex]) {
      wx.showToast({ title: 'Please select a routine', icon: 'none' });
      return;
    }
    
    if (!gyms[selectedGymIndex]) {
      wx.showToast({ title: 'Please select a gym', icon: 'none' });
      return;
    }
    
    this.setData({ submitting: true });
    
    try {
      // 准备提交数据
      const workoutData = {
        routineId: routines[selectedRoutineIndex].id,
        gymId: gyms[selectedGymIndex].id,
        targetIds: selectedTargets,
        note
      };
      
      // 提交数据
      await workoutApi.update(workoutId, workoutData);
      
      wx.showToast({
        title: 'Workout updated successfully',
        icon: 'success'
      });
      
      // 跳转回列表页面
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (error) {
      console.error('Failed to update workout:', error);
      wx.showToast({
        title: 'Failed to update workout',
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