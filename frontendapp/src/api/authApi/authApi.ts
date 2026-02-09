
import axiosInstance from '../api_Intersecptor/user_axiosInstance';

/*Login User */
type LoginPayload = {
  Email?: string;
  Phone?: string;
};

type LoginResponse = {
  message: string;
  roles?: string[];
  user?: {
    id: string;
    email: string;
    phone: string;
    name: string;
    roles: string[];
  };
};

export const loginUser = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await axiosInstance.post('/LoginUser', payload);

  return data;
};


/*Signup User */
type SignupPayload = {
  FirstName: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  OtpCode?:string;
};

type SignupResponse = {
  message: string;
  user: {
    id: string;
    email: string;
    phone: string;
    name: string;
    roles: string[];
  };
};

export const signupUser = async (payload: SignupPayload): Promise<SignupResponse> => {
  const { data } = await axiosInstance.post('/SignUpUser', payload);

  return data;
};



/*VerifyOtp */
type VerifyOtpPayload = {
  Email?: string;
  Phone?: string;
  Otp: string;
};

type VerifyOtpResponse = {
  message: string;
  token?: string; // optional — in case backend sends token
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    roles: string[];
  };
};

export const verifyOtp = async (payload: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
  const { data } = await axiosInstance.post('/VerifyOtp', payload);

  return data;
};


/*VerifyPassword  */
type VerifyPasswordPayload = {
  Email?: string;
  Phone?: string;
  Password: string;
};

type VerifyPasswordResponse = {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    roles: string[];
  };
};

export const verifyPassword = async (payload: VerifyPasswordPayload): Promise<VerifyPasswordResponse> => {
  const { data } = await axiosInstance.post('/VerifyPassword', payload);

  return data;
};