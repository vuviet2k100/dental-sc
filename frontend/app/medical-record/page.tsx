'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';

export default function MedicalRecordsList({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState<string | null>(null);
  
  // Khởi tạo state ngay lập tức để không bị "flash" (nút hiện lên rồi mới mất)
  const [isStaff, setIsStaff] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_role')?.trim().toUpperCase() === 'STAFF';
    }
    return true; 
  });

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await api.get(`/medical-record`);
        const filtered = res.data.filter((r: any) => r.patientId.toString() === patientId);
        setRecords(filtered);
      } catch (err: any) {
        if (err.response?.status === 403) setError("Bạn không có quyền xem bệnh án.");
        else setError("Không thể tải dữ liệu bệnh án.");
      }
    };
    if (patientId) fetchRecords();
  }, [patientId]);

  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  return (
    <div className="space-y-4">
      {records.length > 0 ? (
        records.map((r: any) => (
          <div key={r.id} className="p-4 border rounded-lg shadow-sm bg-white flex justify-between items-center">
            <div>
              <h4 className="font-bold text-lg text-gray-800">{r.diagnosis}</h4>
              <p className="text-gray-600 text-sm mt-1">Điều trị: {r.treatment}</p>
              <Link href={`/medical-record/${r.id}`} className="text-blue-600 text-sm font-semibold mt-2 inline-block">
                → Xem chi tiết
              </Link>
            </div>
            
            {!isStaff && (
              <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500 italic">Bệnh nhân này chưa có bệnh án nào.</p>
      )}
    </div>
  );
}