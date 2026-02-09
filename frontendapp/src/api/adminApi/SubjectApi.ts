import axiosInstance from '../api_Intersecptor/admin_axiosInstance';

// ✅ Type definition for Subject
export type Subject = {
  _id?: string;
  Title: string;
  SubjectCode: string;
  Image?: string;
  Description?: string;
  createdDate: Date;
  updatedDate: Date;
  Status: 'Active' | 'Inactive';

  
};


// ✅ Get all Subjects
export const getAllSubjects = async (): Promise<Subject[]> => {
  const { data } = await axiosInstance.get('/get-AllSubject');
  return data;
};

// ✅ Get single Subject by ID
export const getSubjectById = async (id: string): Promise<Subject> => {
  const { data } = await axiosInstance.get(`/get-SubjectById/${id}`);
  return data;
};

// ✅ Create new Subject
export const createSubject = async (SubjectData: Subject): Promise<Subject> => {

  const { data } = await axiosInstance.post('/create-Subject', SubjectData);
  return data;
};

// ✅ Update Subject
export const updateSubject = async (id: string, SubjectData: Partial<Subject>): Promise<Subject> => {
  const { data } = await axiosInstance.put(`/update-Subject/${id}`, SubjectData);
  return data;
};

// ✅ Delete Subject
export const deleteSubject = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/delete-Subject/${id}`);
  return data;
};
