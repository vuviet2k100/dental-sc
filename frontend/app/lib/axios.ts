import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // THÊM DÒNG NÀY VÀO
});

api.interceptors.request.use((config) => {
  // Chỉ lấy token nếu đang ở trên trình duyệt
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }else {
      console.warn("Không tìm thấy token trong localStorage!");
    }
  }
  return config;
});