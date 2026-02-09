import axiosInstance from '../api_Intersecptor/user_axiosInstance';

interface SubmitTestPayload {
  AttemptId: string;
  TestPaperId: string;
  answers: Record<string, string>; // questionId : optionId
  totalTimeSpent: number;
}

export const submitStudentTestApi = async (payload: SubmitTestPayload) => {
  const response = await axiosInstance.post('/student/SubmitTest', payload);
  return response.data;
};

export const startOrResumeTestApi = async (TestPaperId: string) => {
  const res = await axiosInstance.post('/student/StartOrResumeTest', {
    TestPaperId,
  });
  return res.data;
};

export const GetTestResult = async (AttemptId: string) => {
  const res = await axiosInstance.get(
    `/student/TestResult/${AttemptId}`
  );
  return res.data;
};


export const GetTestProgress = async (TestSeriesId: string) => {
  const res = await axiosInstance.get(
    `/student/Test-Progress/${TestSeriesId}`
  );
  return res.data;
};