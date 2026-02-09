import axiosInstance from '../api_Intersecptor/user_axiosInstance';

export interface Chapter {
  _id: string;
  Title: string;
  Description?: string;
  Image?: string;
  Status: 'Active' | 'Inactive';
}

export const getChaptersBySubjectId = async (
  subjectId: string
): Promise<Chapter[]> => {
  const { data } = await axiosInstance.get(
    `/student/get-AllChaptersBySubjectId/${subjectId}`
  );

  return data;
};