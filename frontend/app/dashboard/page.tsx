'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, CalendarDays, Stethoscope, UserCog, TrendingUp, Clock } from 'lucide-react';

// 1. Cập nhật Interface khớp với Backend của bạn
interface DashboardStats {
  patients: number;
  appointments: number;
  doctors: number;
  staff: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('process.env.NEXT_PUBLIC_API_URL/dashboard', config);
        // Lưu ý: Đảm bảo Backend trả về đúng object này
        setStats(res.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Map lại dữ liệu vào các thẻ (Cards)
  const statCards = [
    { label: 'TỔNG BỆNH NHÂN', value: stats?.patients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'CUỘC HẸN', value: stats?.appointments, icon: CalendarDays, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'BÁC SĨ', value: stats?.doctors, icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'NHÂN VIÊN', value: stats?.staff, icon: UserCog, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Chào mừng quay lại, Smile Craft Dental Clinic.</p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-blue-600 bg-blue-100 px-4 py-2 rounded-full">
          <TrendingUp size={16} /> <span>Hệ thống hoạt động bình thường</span>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-500 italic">
          <div className="animate-spin mr-3"><Clock size={24} /></div>
          Đang tổng hợp dữ liệu...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <card.icon className={card.color} size={24} />
                </div>
              </div>
              <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{card.label}</p>
              <h2 className={`text-4xl font-black mt-1 ${card.color}`}>
                {card.value?.toLocaleString() || 0}
              </h2>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin hệ thống</h3>
        <p className="text-gray-400 text-sm">Chào mừng bạn đến với bảng điều khiển quản trị tập trung.</p>
      </div>
    </div>
  );
}