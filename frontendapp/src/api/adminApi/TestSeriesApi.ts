import axiosInstance from '../api_Intersecptor/admin_axiosInstance';

// ✅ Type definition for TestSerie
export type TestSeries = {
  _id?: string;
   Title: string;
  Description: string;
  Image: string;
  IsPaid: boolean;
  Price?: number;
  DiscountPrice?: number;
  ValidityDays?: number;
  TotalTests: number; // Can be auto calculated later
  TeacherId: string;
  CreatedBy: string;
  Status: 'Active' | 'Inactive';
  createdDate: Date;
  updatedDate: Date;
};


// ✅ Get all TestSeries
export const getAllTestSeries = async (): Promise<TestSeries[]> => {
  const { data } = await axiosInstance.get('/get-AllTestSeries');
  return data;
};

// ✅ Get single TestSerie by ID
export const getTestSerieById = async (id: string): Promise<TestSeries> => {
  const { data } = await axiosInstance.get(`/get-TestSeriesById/${id}`);
  return data;
};

// ✅ Create new TestSerie
export const createTestSeries = async (TestSerieData: TestSeries): Promise<TestSeries> => {

  const { data } = await axiosInstance.post('/create-TestSeries', TestSerieData);
  return data;
};

// ✅ Update TestSerie
export const updateTestSeries = async (id: string, TestSerieData: Partial<TestSeries>): Promise<TestSeries> => {
  const { data } = await axiosInstance.put(`/update-TestSeries/${id}`, TestSerieData);
  return data;
};

// ✅ Delete TestSerie
export const deleteTestSeries = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/delete-TestSeries/${id}`);
  return data;
};




