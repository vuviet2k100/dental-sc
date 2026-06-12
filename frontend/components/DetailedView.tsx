'use client';
import { useEffect, useState } from 'react';
import { doctorService, staffService } from '@/services/api';

interface DetailedViewProps {
  type: 'DOCTOR' | 'STAFF';
  user: any;
}

export default function DetailedView({ type, user }: DetailedViewProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchData = async () => {
      setLoading(true);
      console.log("Đang gọi API với staffId:", user.id); // <--- KIỂM TRA LOG Ở F12
      try {
        // Sử dụng Service đã cấu hình sẵn trong api.ts để tự động gửi token và handle 401
        const res = type === 'DOCTOR' 
          ? await doctorService.getMedicalRecords(user.id)
          : await staffService.getAllAppointments(user.id);
          
      console.log("Dữ liệu nhận được:", res.data); // <--- KIỂM TRA LOG Ở F12
        setData(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, user?.id]);

  if (loading) return <div className="p-4 text-slate-400">Đang tải dữ liệu...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mt-4">
      <h3 className="font-black text-lg mb-4 text-slate-800">
        {type === 'DOCTOR' 
          ? `Hồ sơ bệnh án của BS. ${user.name}` 
          : `Lịch hẹn do NV. ${user.name} quản lý`}
      </h3>
      
      {data.length === 0 ? (
        <p className="text-slate-400 italic">Chưa có dữ liệu nào cho người dùng này.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 uppercase text-xs text-left">
              <th className="pb-3">Bệnh nhân</th>
              <th className="pb-3">{type === 'DOCTOR' ? 'Chẩn đoán' : 'Trạng thái'}</th>
              <th className="pb-3">Ngày</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item: any) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="py-3 font-semibold text-slate-800">
                  {item.patient?.name || '---'}
                </td>
                <td className="py-3 text-slate-600">
                  {type === 'DOCTOR' ? (item.diagnosis || '---') : (item.status || '---')}
                </td>
                <td className="py-3 text-slate-500">
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '---'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}