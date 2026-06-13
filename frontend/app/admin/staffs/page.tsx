'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCog, RefreshCw, Eye, Users } from 'lucide-react';
import { api } from '@/app/lib/axios'; // Import instance api đã cấu hình
import DetailedView from '@/components/DetailedView';

export default function AdminStaffsPage() {
  const [staffs, setStaffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const router = useRouter();

  const fetchStaffs = async () => {
    try {
      // Instance 'api' đã tự động đính kèm token qua interceptor
      const res = await api.get('/users?role=STAFF');
      setStaffs(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) router.push('/login');
      console.error("Lỗi khi tải danh sách nhân viên:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchStaffs(); 
  }, []);

  const handleResetPassword = async (id: number) => {
    if (!confirm("Bạn có chắc muốn đặt lại mật khẩu nhân viên này về 123456?")) return;
    try {
      await api.patch(`/users/${id}/reset-password`);
      alert("Reset mật khẩu thành công!");
    } catch (err) {
      console.error("Lỗi reset mật khẩu:", err);
      alert("Lỗi khi reset mật khẩu.");
    }
  };

  if (loading) return <SkeletonLoader />;

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">👥 Quản lý Nhân viên</h1>
          <p className="text-slate-500 text-sm">Danh sách nhân viên điều phối hệ thống</p>
        </div>
      </div>
      
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        {staffs.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Không có nhân viên nào trong hệ thống.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {staffs.map((staff) => (
              <div key={staff.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><UserCog size={20}/></div>
                  <div>
                    <p className="font-semibold text-slate-900">{staff.name}</p>
                    <p className="text-xs text-slate-500">Email: {staff.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleResetPassword(staff.id)} 
                    className="text-xs flex items-center gap-1 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <RefreshCw size={12}/> Reset PW
                  </button>
                  <button 
                    onClick={() => setSelectedStaff(staff)} 
                    className={`text-sm flex items-center gap-1 px-4 py-1.5 rounded-lg transition-all ${selectedStaff?.id === staff.id ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                  >
                    <Eye size={14}/> {selectedStaff?.id === staff.id ? 'Đang xem' : 'Xem lịch hẹn'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedStaff && (
        <div className="animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <Users size={20} />
            <h2 className="text-lg font-bold">Lịch hẹn do {selectedStaff.name} tạo</h2>
          </div>
          <DetailedView type="STAFF" user={selectedStaff} />
        </div>
      )}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="p-10 max-w-5xl mx-auto animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
      {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-slate-100 rounded-xl"></div>)}
    </div>
  );
}