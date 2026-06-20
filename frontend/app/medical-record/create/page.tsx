'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/app/lib/axios';
import { ArrowLeft, FilePlus, Loader2, User, Stethoscope, AlertCircle } from 'lucide-react';
import MedicalRecordForm from '@/components/MedicalRecordForm';

function CreateFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const patientId = searchParams.get('patientId');
  const doctorId = searchParams.get('doctorId');
  const appointmentId = searchParams.get('appointmentId');
  const patientName = searchParams.get('patientName') || 'Không xác định';
  const doctorName = searchParams.get('doctorName') || 'Không xác định';

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (data: { diagnosis: string; treatment: string; note: string }) => {
    if (!patientId || !doctorId || !appointmentId) {
      setErrorMsg('Thiếu thông tin liên kết (Patient/Doctor/Appointment)!');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    
    try {
      const payload = {
        ...data,
        patientId: Number(patientId),
        doctorId: Number(doctorId),
        appointmentId: Number(appointmentId)
      };

      console.log("Payload gửi đi:", payload);

      const response = await api.post(`/medical-record`, payload);
      router.push(`/medical-record/${response.data.id}`);
    } catch (err: any) {
      // Xử lý lỗi 400 chi tiết từ Backend (thường là mảng các lỗi)
      const errorData = err.response?.data;
      const message = errorData?.message || 'Lỗi không xác định.';
        setErrorMsg(message);
        console.error("Lỗi nghiệp vụ:", message);
      } finally {
        console.log("Đã vào finally, chuẩn bị tắt loading...");
        setTimeout(() => {
          setLoading(false);
        }, 100);    
      }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-50 min-h-screen">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition">
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FilePlus className="text-blue-600" /> Thêm bệnh án mới
        </h1>

        {/* Hiển thị lỗi nếu có */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle size={20} />
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User size={18} className="text-blue-500" /> Bệnh nhân: <span className="font-bold">{patientName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Stethoscope size={18} className="text-green-500" /> Bác sĩ: <span className="font-bold">{doctorName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 col-span-2">
            <FilePlus size={18} className="text-purple-500" /> ID Cuộc hẹn: <span className="font-bold">{appointmentId || 'Không xác định'}</span>
          </div>
        </div>

        <MedicalRecordForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}

export default function CreateRecordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></div>}>
      <CreateFormContent />
    </Suspense>
  );
}