import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const AuthGuard = ({ children, allowedRoles }) => {
  debugger
  const token = Cookies.get('token');
  const roleCookie = Cookies.get('role');

  const roles = roleCookie ? JSON.parse(roleCookie) : [];

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  if (allowedRoles && !roles.some(role => allowedRoles.includes(role))) {
    return <Navigate to="/admin/not-authorized" replace />;
  }

  return children;
};

export default AuthGuard;