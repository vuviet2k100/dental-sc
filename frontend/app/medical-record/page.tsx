'use client';
import { useEffect, useState } from 'react';
import { medicalRecordService } from '@/services/api'; // Import service
import Link from 'next/link';
import { Trash2, Loader2 } from 'lucide-react';

export default function MedicalRecordsList({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  
  const [isStaff] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_role')?.trim().toUpperCase() === 'STAFF';
    }
    return true; 
  });

  const fetchRecords = async () => {
    try {
      // Sử dụng service thay vì gọi trực tiếp api.get
      const res = await medicalRecordService.getByPatient(patientId);
      setRecords(res.data);
    } catch (err: any) {
      if (err.response?.status === 403) setError("Bạn không có quyền xem bệnh án.");
      else setError("Không thể tải dữ liệu bệnh án.");
    }
  };

  useEffect(() => {
    if (patientId) fetchRecords();
  }, [patientId]);

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa bệnh án này?')) return;
    setIsDeleting(id);
    try {
      // Sử dụng service xóa bệnh án
      await medicalRecordService.delete(id.toString());
      fetchRecords(); 
    } catch (err) {
      alert('Không thể xóa bệnh án.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (error) return <p className="text-red-500 text-sm">{error}</p>;

  return (
    <div className="space-y-4">
      {records.length > 0 ? (
        records.map((r: any) => (
          <div key={r.id} className="p-4 border rounded-lg shadow-sm bg-white flex justify-between items-center">
            <div>
             <h4 className="font-bold text-lg text-gray-800">{r.diagnosis}</h4>
              <p className="text-gray-600 text-sm mt-1">Điều trị: {r.treatment}</p>
              {/* Lấy 1 dòng note cuối cùng làm tóm tắt */}
              <p className="text-xs text-gray-400 mt-2 italic">
                Ghi chú gần nhất: {r.treatment?.split('---').pop()?.substring(0, 50)}...
              </p>
              <Link href={`/medical-record/${r.id}`} className="text-blue-600 text-sm font-semibold mt-2 block">
                → Xem chi tiết đầy đủ
              </Link>
            </div>
            
            {!isStaff && (
              <button 
                onClick={() => handleDelete(r.id)}
                disabled={isDeleting === r.id}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
              >
                {isDeleting === r.id ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
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