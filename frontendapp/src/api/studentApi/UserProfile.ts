import axiosInstance from '../api_Intersecptor/user_axiosInstance';

export const getAll_userProfile = async (): Promise<any[]> => {
  const { data } = await axiosInstance.get('/student/student-profile');
  return data; // ✅ Make sure it matches backend response shape
};