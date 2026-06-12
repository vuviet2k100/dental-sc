'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api'; // Sử dụng instance api của bạn
import Link from 'next/link';

export default function MedicalRecordsList({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Gọi API danh sách (Giờ đã được mở quyền cho STAFF ở Backend)
        const res = await api.get(`/medical-record`);
        const filtered = res.data.filter((r: any) => r.patientId.toString() === patientId);
        setRecords(filtered);
      } catch (err: any) {
        // Xử lý lỗi tinh tế: chỉ hiện lỗi nếu không phải là 403
        if (err.response?.status === 403) {
          setError("Bạn không có quyền xem bệnh án.");
        } else {
          setError("Không thể tải dữ liệu bệnh án.");
        }
      }
    };
    if (patientId) fetchRecords();
  }, [patientId]);

  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  return (
    <div className="space-y-4">
      {records.length > 0 ? (
        records.map((r: any) => (
          <div key={r.id} className="p-4 border rounded-lg shadow-sm bg-white">
            <h4 className="font-bold text-lg text-gray-800">{r.diagnosis}</h4>
            <p className="text-gray-600 text-sm mt-1">Điều trị: {r.treatment}</p>
            <Link href={`/medical-record/${r.id}`} className="text-blue-600 text-sm font-semibold mt-2 inline-block">
              → Xem chi tiết
            </Link>
          </div>
        ))
      ) : (
        <p className="text-gray-500 italic">Bệnh nhân này chưa có bệnh án nào.</p>
      )}
    </div>
  );
}