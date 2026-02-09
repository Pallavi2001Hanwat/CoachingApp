import axiosInstance from '../api_Intersecptor/user_axiosInstance';


// ✅ Type definition for Syllabus Category
export type SyllabusCategory = {
  _id?: string;
  CategoryName: string;
  Description?: string;
  Status: 'Active' | 'Inactive';
  CreatedAt: Date;
};


export type Syllabus = {
  _id?: string;
  Title: string;
  Description?: string;
  SyllabusCategoryId: string;
  PdfUrl: string;
  Status: 'Active' | 'Inactive';
  CreatedAt: Date;
};

export const getAllSyllabusCategories = async (): Promise<SyllabusCategory[]> => {
  const { data } = await axiosInstance.get('/student/get-AllSyllabusCategories');
  return data;
};


export const getSyllbusBySyllbusCategoryId = async (
  SyllabusCategoryId: string
): Promise<Syllabus[]> => {
  const { data } = await axiosInstance.get(
    `/student/get-Syllabus/${SyllabusCategoryId}`
  );
  return data;
};