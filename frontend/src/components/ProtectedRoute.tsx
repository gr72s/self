import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  // 检查用户是否已登录（通过检查localStorage中是否有token）
  const isLoggedIn = localStorage.getItem('token') !== null;

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
