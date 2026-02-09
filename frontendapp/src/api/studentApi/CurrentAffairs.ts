import axiosInstance from '../api_Intersecptor/user_axiosInstance';



// ✅ Get All Daily Current Affairs
export const getAllDailyCurrentAffairs = async (): Promise<any> => {
  const res = await axiosInstance.get(
    '/student/get-AllDailyCurrentAffairs'
  );
  return res.data;
};


// ✅ Get All Monthly Current Affairs
export const getAllMonthlyCurrentAffairs = async (): Promise<any> => {
  const res = await axiosInstance.get(
    "/student/get-AllMonthlyCurrentAffairs"
  );
  return res.data;
};
