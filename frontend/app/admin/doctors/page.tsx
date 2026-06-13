'use client';
import { useState, useEffect } from 'react';
import { api } from '@/app/lib/axios'; // Import instance api đã cấu hình
import DetailedView from '@/components/DetailedView';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  useEffect(() => {
    // Gọi API lấy danh sách bác sĩ thông qua instance api
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/users?role=DOCTOR');
        setDoctors(res.data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách bác sĩ:", err);
      }
    };
    fetchDoctors();
  }, []);

  const handleResetPassword = async (id: number) => {
    if (confirm("Reset mật khẩu về 123456?")) {
      try {
        await api.patch(`/users/${id}/reset-password`);
        alert("Đã reset mật khẩu thành công!");
      } catch (err) {
        console.error("Lỗi khi reset mật khẩu:", err);
        alert("Có lỗi xảy ra khi reset.");
      }
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-black mb-6">🩺 Quản lý Bác sĩ</h1>
      
      {/* DANH SÁCH BÁC SĨ (MASTER) */}
      <div className="space-y-4 mb-10">
        {doctors.map(doc => (
          <div key={doc.id} className="p-4 bg-white border rounded-lg flex justify-between items-center">
            <div>
              <p className="font-bold">{doc.name}</p>
              <p className="text-sm text-gray-500">{doc.email}</p>
            </div>
            <div className="space-x-4">
              <button 
                onClick={() => handleResetPassword(doc.id)} 
                className="text-red-500 text-sm hover:underline"
              >
                Reset PW
              </button>
              <button 
                onClick={() => setSelectedDoctor(doc)} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* KHU VỰC HIỂN THỊ BỆNH NHÂN/HỒ SƠ (DETAIL) */}
      {selectedDoctor && (
        <div className="border-t pt-6">
          <h2 className="text-xl font-bold mb-4 text-blue-800">Quản lý bởi: {selectedDoctor.name}</h2>
          <DetailedView type="DOCTOR" user={selectedDoctor} />
        </div>
      )}
    </div>
  );
}