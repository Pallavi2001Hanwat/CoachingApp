import axios from 'axios';
import { getToken, removeToken } from '../../services/storageService';

// const API_BASE = 'http://192.168.31.169:4000/'; // <-- change to your base URL
const API_BASE = 'http://192.168.1.14:4000/';

const useraxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});
 
// Attach token to requests
useraxiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optional: handle 401 globally
useraxiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // token invalid/expired. Clear stored token (AuthContext will handle redirect).
      await removeToken();
      // Optionally you can emit an event or handle via context
    }
    return Promise.reject(error);
  }
);

export default useraxiosInstance;