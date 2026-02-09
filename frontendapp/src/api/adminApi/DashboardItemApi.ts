import axiosInstance from '../api_Intersecptor/admin_axiosInstance';


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

// ✅ Get all Categories
export const getAllDashboard_Items = async (): Promise<Dashboard_Item[]> => {
  const { data } = await axiosInstance.get('/get-AllDashboard_Item');
  return data; // ✅ Make sure it matches backend response shape
};

// ✅ Get single Dashboard_Item by ID
export const getDashboard_ItemById = async (id: string): Promise<Dashboard_Item> => {
 
  const { data } = await axiosInstance.get(`/get-Dashboard_ItemById/${id}`);
  return data; // ✅ Adjusted to match backend response
};

// ✅ Create new Dashboard_Item
export const createDashboard_Item = async (Dashboard_ItemData: Omit<Dashboard_Item, '_id' | 'createdDate' | 'updatedDate'>): Promise<Dashboard_Item> => {
  const { data } = await axiosInstance.post('/create-Dashboard_Item', Dashboard_ItemData);
  return data; // ✅ Matches backend return key
};

// ✅ Update Dashboard_Item
export const updateDashboard_Item = async (id: string, Dashboard_ItemData: Partial<Dashboard_Item>): Promise<Dashboard_Item> => {
  const { data } = await axiosInstance.put(`/update-Dashboard_Item/${id}`, Dashboard_ItemData);
  return data; // ✅ Matches backend return key
};

// ✅ Delete Dashboard_Item
export const deleteDashboard_Item = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/delete-Dashboard_Item/${id}`);
  return data;
};
