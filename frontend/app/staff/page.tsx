'use client';
import { useState, useEffect } from 'react';
import { User, Eye, RefreshCw } from 'lucide-react';
import { userService } from '@/services/api';
import DetailedView from '@/components/DetailedView';

export default function AdminStaffsPage() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);

  useEffect(() => {
    userService.getAll('STAFF')
      .then(res => setStaffs(res.data))
      .catch(err => console.error("Lỗi tải nhân viên:", err));
  }, []);

  const handleResetPassword = async (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn đặt lại mật khẩu cho NV. ${name}?`)) {
      try {
        await userService.resetPassword(id);
        alert("Reset mật khẩu thành công!");
      } catch (err) {
        alert("Có lỗi xảy ra khi reset mật khẩu!");
      }
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-black text-slate-800">⚙️ Quản lý Nhân viên</h1>
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {staffs.map(s => (
          <div key={s.id} className="p-4 flex justify-between items-center border-b hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3 font-semibold text-slate-700">
              <User size={18} className="text-indigo-500"/> {s.name}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleResetPassword(s.id, s.name)}
                className="text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
              >
                <RefreshCw size={14}/> Reset Pass
              </button>
              <button 
                onClick={() => setSelectedStaff(s)} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
              >
                <Eye size={16}/> Xem lịch hẹn
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedStaff && <DetailedView type="STAFF" user={selectedStaff} />}
    </div>
  );
}