// src/api/adminApi.ts
import axiosInstance from '../api_Intersecptor/admin_axiosInstance';

export type DashboardData = {
  totalStudents: number;
  totalCourses: number;
 
};

export const getAdminDashboard = async (): Promise<DashboardData> => {
  const { data } = await axiosInstance.get('/admin/dashboard');
  return data;
};
