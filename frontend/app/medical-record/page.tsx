'use client';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
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
      // Gọi API có truyền patientId để Backend lọc dữ liệu
      const res = await api.get(`/medical-record?patientId=${patientId}`);
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
      await api.delete(`/medical-record/${id}`);
      fetchRecords(); // Reload danh sách sau khi xóa
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
              <Link href={`/medical-record/${r.id}`} className="text-blue-600 text-sm font-semibold mt-2 inline-block">
                → Xem chi tiết
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