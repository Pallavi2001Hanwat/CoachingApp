import axiosInstance from '../api_Intersecptor/user_axiosInstance';

export type PreviousYearPaperCategory = {
  _id?: string;
  Title: string;
  Image: string;
  Status: 'Active' | 'Inactive';
  CreatedBy: string;
};

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



export const getAllPYPCategories = async (): Promise<PreviousYearPaperCategory[]> => {
  const { data } = await axiosInstance.get('/student/get-AllPYPCategories');
  return data;
};

export const getAllPreviousYearPapersByCategoryId = async (PYPCategoryId: string): Promise<any> => {
  const { data } = await axiosInstance.get(
    `/student/get-AllPreviousYearPapers/${PYPCategoryId}`
  );
  return data;
};
