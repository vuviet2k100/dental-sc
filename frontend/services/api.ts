import axios from 'axios';

// Gán cứng URL Backend để tránh lỗi process.env trên Vercel
const API_URL = 'https://dental-sc.onrender.com/api'; 

export const api = axios.create({ 
  baseURL: API_URL, 
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- CÁC SERVICE (Phải có từ khóa export) ---

export const doctorService = {
  getAll: () => api.get('/users?role=DOCTOR'),
  getMedicalRecords: (doctorId?: number) => api.get('/medical-record', { params: { doctorId } }),
  resetPassword: (id: number) => api.patch(`/users/${id}/reset-password`),
  createMedicalRecord: (data: any) => api.post('/medical-record', data),
};

export const staffService = {
  getAll: () => api.get('/users?role=STAFF'),
  getAllAppointments: (staffId?: number) => api.get('/appointments', { params: { staffId } }),
  getAllPatients: () => api.get('/patients'),
  resetPassword: (id: number) => api.patch(`/users/${id}/reset-password`),
};

// Đảm bảo userService này ĐÃ CÓ từ khóa export ở đầu dòng
export const userService = {
  getAll: (role?: string) => api.get('/users', { params: { role } }),
  create: (data: any) => api.post('/users', data),
  delete: (id: number) => api.delete(`/users/${id}`),
  resetPassword: (id: number) => api.patch(`/users/${id}/reset-password`),
};

export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data: any) => api.patch('/auth/change-password', data),
};

export const patientService = {
  delete: (id: number) => api.delete(`/patients/${id}`),
};