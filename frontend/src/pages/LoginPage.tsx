import React from 'react';
import LoginForm from '@/components/Login/LoginForm';
import { loginApi } from '@/services/api';

const LoginPage: React.FC = () => {
  const handleDeviceLogin = async () => {
    try {
      // 获取设备信息
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
      };
      
      // 生成设备唯一标识符
      const deviceId = generateDeviceId();
      
      // 调用设备认证API
      const response = await loginApi.deviceLogin({
        deviceId,
        deviceInfo: JSON.stringify(deviceInfo)
      });
      
      if (response.status === 200 && response.data) {
        // 存储令牌
        localStorage.setItem('token', response.data.data);
        // 刷新页面或重定向
        window.location.reload();
      }
    } catch (err) {
      console.error('设备认证失败:', err);
      alert('设备认证失败，请稍后重试');
    }
  };
  
  // 生成设备唯一标识符
  const generateDeviceId = (): string => {
    // 尝试从localStorage获取设备ID
    let deviceId = localStorage.getItem('deviceId');
    
    if (!deviceId) {
      // 如果没有设备ID，则生成一个新的
      deviceId = crypto.randomUUID();
      // 存储设备ID到localStorage
      localStorage.setItem('deviceId', deviceId);
    }
    
    return deviceId;
  };

  return (
    <LoginForm onDeviceLogin={handleDeviceLogin} />
  );
};

export default LoginPage;
