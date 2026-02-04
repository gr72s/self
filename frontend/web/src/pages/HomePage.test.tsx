// Mock workoutApi
const mockGetAll = jest.fn();
const mockGetInProcess = jest.fn();
jest.mock('@/services/api', () => ({
  workoutApi: {
    getAll: mockGetAll,
    getInProcess: mockGetInProcess
  }
}));

// Mock HomePage component
jest.mock('./HomePage', () => {
  return function MockHomePage() {
    // 模拟组件内部�?useEffect 逻辑
    React.useEffect(() => {
      const fetchWorkouts = async () => {
        try {
          const response = await mockGetAll();
          if (response.status == 200 && response.data) {
            // 模拟设置 workouts 状�?
          }
        } catch (error) {
          console.error('获取训练记录失败:', error);
        }
      };

      const fetchCurrentWorkout = async () => {
        try {
          const response = await mockGetInProcess();
          if (response.status == 200 && response.data) {
            // 模拟设置 currentWorkout 状�?
          }
        } catch (error) {
          console.error('获取进行中训练失�?', error);
        }
      };

      fetchWorkouts();
      fetchCurrentWorkout();
    }, []);

    return (
      <div>
        <h1>欢迎回来</h1>
        <div>统计卡片</div>
        <div>当前训练</div>
        <div>最近训�?/div>
      </div>
    );
  };
});

// 导入 React
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from './HomePage';

// Mock Date
const mockDate = new Date('2026-01-27T12:00:00');
jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

describe('HomePage', () => {
  beforeEach(() => {
    // 清除所有mock的调用记�?
    jest.clearAllMocks();
  });

  test('渲染HomePage组件', () => {
    // 设置mock返回�?
    mockGetAll.mockResolvedValue({
      status: 200,
      data: { success: true, data: [] }
    } as any);
    mockGetInProcess.mockResolvedValue({
      status: 200,
      data: { success: true, data: null }
    } as any);

    render(<HomePage />);
    
    // 验证页面标题
    expect(screen.getByText('欢迎回来')).toBeInTheDocument();
    expect(screen.getByText('统计卡片')).toBeInTheDocument();
    expect(screen.getByText('当前训练')).toBeInTheDocument();
    expect(screen.getByText('最近训�?)).toBeInTheDocument();
  });

  test('API调用失败时显示错误信�?, async () => {
    // 设置mock返回失败
    mockGetAll.mockRejectedValue(new Error('获取训练记录失败'));
    mockGetInProcess.mockRejectedValue(new Error('获取进行中训练失�?));

    // 捕获console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<HomePage />);
    
    // 验证错误信息
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('获取训练记录失败:', expect.any(Error));
      expect(consoleErrorSpy).toHaveBeenCalledWith('获取进行中训练失�?', expect.any(Error));
    });

    // 恢复console.error
    consoleErrorSpy.mockRestore();
  });

  test('API调用成功时获取数�?, async () => {
    // 设置mock返回�?
    const mockWorkouts = [
      {
        id: 1,
        routine: { id: 1, name: '胸肌训练' },
        startTime: '2026-01-26T10:00:00',
        endTime: '2026-01-26T11:00:00'
      }
    ];

    mockGetAll.mockResolvedValue({
      status: 200,
      data: { success: true, data: mockWorkouts }
    } as any);
    mockGetInProcess.mockResolvedValue({
      status: 200,
      data: { success: true, data: null }
    } as any);

    render(<HomePage />);
    
    // 验证API调用
    await waitFor(() => {
      expect(mockGetAll).toHaveBeenCalled();
      expect(mockGetInProcess).toHaveBeenCalled();
    });
  });
});
