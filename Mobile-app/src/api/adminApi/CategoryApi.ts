import axiosInstance from '../api_Intersecptor/admin_axiosInstance';


// ✅ Type definition for Category
export type Category = {
  _id?: string;
  CategoryName: string;
  CategoryCode: string;
  Description?: string;
   Image?: string;
  CreatedBy?: string; // 
  createdDate?: Date;
  updatedDate?: Date;
  Status: 'Active' | 'Inactive';
};

// ✅ Get all Categories
export const getAllCategories = async (): Promise<Category[]> => {
  const { data } = await axiosInstance.get('/get-AllCategory');
  return data; // ✅ Make sure it matches backend response shape
};

// ✅ Get single Category by ID
export const getCategoryById = async (id: string): Promise<Category> => {
    console.log(id)
  const { data } = await axiosInstance.get(`/get-CategoryById/${id}`);
  return data; // ✅ Adjusted to match backend response
};

// ✅ Create new Category
export const createCategory = async (categoryData: Omit<Category, '_id' | 'createdDate' | 'updatedDate'>): Promise<Category> => {

  const { data } = await axiosInstance.post('/create-Category', categoryData);
  return data; // ✅ Matches backend return key
};

// ✅ Update Category
export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
  const { data } = await axiosInstance.put(`/update-Category/${id}`, categoryData);
  return data; // ✅ Matches backend return key
};

// ✅ Delete Category
export const deleteCategory = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/delete-Category/${id}`);
  return data;
};
