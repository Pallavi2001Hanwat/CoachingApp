// axiosConfig.js
import axios from 'axios';
import Cookies from 'js-cookie'; 

const API_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});


api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
