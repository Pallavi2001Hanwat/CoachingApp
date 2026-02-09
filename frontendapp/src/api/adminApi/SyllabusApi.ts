import axiosInstance from '../api_Intersecptor/admin_axiosInstance';

// ✅ Type definition for Syllabus Category
export type SyllabusCategory = {
  _id?: string;
  CategoryName: string;
  Description?: string;
  Status: 'Active' | 'Inactive';
  CreatedAt: Date;
};

// ✅ Get all Syllabus Categories
export const getAllSyllabusCategories = async (): Promise<SyllabusCategory[]> => {
  const { data } = await axiosInstance.get('/get-AllSyllabusCategories');
  return data;
};

// ✅ Get single Syllabus Category by ID
export const getSyllabusCategoryById = async (id: string): Promise<SyllabusCategory> => {
  const { data } = await axiosInstance.get(`/get-SyllabusCategoryById/${id}`);
  return data;
};

// ✅ Create Syllabus Category
export const createSyllabusCategory = async (
  categoryData: SyllabusCategory
): Promise<SyllabusCategory> => {
  const { data } = await axiosInstance.post('/create-SyllabusCategory', categoryData);
  return data;
};

// ✅ Update Syllabus Category
export const updateSyllabusCategory = async (
  id: string,
  categoryData: Partial<SyllabusCategory>
): Promise<SyllabusCategory> => {
  const { data } = await axiosInstance.put(`/update-SyllabusCategory/${id}`, categoryData);
  return data;
};

// ✅ Delete Syllabus Category
export const deleteSyllabusCategory = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/delete-SyllabusCategory/${id}`);
  return data;
};



// ✅ Type definition for Syllabus
export type Syllabus = {
  _id?: string;
  Title: string;
  Description?: string;
  SyllabusCategoryId: string;
  PdfUrl: string;
  Status: 'Active' | 'Inactive';
  CreatedAt: Date;
};

// ✅ Get all Syllabus
export const getAllSyllabus = async (): Promise<Syllabus[]> => {
  const { data } = await axiosInstance.get('/get-AllSyllabus');
  return data;
};

// ✅ Get single Syllabus by ID
export const getSyllabusById = async (id: string): Promise<Syllabus> => {
  const { data } = await axiosInstance.get(`/get-SyllabusById/${id}`);
  return data;
};

// ✅ Create Syllabus
export const createSyllabus = async (syllabusData: Syllabus): Promise<Syllabus> => {
  const { data } = await axiosInstance.post('/create-Syllabus', syllabusData);
  return data;
};

// ✅ Update Syllabus
export const updateSyllabus = async (
  id: string,
  syllabusData: Partial<Syllabus>
): Promise<Syllabus> => {
  const { data } = await axiosInstance.put(`/update-Syllabus/${id}`, syllabusData);
  return data;
};

// ✅ Delete Syllabus
export const deleteSyllabus = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/delete-Syllabus/${id}`);
  return data;
};
