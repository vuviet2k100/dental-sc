'use client';
import { api } from '@/app/lib/axios';
import { useEffect, useState } from 'react';

export default function UserList({ role, onSelect }: { role: 'DOCTOR' | 'STAFF', onSelect: (u: any) => void }) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/users?role=${role}`).then(res => setUsers(res.data));
  }, [role]);

  const handleReset = async (id: number) => {
    if (confirm("Đặt lại mật khẩu về 123456?")) {
      await api.patch(`/users/${id}/reset-password`);
      alert("Đã reset mật khẩu!");
    }
  };

  return (
    <table className="w-full text-sm bg-white rounded-xl shadow-sm border">
      {users.map(user => (
        <tr key={user.id} className="border-b hover:bg-slate-50">
          <td className="p-4 font-bold">{user.name}</td>
          <td className="p-4">{user.email}</td>
          <td className="p-4 space-x-2">
            <button onClick={() => handleReset(user.id)} className="text-red-500">Reset PW</button>
            <button onClick={() => onSelect(user)} className="text-blue-500">Xem chi tiết</button>
          </td>
        </tr>
      ))}
    </table>
  );
}