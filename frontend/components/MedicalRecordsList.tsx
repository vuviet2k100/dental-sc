'use client';
import { useEffect, useState } from 'react';
import { medicalRecordService } from '@/services/api'; // Import service mới
import Link from 'next/link';
import { Loader2, FileText, AlertCircle } from 'lucide-react';

export default function MedicalRecordsList({ patientId }: { patientId: string }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await medicalRecordService.getByPatient(patientId);
        setRecords(res.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError("Bạn không có quyền xem bệnh án.");
        } else {
          setError("Không thể tải dữ liệu bệnh án.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchRecords();
    } else {
      setLoading(false);
    }
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 border border-red-100">
        <AlertCircle size={20} />
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {records.length > 0 ? (
        records.map((r: any) => (
          <div key={r.id} className="p-5 border rounded-2xl shadow-sm bg-white hover:shadow-md transition duration-200">
            <div className="flex items-start gap-3">
              <FileText className="text-blue-500 mt-1" size={20} />
              <div>
                <h4 className="font-bold text-gray-900 text-lg">{r.diagnosis}</h4>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  <span className="font-medium text-gray-800">Điều trị: </span>
                  {r.treatment}
                </p>
                <Link 
                  href={`/medical-record/${r.id}`} 
                  className="text-blue-600 text-sm font-semibold mt-3 inline-flex items-center hover:underline"
                >
                  Xem chi tiết →
                </Link>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed">
          <p className="text-gray-500">Bệnh nhân này chưa có hồ sơ bệnh án nào.</p>
        </div>
      )}
    </div>
  );
}