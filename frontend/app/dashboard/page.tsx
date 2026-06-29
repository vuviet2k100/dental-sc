'use client';

import React, { useEffect, useState } from 'react';
import { dashboardService } from '@/services/api'; // Import service
import { Users, CalendarDays, Stethoscope, UserCog, Clock } from 'lucide-react';

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
      try {
        const res = await dashboardService.getStats(); // Gọi qua service
        setStats(res.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'TỔNG BỆNH NHÂN', value: stats?.patients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'CUỘC HẸN', value: stats?.appointments, icon: CalendarDays, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'BÁC SĨ', value: stats?.doctors, icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'NHÂN VIÊN', value: stats?.staff, icon: UserCog, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="p-10 bg-gray-50 min-h-screen">
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
    </div>
  );
}