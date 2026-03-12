import api from '../Api_Intersecptor/AxiosAdmin';
import Authapi from '../Api_Intersecptor/AuthAxiosAdmin';


import Cookies from 'js-cookie'; 




export const loginUseras_admin = async (credentials) => {
  try {
    console.log('credentials', credentials);
    const response = await Authapi.post('/LoginUserFromWeb', credentials, {
      withCredentials: true 
    });
    return response;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

export const verifyPassword = async ( password) => {
  try {
    
    const response = await api.post('VerifyPassword', password)
    return response;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const sendResetLink = async (credentials) => {
  try {
    
    const response = await api.post('/send-reset-link', credentials, {
      withCredentials: true 
    });
    return response;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};


export const resetpassword = async (credentials) => {
  try {
    
    const response = await api.post('/resetPassword', credentials, {
      withCredentials: true 
    });
    return response;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};
export const verify_Otp = async (Otp) => {
  try {
    
    const response = await Authapi.post('/VerifyOtp', Otp, {
      withCredentials: true 
    });
    return response;
  } catch (error) {
    console.error('Error logging in verification:', error);
    throw error;
  }
};

export const resend_Otp = async (Otp) => {
  try {
    
    const response = await api.post('/resend_Otp', Otp, {
      withCredentials: true 
    });
    return response;
  } catch (error) {
    console.error('Error logging in verification:', error);
    throw error;
  }
};


export const addUser = async (userData) => {
  try {
    const response = await api.post('/addUser', userData);
    return response;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const getAllUsers  = async () => {
  try {
    
    const response = await api.get('/get-AllUser');
    return response.data;
  } catch (error) {
    console.error('Error add Category:', error);
    throw error;
  }
};

export const deleteUser = async (UserId) => {
  try {
    
    const response = await api.delete(`/delete-User/${UserId}`);
    return response;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const getUserByid = async (id) => {
  try {

    const response = await api.get(`/get-UserById/${id}`)
    return response.data
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    throw error;
  }
};

export const updateUser = async (id, UserData) => {
  
  try {
    const response = await api.put(`/update-User/${id}`, UserData); 
    return response;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};



export const verifyexistingpassword = async ( password) => {
  try {
    
    const response = await api.post('VerifyExistingPassword', password)
    return response;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

export const changepassword = async ( password) => {
  try {
  
    const response = await api.put('ChangePassword', password)
    return response;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};