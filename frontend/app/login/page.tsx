'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/api'; // 1. Import authService
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // 2. Thêm state loading

  const { loginSuccess } = useAuth(); // lấy từ hook
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 3. Sử dụng authService thay cho api.post trực tiếp
      const res = await authService.login({ email, password });  
      const { user, access_token } = res.data;
      localStorage.setItem('access_token', access_token);
      loginSuccess(user); // Cập nhật thông tin người dùng vào context
      router.replace('/appointments'); // Điều hướng sau khi đăng nhập thành công
      if (!user?.role) {
        throw new Error("Không tìm thấy thông tin quyền truy cập.");
      }
      
      // Lưu trữ thông tin (Sau này bạn có thể chuyển logic này vào AuthContext)
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user_role', user.role); 
      localStorage.setItem('user_id', user.id?.toString() || '');
      
      // Điều hướng dựa trên role
      const routes: Record<string, string> = {
        'ADMIN': '/dashboard',
        'DOCTOR': '/patients',
        'STAFF': '/appointments'
      };

      router.push(routes[user.role] || '/');
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại';
      setError(errorMessage);
    } finally {
      setLoading(false);
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
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
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