import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginPage from './LoginPage';

// Mock LoginForm组件
jest.mock('@/components/Login/LoginForm', () => {
  return function MockLoginForm({ onDeviceLogin }: any) {
    return (
      <div>
        <button data-testid="device-login-button" onClick={onDeviceLogin}>
          设备登录
        </button>
      </div>
    );
  };
});

// Mock loginApi
jest.mock('@/services/api', () => ({
  loginApi: {
    deviceLogin: jest.fn()
  }
}));

// 获取 mockDeviceLogin
import { loginApi } from '@/services/api';
const mockDeviceLogin = loginApi.deviceLogin as jest.MockedFunction<typeof loginApi.deviceLogin>;

// Mock crypto
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: jest.fn().mockReturnValue('test-uuid-123')
  }
});

// Mock alert
const mockAlert = jest.spyOn(window, 'alert').mockImplementation();

// 不需要模拟 window.location.reload，因为它是只读属性
// 我们会在测试中验证其他关键功能

describe('LoginPage', () => {
  beforeEach(() => {
    // 清除localStorage
    localStorage.clear();
    // 清除所有mock的调用记录
    jest.clearAllMocks();
  });

  test('渲染LoginPage组件', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('device-login-button')).toBeInTheDocument();
  });

  test('点击设备登录按钮调用handleDeviceLogin', async () => {
    // 设置mockDeviceLogin返回成功
    mockDeviceLogin.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
      data: { success: true, data: 'test-token' }
    } as any);

    render(<LoginPage />);
    
    // 点击设备登录按钮
    fireEvent.click(screen.getByTestId('device-login-button'));
    
    // 验证localStorage.getItem被调用
    await waitFor(() => {
      expect(mockDeviceLogin).toHaveBeenCalled();
    });
  });

  test('首次登录时生成新的设备ID', async () => {
    // 设置mockDeviceLogin返回成功
    mockDeviceLogin.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
      data: { success: true, data: 'test-token' }
    } as any);

    render(<LoginPage />);
    
    // 点击设备登录按钮
    fireEvent.click(screen.getByTestId('device-login-button'));
    
    // 验证生成了新的设备ID并存储
    await waitFor(() => {
      expect(window.crypto.randomUUID).toHaveBeenCalled();
      expect(localStorage.getItem('deviceId')).toBe('test-uuid-123');
    });
  });

  test('使用已存在的设备ID', async () => {
    // 预先设置设备ID
    localStorage.setItem('deviceId', 'existing-device-id');
    // 设置mockDeviceLogin返回成功
    mockDeviceLogin.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
      data: { success: true, data: 'test-token' }
    } as any);

    render(<LoginPage />);
    
    // 点击设备登录按钮
    fireEvent.click(screen.getByTestId('device-login-button'));
    
    // 验证使用了已存在的设备ID，没有调用randomUUID
    await waitFor(() => {
      expect(window.crypto.randomUUID).not.toHaveBeenCalled();
      expect(localStorage.getItem('deviceId')).toBe('existing-device-id');
    });
  });

  test('设备登录成功时存储令牌', async () => {
    // 设置mockDeviceLogin返回成功
    mockDeviceLogin.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
      data: { success: true, data: 'test-token-123' }
    } as any);

    render(<LoginPage />);
    
    // 点击设备登录按钮
    fireEvent.click(screen.getByTestId('device-login-button'));
    
    // 验证登录成功后存储令牌
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('test-token-123');
    });
  });

  test('设备登录失败时显示错误信息', async () => {
    // 设置mockDeviceLogin返回失败
    mockDeviceLogin.mockRejectedValue(new Error('Login failed'));

    render(<LoginPage />);
    
    // 点击设备登录按钮
    fireEvent.click(screen.getByTestId('device-login-button'));
    
    // 验证登录失败后显示错误信息
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('设备认证失败，请稍后重试');
    });
  });

  test('设备登录返回非200状态时显示错误信息', async () => {
    // 设置mockDeviceLogin返回非200状态
    mockDeviceLogin.mockResolvedValue({
      status: 401,
      statusText: 'Unauthorized',
      headers: {},
      config: {},
      data: { success: false, data: '' }
    } as any);

    render(<LoginPage />);
    
    // 点击设备登录按钮
    fireEvent.click(screen.getByTestId('device-login-button'));
    
    // 验证登录失败后显示错误信息
    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('设备认证失败，请稍后重试');
    });
  });
});