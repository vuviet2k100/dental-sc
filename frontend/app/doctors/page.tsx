'use client';
import { useState, useEffect } from 'react';
import { Stethoscope, Eye, RefreshCw, Loader2, UserX } from 'lucide-react';
import { userService } from '@/services/api';
import DetailedView from '@/components/DetailedView';

export default function DoctorManagementPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isResetting, setIsResetting] = useState<number | null>(null);

  useEffect(() => {
    userService.getAll('DOCTOR')
      .then(res => setDoctors(res.data))
      .catch(err => console.error("Lỗi tải bác sĩ:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleResetPassword = async (id: number, name: string) => {
    if (!confirm(`Đặt lại mật khẩu cho BS. ${name} về mặc định (123456)?`)) return;
    
    setIsResetting(id);
    try {
      await userService.resetPassword(id);
      alert("Đã đặt lại mật khẩu thành công!");
    } catch (err) {
      alert("Có lỗi xảy ra khi đặt lại mật khẩu!");
    } finally {
      setIsResetting(null);
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-800">🩺 Quản lý Bác sĩ</h1>

      {loading ? (
        <div className="flex justify-center p-12 text-slate-400">
           <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          {doctors.length > 0 ? (
            doctors.map(d => (
              <div key={d.id} className="p-4 border-b last:border-b-0 flex justify-between items-center hover:bg-slate-50 transition">
                <div className="flex items-center gap-3 font-bold text-slate-700">
                  <Stethoscope size={18} className="text-blue-500"/> {d.name}
                </div>
                <div className="flex gap-2">
                  <button 
                    disabled={isResetting === d.id}
                    onClick={() => handleResetPassword(d.id, d.name)} 
                    className="text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-amber-100 disabled:opacity-50"
                  >
                    {isResetting === d.id ? <Loader2 size={14} className="animate-spin"/> : <RefreshCw size={14}/>}
                    Reset Pass
                  </button>
                  <button 
                    onClick={() => setSelectedDoctor(d)} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition"
                  >
                    <Eye size={16}/> Xem bệnh án
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-slate-400 flex flex-col items-center">
              <UserX size={40} className="mb-2 opacity-50" />
              Chưa có danh sách bác sĩ nào.
            </div>
          )}
        </div>
      )}

      {selectedDoctor && (
        <div className="relative">
          <button 
            onClick={() => setSelectedDoctor(null)}
            className="text-sm text-slate-500 mb-2 underline hover:text-slate-800"
          >
            Đóng xem chi tiết
          </button>
          <DetailedView type="DOCTOR" user={selectedDoctor} />
        </div>
      )}
    </div>
  );
}