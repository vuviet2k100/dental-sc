import axios from 'axios';

// URL production của bạn
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dental-sc.onrender.com/api';

export const api = axios.create({ 
  baseURL: API_URL, 
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    // Xử lý sạch token (bỏ dấu ngoặc kép nếu có)
    const cleanToken = token.replace(/['"]+/g, '');
    config.headers.Authorization = `Bearer ${cleanToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Chỉ đá về login nếu thực sự không có quyền hoặc token hết hạn
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
    }
    return Promise.reject(error);
  }
);