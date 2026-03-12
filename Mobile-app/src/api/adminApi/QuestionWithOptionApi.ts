import axiosInstance from '../api_Intersecptor/admin_axiosInstance';

export interface QuestionOption {
  _id?: string;            // optional, because while creating option we don't have id
  OptionText: string;
  OptionImage?: string;    // Base64 or Cloudinary URL
  IsCorrect: boolean;      // supports multiple correct answers
  Status?: 'Active' | 'Inactive'; // optional for creation
}

// ✅ Type definition for QuestionOption
export interface QuestionFormData {
  _id?: string;
  QuestionText: string;
  QuestionImage?: string;

  QuestionType: 'MCQ' | 'TrueFalse' | 'Numeric' | 'FillInTheBlank' | 'MatchTheFollowing';
  DifficultyLevel: 'Easy' | 'Medium' | 'Hard';

  SubjectId?: string;
  TopicId?: string;
  ChapterId?: string;

  Marks: number;
  NegativeMarks?: number;
  TimeAllowedInSeconds: number;

  Explanation?: string;
  Tags?: string[];

  Status?: 'Active' | 'Inactive';

  Options: QuestionOption[]; // <-- multiple options here

    TestPaperId?: string;

}



// ✅ Get all QuestionOptions
export const getAllQuestionOptions = async (): Promise<QuestionFormData[]> => {
    const { data } = await axiosInstance.get('/get-AllQuestions');
    return data;
};

// ✅ Get single QuestionOption by ID
export const getQuestionOptionById = async (id: string): Promise<QuestionFormData> => {

    const { data } = await axiosInstance.get(`/get-QuestionById/${id}`);
    return data;
};

// ✅ Create new QuestionOption
export const createQuestionOption = async (QuestionWithOptionData: QuestionFormData): Promise<QuestionFormData> => {
    const { data } = await axiosInstance.post('/create-Question', QuestionWithOptionData);
    return data;
};

// ✅ Update QuestionOption
export const updateQuestionOption = async (id: string, QuestionWithOptionData: Partial<QuestionFormData>): Promise<QuestionFormData> => {
    const { data } = await axiosInstance.put(`/update-Question/${id}`, QuestionWithOptionData);
    return data;
};

// ✅ Delete QuestionOption
export const deleteQuestionOption = async (id: string): Promise<{ message: string }> => {
    const { data } = await axiosInstance.delete(`/delete-Question/${id}`);
    return data;
};


export const getAllQuestionsBySubject = async (
  SelectedIdsData: QuestionFormData
): Promise<QuestionFormData[]> => {

  const { data } = await axiosInstance.post(
    '/get-AllQuestionsBySubject',
    SelectedIdsData   // <-- correct body
  );

  return data;
};


// ✅ Get single QuestionOption by ID
export const getQuestionByTestPaperId = async (testpaperid: string): Promise<QuestionFormData> => {
    const { data } = await axiosInstance.get(`/get-QuestionByTestPaperId/${testpaperid}`);
    return data;
};

// ✅ Create new QuestionOption
export const createQuestionWithOption_and_addtoTestPaper = async (QuestionWithOptionData: QuestionFormData): Promise<QuestionFormData> => {
    const { data } = await axiosInstance.post('/createquestion-addin-testpaper', QuestionWithOptionData);
    return data;
};
