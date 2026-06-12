import axios from 'axios';

export const api = axios.create({ 
  baseURL: 'https://dental-sc.onrender.com', 
  withCredentials: true, // Cho phép gửi cookie (nếu backend set cookie)
});

// Interceptor cho Request: Luôn găm token mới nhất từ localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("CHI TIẾT LỖI TỪ BACKEND:", error.response?.data);
    // Chỉ điều hướng nếu lỗi 401 và không phải đang ở trang login
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Service quản lý Bác sĩ & Bệnh án (Master-Detail)
export const doctorService = {
  getAll: () => api.get('/users?role=DOCTOR'),
  getMedicalRecords: (doctorId?: number) => api.get('/medical-record', { params: { doctorId } }),
  resetPassword: (id: number) => api.patch(`/users/${id}/reset-password`),
  createMedicalRecord: (data: any) => api.post('/medical-record', data),
};

// Service quản lý Nhân viên & Lịch hẹn (Master-Detail)
export const staffService = {
  getAll: () => api.get('/users?role=STAFF'),
  getAllAppointments: (staffId?: number) => api.get('/appointments', { params: { staffId } }),
  getAllPatients: () => api.get('/patients'),
  resetPassword: (id: number) => api.patch(`/users/${id}/reset-password`),
};

// Service quản lý Người dùng chung
export const userService = {
  getAll: (role?: string) => api.get('/users', { params: { role } }),
  create: (data: any) => api.post('/users', data),
  delete: (id: number) => api.delete(`/users/${id}`),
  resetPassword: (id: number) => api.patch(`/users/${id}/reset-password`),
};

// Service xác thực
export const authService = {
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data: any) => api.patch('/auth/change-password', data),
};

export const patientService = {
  delete: (id: number) => api.delete(`/patients/${id}`),
};