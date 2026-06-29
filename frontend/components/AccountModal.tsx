'use client';
import { useState } from 'react';
import { authService } from '@/services/api';
import { useAuth } from '@/context/AuthContext'; // 1. Import Hook Auth

export default function AccountModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth(); // 2. Lấy user trực tiếp từ Context
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!passwords.oldPassword || !passwords.newPassword) return alert("Vui lòng điền đủ thông tin!");
    if (passwords.newPassword !== passwords.confirmPassword) return alert("Mật khẩu mới không khớp!");
    
    setLoading(true);
    try {
      await authService.changePassword({ 
        oldPassword: passwords.oldPassword, 
        newPassword: passwords.newPassword 
      });
      alert("Đổi mật khẩu thành công!");
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      onClose();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || "Lỗi đổi mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white p-6 rounded-2xl w-96 shadow-xl text-slate-800">
        <h2 className="text-xl font-bold mb-4">Thông tin tài khoản</h2>
        
        {/* Dùng luôn user từ Context */}
        {user && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg text-sm border">
            <p><strong>Tên:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        )}

        <div className="space-y-3">
          <input type="password" placeholder="Mật khẩu cũ" className="w-full border p-2 rounded" 
                 onChange={(e) => setPasswords({...passwords, oldPassword: e.target.value})} />
          <input type="password" placeholder="Mật khẩu mới" className="w-full border p-2 rounded" 
                 onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})} />
          <input type="password" placeholder="Nhập lại mật khẩu" className="w-full border p-2 rounded" 
                 onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})} />
          
          <div className="flex gap-2 mt-4">
            <button onClick={onClose} className="flex-1 bg-gray-200 p-2 rounded hover:bg-gray-300 transition">Đóng</button>
            <button 
              onClick={handleUpdate} 
              disabled={loading}
              className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}