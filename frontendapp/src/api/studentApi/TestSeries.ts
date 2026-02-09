import axiosInstance from '../api_Intersecptor/user_axiosInstance';

export type TestSeries = {
  _id?: string;
   Title: string;
  Description: string;
  Image: string;
  IsPaid: boolean;
  Price?: number;
  DiscountPrice?: number;
  ValidityDays?: number;
  TotalTests: number; // Can be auto calculated later
  TeacherId: string;
  CreatedBy: string;
  Status: 'Active' | 'Inactive';
  createdDate: Date;
  updatedDate: Date;
};


export const getAll_Paid_TestSeries = async (): Promise<TestSeries[]> => {

  const { data } = await axiosInstance.get('/student/get-All-Paid-TestSeries');
  return data; // ✅ Make sure it matches backend response shape
};


export const getAll_Free_TestSeries = async (): Promise<TestSeries[]> => {
  const { data } = await axiosInstance.get('/student/get-All-Free-TestSeries');
  return data; // ✅ Make sure it matches backend response shape
};



export const getTestSeriesByCategory = async (categoryId :string): Promise<TestSeries[]> => {

   const { data } = await axiosInstance.get(`/student/get-AllTestSeriesByCategoryId/${categoryId}`);
  return data; // ✅ Make sure it matches backend response shape
};