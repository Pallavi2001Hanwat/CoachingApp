import axiosInstance from '../api_Intersecptor/admin_axiosInstance';

// ✅ Type definition
export type PreviousYearPaperCategory = {
  _id?: string;
  Title: string;
  Image: string;
  Status: 'Active' | 'Inactive';
  CreatedBy: string;
};

// ✅ Get all PYP Categories
export const getAllPYPCategories = async (): Promise<PreviousYearPaperCategory[]> => {
  const { data } = await axiosInstance.get('/get-AllPYPCategories');
  return data;
};

// ✅ Get single PYP Category by ID
export const getPYPCategoryById = async (id: string): Promise<PreviousYearPaperCategory> => {
  const { data } = await axiosInstance.get(`/get-PYPCategoryById/${id}`);
  return data;
};

// ✅ Create new PYP Category
export const createPYPCategory = async (
  categoryData: PreviousYearPaperCategory
): Promise<PreviousYearPaperCategory> => {
  const { data } = await axiosInstance.post('/create-PYPCategory', categoryData);
  return data;
};

// ✅ Update PYP Category
export const updatePYPCategory = async (
  id: string,
  categoryData: Partial<PreviousYearPaperCategory>
): Promise<PreviousYearPaperCategory> => {
  const { data } = await axiosInstance.put(
    `/update-PYPCategory/${id}`,
    categoryData
  );
  return data;
};

// ✅ Delete PYP Category
export const deletePYPCategory = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  const { data } = await axiosInstance.delete(`/delete-PYPCategory/${id}`);
  return data;
};
