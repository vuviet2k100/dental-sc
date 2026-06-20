import { api } from '@/app/lib/axios';

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