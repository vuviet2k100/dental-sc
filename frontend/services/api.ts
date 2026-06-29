import { api } from '@/app/lib/axios';

// --- CÁC SERVICE ---

export const authService = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (data: any) => api.patch('/auth/change-password', data),
  register: (data: any, role: string) => {
    const endpoint = role === 'DOCTOR' ? '/auth/register/doctor' : '/auth/register/staff';
    return api.post(endpoint, data);
  }
};

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

export const patientService = {
  getAll: () => api.get('/patients'),
  getById: (id: string) => api.get(`/patients/${id}`), 
  create: (data: any) => api.post('/patients', data),
  update: (id: number, data: any) => api.patch(`/patients/${id}`, data),
  delete: (id: number) => api.delete(`/patients/${id}`),
};

export const medicalRecordService = {
  // Các phương thức bạn yêu cầu
  getByPatient: (patientId: string) => api.get('/medical-record', { params: { patientId } }),
  getById: (id: string) => api.get(`/medical-record/${id}`),
  create: (data: any) => api.post('/medical-record', data),
  upload: (recordId: number | string, formData: FormData) => 
    api.post(`/medical-record/upload/${recordId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Các phương thức bổ trợ cần thiết cho RecordDetail.tsx
  update: (id: string, data: any) => api.patch(`/medical-record/${id}`, data),
  delete: (id: string) => api.delete(`/medical-record/${id}`),
  deleteImage: (imageId: number) => api.delete(`/medical-record/image/${imageId}`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard'),
};