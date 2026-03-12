import axiosInstance from '../api_Intersecptor/admin_axiosInstance';

// ✅ Type definition for TestPaper
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

    IsPaid: boolean;

    ScheduledDate?: Date; // optional

    TeacherId: string;
    CreatedBy: string;
    Status: 'Active' | 'Inactive';
    createdDate: Date;
    updatedDate: Date;
};


export interface SaveTestPaperQuestionsPayload {
  TestPaperId: string;
  SelectedQuestions: string[];
}


// ✅ Get all TestPaper
export const getAllTestPaper = async (): Promise<TestPaper[]> => {
    const { data } = await axiosInstance.get('/get-AllTestPapers');
    return data;
};

// ✅ Get single TestPaper by ID
export const getTestPaperById = async (id: string): Promise<TestPaper> => {
    const { data } = await axiosInstance.get(`/get-TestPaperById/${id}`);
    return data;
};

// ✅ Create new TestPaper
export const createTestPaper = async (TestPaperData: TestPaper): Promise<TestPaper> => {

    const { data } = await axiosInstance.post('/create-TestPaper', TestPaperData);
    return data;
};

// ✅ Update TestPaper
export const updateTestPaper = async (id: string, TestPaperData: Partial<TestPaper>): Promise<TestPaper> => {
    const { data } = await axiosInstance.put(`/update-TestPaper/${id}`, TestPaperData);
    return data;
};

// ✅ Delete TestPaper
export const deleteTestPaper = async (id: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`/delete-TestPaper/${id}`);
    return data;
};


// ✅ Create new TestPaper
// ✅ Save selected questions to test paper
export const saveQuestionToTestPaper = async (
  payload: SaveTestPaperQuestionsPayload
): Promise<any> => {
    console.log(payload)
  const { data } = await axiosInstance.post(
    '/TestPaper-save-questions',
    payload
  );
  return data;
};


export const removeAllSelectedQuestionsFromTestPaper = async (testpaperid: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`/TestPaper-delete-questions/${testpaperid}`);
    return data;
};




