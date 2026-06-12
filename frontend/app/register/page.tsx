'use client';
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DOCTOR' // Mặc định chọn DOCTOR
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Kiểm tra Token của Admin
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('Bạn chưa đăng nhập hoặc không có quyền Admin!');
      router.push('/login');
      return;
    }

    // 2. Chọn route dựa trên role đã chọn
    const endpoint = formData.role === 'DOCTOR' ? '/auth/register/doctor' : '/auth/register/staff';
    const url = `http://localhost:3000${endpoint}`;

    setLoading(true);
    try {
      // 3. Gửi kèm Token để xác thực quyền Admin
      await axios.post(url, formData, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      alert('Đăng ký tài khoản thành công!');
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra, hãy kiểm tra lại thông tin.';
      alert('Đăng ký thất bại: ' + errorMessage);
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