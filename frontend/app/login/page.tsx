'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/services/api';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      
      // Log để xem cấu trúc thực tế của Backend trả về
      console.log("Dữ liệu nhận được từ Backend:", res.data);

      // Dùng Optional Chaining để tránh lỗi nếu cấu trúc trả về khác dự đoán
      const user = res.data?.user;
      const userRole = user?.role;
      const userId = user?.id;

      if (!userRole) {
        throw new Error("Không tìm thấy thông tin quyền truy cập.");
      }
      
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('user_role', userRole); 
      localStorage.setItem('user_id', userId?.toString() || '');
      
      console.log("Đăng nhập thành công! Quyền tài khoản:", userRole);

      if (userRole === 'ADMIN') {
        router.push('/dashboard');
      } else if (userRole === 'DOCTOR') {
        router.push('/patients'); 
      } else if (userRole === 'STAFF') {
        router.push('/appointments'); 
      } else {
        router.push('/'); 
      }
      
    } catch (err: any) {
      // Sửa lỗi: Không gọi res.data ở đây vì khi lỗi, res chưa tồn tại
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại';
      console.error("Lỗi chi tiết:", err.response?.data || err.message);
      setError(errorMessage);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Đăng nhập</h2>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Email" 
            type="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
          <input 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            type="password" 
            placeholder="Mật khẩu" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}