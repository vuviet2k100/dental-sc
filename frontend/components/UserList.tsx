'use client';
import { userService } from '@/services/api';
import { useEffect, useState } from 'react';

export default function UserList({ role, onSelect }: { role: 'DOCTOR' | 'STAFF', onSelect: (u: any) => void }) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // Đồng bộ: Sử dụng userService thay vì api trực tiếp
    userService.getAll(role)
      .then(res => setUsers(res.data))
      .catch(err => console.error("Lỗi tải danh sách:", err));
  }, [role]);

  const handleReset = async (id: number) => {
    if (confirm("Đặt lại mật khẩu về 123456?")) {
      try {
        // Đồng bộ: Sử dụng userService để reset password
        await userService.resetPassword(id);
        alert("Đã reset mật khẩu!");
      } catch (err) {
        alert("Có lỗi xảy ra khi reset mật khẩu.");
      }
    }
  };

  return (
    <table className="w-full text-sm bg-white rounded-xl shadow-sm border">
      {/* Cấu trúc Table chuẩn cần thẻ tbody */}
      <tbody className="divide-y">
        {users.map(user => (
          <tr key={user.id} className="hover:bg-slate-50">
            <td className="p-4 font-bold">{user.name}</td>
            <td className="p-4 text-gray-600">{user.email}</td>
            <td className="p-4 space-x-4">
              <button 
                onClick={() => handleReset(user.id)} 
                className="text-red-500 font-bold hover:underline"
              >
                Reset PW
              </button>
              <button 
                onClick={() => onSelect(user)} 
                className="text-blue-500 font-bold hover:underline"
              >
                Xem chi tiết
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}