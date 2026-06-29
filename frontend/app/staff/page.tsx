'use client';
import { useState, useEffect } from 'react';
import { User, Eye, RefreshCw, Loader2, UserX } from 'lucide-react';
import { userService } from '@/services/api';
import DetailedView from '@/components/DetailedView';

export default function StaffManagementPage() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isResetting, setIsResetting] = useState<number | null>(null);

  useEffect(() => {
    userService.getAll('STAFF')
      .then(res => setStaffs(res.data))
      .catch(err => console.error("Lỗi tải nhân viên:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleResetPassword = async (id: number, name: string) => {
    if (!confirm(`Đặt lại mật khẩu cho NV. ${name} về mặc định (123456)?`)) return;
    
    setIsResetting(id);
    try {
      await userService.resetPassword(id);
      alert("Đã đặt lại mật khẩu thành công!");
    } catch (err) {
      alert("Có lỗi xảy ra!");
    } finally {
      setIsResetting(null);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-black text-slate-800">⚙️ Quản lý Nhân viên</h1>

      {loading ? (
        <div className="flex justify-center p-12 text-slate-400">
           <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          {staffs.length > 0 ? (
            staffs.map(s => (
              <div key={s.id} className="p-4 flex justify-between items-center border-b last:border-b-0 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3 font-semibold text-slate-700">
                  <User size={18} className="text-indigo-500"/> {s.name}
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={isResetting === s.id}
                    onClick={() => handleResetPassword(s.id, s.name)} 
                    className="text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-amber-100 disabled:opacity-50"
                  >
                    {isResetting === s.id ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}
                    Reset Pass
                  </button>
                  <button 
                    onClick={() => setSelectedStaff(s)} 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition"
                  >
                    <Eye size={16}/> Xem lịch hẹn
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center">
              <UserX size={40} className="mb-2 opacity-50" />
              Chưa có danh sách nhân viên nào.
            </div>
          )}
        </div>
      )}

      {selectedStaff && (
        <div className="relative">
          <button 
            onClick={() => setSelectedStaff(null)}
            className="text-sm text-slate-500 mb-2 underline hover:text-slate-800"
          >
            Đóng xem chi tiết
          </button>
          <DetailedView type="STAFF" user={selectedStaff} />
        </div>
      )}
    </div>
  );
}