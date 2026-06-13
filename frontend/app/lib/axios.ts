import axios from 'axios';

// Đây là file module vì có lệnh export const api
export const api = axios.create({
  baseURL: 'https://dental-sc.onrender.com/api',
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});