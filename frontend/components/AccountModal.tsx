'use client';
import { useState, useEffect } from 'react';
import { authService } from '@/services/api';

export default function AccountModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (isOpen) {
      authService.getProfile().then(res => setUser(res.data)).catch(() => {});
    }
  }, [isOpen]);

  const handleUpdate = async () => {
    if (!passwords.oldPassword || !passwords.newPassword) return alert("Vui lòng điền đủ thông tin!");
    if (passwords.newPassword !== passwords.confirmPassword) return alert("Mật khẩu mới không khớp!");
    
    try {
      await authService.changePassword({ 
        oldPassword: passwords.oldPassword, 
        newPassword: passwords.newPassword 
      });
      alert("Đổi mật khẩu thành công!");
      onClose();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.message || "Lỗi đổi mật khẩu!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-2xl w-96 shadow-xl text-slate-800">
        <h2 className="text-xl font-bold mb-4">Thông tin tài khoản</h2>
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
            <button onClick={onClose} className="flex-1 bg-gray-200 p-2 rounded">Đóng</button>
            <button onClick={handleUpdate} className="flex-1 bg-blue-600 text-white p-2 rounded">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  );
}