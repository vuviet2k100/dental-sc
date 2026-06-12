'use client';
import { useState, useEffect } from 'react';
import { Stethoscope, Eye, RefreshCw } from 'lucide-react';
import { userService } from '@/services/api';
import DetailedView from '@/components/DetailedView';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  useEffect(() => {
    userService.getAll('DOCTOR')
      .then(res => setDoctors(res.data))
      .catch(err => console.error("Lỗi tải bác sĩ:", err));
  }, []);

  const handleResetPassword = async (id: number, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn đặt lại mật khẩu cho BS. ${name}?`)) {
      try {
        await userService.resetPassword(id);
        alert("Reset mật khẩu thành công (Mật khẩu mặc định: 123)");
      } catch (err) {
        alert("Có lỗi xảy ra khi reset mật khẩu!");
      }
    }
  };

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-black text-slate-800">🩺 Quản lý Bác sĩ</h1>
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {doctors.map(d => (
          <div key={d.id} className="p-4 border-b flex justify-between items-center hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3 font-bold text-slate-700">
              <Stethoscope size={18} className="text-blue-500"/> {d.name}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleResetPassword(d.id, d.name)}
                className="text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
              >
                <RefreshCw size={14}/> Reset Pass
              </button>
              <button 
                onClick={() => setSelectedDoctor(d)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
              >
                <Eye size={16}/> Xem bệnh án
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedDoctor && <DetailedView type="DOCTOR" user={selectedDoctor} />}
    </div>
  );
}