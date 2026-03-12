import axiosInstance from '../api_Intersecptor/admin_axiosInstance';



export type PreviousYearPaper = {
  _id?: string;

  PYPCategoryId: string;

  PaperTitle: string;
  PaperCode: string;

  Year: number;
  Stage: string;
  Shift: string;
  Language: string;

  TotalQuestions: number;
  TotalMarks: number;
  TimeDuration: number;

  PaperFileUrl: string;

  Status: 'Active' | 'Inactive';
  CreatedBy?: string;
};


// ✅ Create Previous Year Paper
export const createPreviousYearPaper = async (
  paperData: PreviousYearPaper
): Promise<any> => {
  const { data } = await axiosInstance.post(
    '/create-PreviousYearPaper',
    paperData
  );
  return data;
};

// ✅ Get All Previous Year Papers
export const getAllPreviousYearPapers = async (): Promise<any> => {
  const { data } = await axiosInstance.get(
    '/get-AllPreviousYearPapers'
  );
  return data;
};

// ✅ Get Previous Year Paper By ID
export const getPreviousYearPaperById = async (
  id: string
): Promise<any> => {
  const { data } = await axiosInstance.get(
    `/get-PreviousYearPaperById/${id}`
  );
  return data;
};

// ✅ Update Previous Year Paper
export const updatePreviousYearPaper = async (
  id: string,
  paperData: Partial<PreviousYearPaper>
): Promise<any> => {
  const { data } = await axiosInstance.put(
    `/update-PreviousYearPaper/${id}`,
    paperData
  );
  return data;
};

// ✅ Delete Previous Year Paper
export const deletePreviousYearPaper = async (
  id: string
): Promise<any> => {
  const { data } = await axiosInstance.delete(
    `/delete-PreviousYearPaper/${id}`
  );
  return data;
};
