'use client';
import { useState } from 'react';
import { api } from '@/app/lib/axios'; // Import instance api đã cấu hình
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DOCTOR' 
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Endpoint sẽ được ghép với baseURL trong api instance
    const endpoint = formData.role === 'DOCTOR' ? '/auth/register/doctor' : '/auth/register/staff';

    setLoading(true);
    try {
      // 2. Không cần headers thủ công, 'api' đã tự xử lý Authorization header
      await api.post(endpoint, formData);
      
      alert('Đăng ký tài khoản thành công!');
      router.push('/dashboard');
    } catch (error: any) {
      // 3. Xử lý lỗi (ví dụ: 401 khi hết hạn token Admin)
      if (error.response?.status === 401) {
        alert('Phiên làm việc hết hạn, vui lòng đăng nhập lại.');
        router.push('/login');
      } else {
        const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra, hãy kiểm tra lại thông tin.';
        alert('Đăng ký thất bại: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Tạo tài khoản mới</h2>
        
        <div className="space-y-4">
          <input 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Họ và tên" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
          <input 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Email" 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          <input 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            type="password" 
            placeholder="Mật khẩu" 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />

          <div className="p-3 border border-gray-300 rounded-lg">
            <label className="block text-sm text-gray-600 mb-2">Vai trò:</label>
            <select 
              className="w-full outline-none bg-transparent font-medium"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="DOCTOR">Bác sĩ (Doctor)</option>
              <option value="STAFF">Nhân viên (Staff)</option>
            </select>
          </div>

          <button 
            onClick={handleRegister} 
            disabled={loading}
            className={`w-full p-3 rounded-lg font-semibold transition ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
          >
            {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
          </button>
        </div>
      </div>
    </div>
  );
}