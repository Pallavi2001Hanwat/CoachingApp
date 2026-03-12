import axiosInstance from '../api_Intersecptor/user_axiosInstance';

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
export interface QuestionOption {
  _id?: string;            // optional, because while creating option we don't have id
  OptionText: string;
  OptionImage?: string;    // Base64 or Cloudinary URL
  IsCorrect: boolean;      // supports multiple correct answers
  Status?: 'Active' | 'Inactive'; // optional for creation
}

export const getQuestionByTestPaperId = async (testpaperid: string): Promise<QuestionFormData> => {
    const { data } = await axiosInstance.get(`/student/get-QuestionByTestPaperId/${testpaperid}`);
    return data;
};