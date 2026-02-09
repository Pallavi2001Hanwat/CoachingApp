import axiosInstance from '../api_Intersecptor/user_axiosInstance';


// ✅ Type definition for Dashboard_Item
export type Category = {
  _id?: string;
  CategoryName: string;
  CategoryCode: string;
  Description?: string;
  Image: string;

  CreatedBy?: string; // 
  createdDate?: Date;
  updatedDate?: Date;
  Status: 'Active' | 'Inactive';
};

// ✅ Get all DashboardItems
export const get_PaidCourseCategories = async (): Promise<Category[]> => {
  const { data } = await axiosInstance.get('/student/get-PaidCourseCategories');
  return data; // ✅ Make sure it matches backend response shape
};

export const getAllCategories = async (): Promise<Category[]> => {
  const { data } = await axiosInstance.get('/student/get-AllCategories');
  return data; // ✅ Make sure it matches backend response shape
};


