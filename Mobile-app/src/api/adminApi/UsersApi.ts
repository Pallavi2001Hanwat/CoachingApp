import axiosInstance from '../api_Intersecptor/admin_axiosInstance';

// ✅ Type definition for User
export type User = {
  _id?: string;
  FirstName: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  AlternatePhone?: string;
  Gender?: string;
  Password?: string;
  DateOfBirth?: Date | null;
  ProfileImage?: string;
  IsActive: boolean;
  IsAdmin?: boolean;
  IsTeacher?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

// ✅ Get all users
export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await axiosInstance.get('/get-AllUser');
  return data;
};

// ✅ Get single user by ID
export const getUserById = async (id: string): Promise<User> => {
  const { data } = await axiosInstance.get(`/get-UserById/${id}`);
  return data;
};

// ✅ Create new user
export const createUser = async (userData: User): Promise<User> => {

  const { data } = await axiosInstance.post('/addUser', userData);
  return data;
};

// ✅ Update user
export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  const { data } = await axiosInstance.put(`/update-User/${id}`, userData);
  return data;
};

// ✅ Delete user
export const deleteUser = async (id: string): Promise<{ message: string }> => {
  const { data } = await axiosInstance.delete(`/delete-User/${id}`);
  return data;
};
