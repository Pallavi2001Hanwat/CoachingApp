import axiosInstance from '../api_Intersecptor/user_axiosInstance';


// ✅ Type definition for Dashboard_Item
export type Dashboard_Item = {
  _id?: string;
   Title: string;
  Description?: string;
  Image?: string; // Icon/Image
  Type: string;
  Action: string; // Link or action
  Visibility:  'Free' | 'Paid';
  OrderNumber: number;
  Status: 'Active' | 'Inactive';
  TeacherId:  string;
  CreatedBy?: string; // 
  createdDate?: Date;
  updatedDate?: Date;
};

// ✅ Get all DashboardItems
export const getAll_Active_Dashboard_Items = async (): Promise<Dashboard_Item[]> => {
  const { data } = await axiosInstance.get('/student/get-All_Active_Dashboard_Items');
  return data; // ✅ Make sure it matches backend response shape
};

