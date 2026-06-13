'use client';
import { useEffect, useState } from 'react';
import { api } from '@/app/lib/axios'; // Nhập instance api đã cấu hình sẵn

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Chỉ cần gọi endpoint, baseURL và Token đã được api instance xử lý tự động
        const res = await api.get('/dashboard'); 
        
        console.log("Data từ backend:", res.data);
        setStats(res.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-10 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-slate-100 rounded-xl h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black text-slate-800">Dashboard Thống kê</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        
        {/* Khối 1: Bệnh nhân */}
        <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl transition-all hover:shadow-md">
          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Tổng bệnh nhân</p>
          <h2 className="text-4xl font-black text-blue-900 mt-2">{stats?.patients ?? 0}</h2>
        </div>

        {/* Khối 2: Lịch hẹn */}
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-xl transition-all hover:shadow-md">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider">Lịch hẹn hôm nay</p>
          <h2 className="text-4xl font-black text-emerald-900 mt-2">{stats?.appointments ?? 0}</h2>
        </div>

        {/* Khối 3: Bác sĩ */}
        <div className="p-6 bg-amber-50 border border-amber-100 rounded-xl transition-all hover:shadow-md">
          <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider">Bác sĩ hoạt động</p>
          <h2 className="text-4xl font-black text-amber-900 mt-2">{stats?.doctors ?? 0}</h2>
        </div>

        {/* Khối 4: Nhân viên */}
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-xl transition-all hover:shadow-md">
          <p className="text-sm font-semibold text-rose-600 uppercase tracking-wider">Nhân viên hành chính</p>
          <h2 className="text-4xl font-black text-rose-900 mt-2">{stats?.staff ?? 0}</h2>
        </div>

      </div>
    </div>
  );
}