import axiosInstance from '../api_Intersecptor/admin_axiosInstance';

export type DailyCurrentAffairs = {
  _id?: string;

  Date: string;              // ISO string
  Month?: string;            // backend auto-generate

  Title: string;

  PdfUrl?: string;

  VideoUrl?: string;

  Status: 'Active' | 'Inactive';
  CreatedBy?: string;
};


export interface IMonthlyCurrentAffairs {
  _id?: string;

  Month: string;

  PdfTitle?: string;
  PdfUrl?: string;

  Language: 'Hindi' | 'English';

  TeacherId: string;
  CreatedBy: string;

  Status: 'Active' | 'Inactive';
}


// ✅ Create Daily Current Affairs
export const createDailyCurrentAffairs = async (
  data: DailyCurrentAffairs
): Promise<any> => {
  const res = await axiosInstance.post(
    '/create-DailyCurrentAffairs',
    data
  );
  return res.data;
};

// ✅ Get All Daily Current Affairs
export const getAllDailyCurrentAffairs = async (): Promise<any> => {
  const res = await axiosInstance.get(
    '/get-AllDailyCurrentAffairs'
  );
  return res.data;
};

// ✅ Get Daily Current Affairs By ID
export const getDailyCurrentAffairsById = async (
  id: string
): Promise<any> => {
  const res = await axiosInstance.get(
    `/get-DailyCurrentAffairsById/${id}`
  );
  return res.data;
};

// ✅ Update Daily Current Affairs
export const updateDailyCurrentAffairs = async (
  id: string,
  data: Partial<DailyCurrentAffairs>
): Promise<any> => {
  const res = await axiosInstance.put(
    `/update-DailyCurrentAffairs/${id}`,
    data
  );
  return res.data;
};

// ✅ Delete Daily Current Affairs
export const deleteDailyCurrentAffairs = async (
  id: string
): Promise<any> => {
  const res = await axiosInstance.delete(
    `/delete-DailyCurrentAffairs/${id}`
  );
  return res.data;
};




// ✅ Create Monthly Current Affairs
export const createMonthlyCurrentAffairs = async (
  data: Partial<IMonthlyCurrentAffairs>
): Promise<any> => {
  const res = await axiosInstance.post(
    "/create-MonthlyCurrentAffairs",
    data
  );
  return res.data;
};

// ✅ Get All Monthly Current Affairs
export const getAllMonthlyCurrentAffairs = async (): Promise<any> => {
  const res = await axiosInstance.get(
    "/get-AllMonthlyCurrentAffairs"
  );
  return res.data;
};

// ✅ Get Monthly Current Affairs By ID
export const getMonthlyCurrentAffairsById = async (
  id: string
): Promise<any> => {
  const res = await axiosInstance.get(
    `/get-MonthlyCurrentAffairsById/${id}`
  );
  return res.data;
};

// ✅ Update Monthly Current Affairs
export const updateMonthlyCurrentAffairs = async (
  id: string,
  data: Partial<IMonthlyCurrentAffairs>
): Promise<any> => {
  const res = await axiosInstance.put(
    `/update-MonthlyCurrentAffairs/${id}`,
    data
  );
  return res.data;
};

// ✅ Delete Monthly Current Affairs
export const deleteMonthlyCurrentAffairs = async (
  id: string
): Promise<any> => {
  const res = await axiosInstance.delete(
    `/delete-MonthlyCurrentAffairs/${id}`
  );
  return res.data;
};
