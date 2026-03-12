import axiosInstance from '../api_Intersecptor/user_axiosInstance';

export type TestPaper = {
    _id?: string;

    TestSeriesId: string;
    PaperTitle: string;
    Description?: string;

    DurationInMinutes: number; // ex: 60
    TotalMarks: number;
    PassingMarks: number;
    TotalQuestions: number;

    AttemptLimit: number | 'Unlimited'; // ex: 1 or "Unlimited"
    PaperLevel: 'Easy' | 'Medium' | 'Hard';

    IsFree: boolean; // free paper inside paid series

    ScheduledDate?: Date; // optional

    TeacherId: string;
    CreatedBy: string;
    Status: 'Active' | 'Inactive';
    createdDate: Date;
    updatedDate: Date;
};


export const getAll_TestPaperbyTestseiesId = async (
  testSeriesId: string,
  isPaid: boolean
): Promise<TestPaper[]> => {
 

  const { data } = await axiosInstance.get(
    `/student/test-papers/${testSeriesId}`,
    {
      params: { isPaid }, // ✅ query param
    }
  );

  return data; // ✅ backend response se array
};


