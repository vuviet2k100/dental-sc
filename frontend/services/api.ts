import axios from 'axios';

// Lấy URL từ biến môi trường, nếu không có sẽ mặc định về URL Backend của bạn
// Lưu ý: Không để dấu / ở cuối URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dental-sc.onrender.com';

export const api = axios.create({ 
  baseURL: API_URL, 
  withCredentials: true, // Cho phép gửi cookie/session tới backend
});

// Interceptor cho Request: Găm token từ localStorage vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor cho Response: Xử lý lỗi 401 (Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("CHI TIẾT LỖI TỪ BACKEND:", error.response?.data);
    
    // Nếu token hết hạn hoặc không hợp lệ, xóa dữ liệu và về trang login
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- CÁC SERVICE QUẢN LÝ ---

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