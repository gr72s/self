// 训练创建逻辑
const { workoutApi, routineApi, gymApi } = require('../../../services/api');


Page({
  /**
   * 页面的初始数据
   */
  data: {
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
  onLoad() {
    console.log('WorkoutCreatePage loaded');
    this.fetchInitialData();
  },

  /**
   * 获取初始数据
   */
  async fetchInitialData() {
    this.setData({ loading: true });
    try {
      // 获取训练计划列表
      try {
        const routineResponse = await routineApi.getAll();
        const routines = routineResponse.data?.data || routineResponse.data || [];
        this.setData({ routines });
      } catch (error) {
        console.error('Failed to fetch routines:', error);
      }

      // 获取健身房列表
      try {
        const gymResponse = await gymApi.getAll();
        const gyms = gymResponse.data?.data || gymResponse.data || [];
        this.setData({ gyms });
      } catch (error) {
        console.error('Failed to fetch gyms:', error);
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
    const { routines, gyms, selectedRoutineIndex, selectedGymIndex, selectedTargets, note } = this.data;
    
    // 验证表单
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
      await workoutApi.create(workoutData);
      
      wx.showToast({
        title: 'Workout created successfully',
        icon: 'success'
      });
      
      // 跳转回列表页面
      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (error) {
      console.error('Failed to create workout:', error);
      wx.showToast({
        title: 'Failed to create workout',
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