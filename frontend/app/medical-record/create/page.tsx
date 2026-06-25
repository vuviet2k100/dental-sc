'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/app/lib/axios';
import { ArrowLeft, FilePlus, Loader2, User, Stethoscope, AlertCircle } from 'lucide-react';
import MedicalRecordForm from '@/components/MedicalRecordForm';

function CreateFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Lấy dữ liệu từ URL truyền qua từ AppointmentsPage
  const patientId = searchParams.get('patientId');
  const doctorId = searchParams.get('doctorId');
  const appointmentId = searchParams.get('appointmentId');
  const patientName = searchParams.get('patientName') || 'Không xác định';
  const doctorName = searchParams.get('doctorName') || 'Không xác định';

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (data: { diagnosis: string; treatment: string; note: string }) => {
    // Kiểm tra tính hợp lệ của dữ liệu trước khi gửi
    if (!patientId || !doctorId || !appointmentId) {
      setErrorMsg('Thiếu thông tin liên kết (Bệnh nhân/Bác sĩ/Cuộc hẹn)!');
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

      // Gửi request tới Backend
      const response = await api.post(`/medical-record`, payload);
      
      // Chuyển hướng đến trang chi tiết bệnh án sau khi lưu thành công
      router.push(`/medical-record/${response.data.id}`);
    } catch (err: any) {
      // Xử lý lỗi linh hoạt: có thể là chuỗi hoặc mảng lỗi từ NestJS
      const errorData = err.response?.data;
      let message = 'Lỗi không xác định.';
      
      if (typeof errorData?.message === 'string') {
        message = errorData.message;
      } else if (Array.isArray(errorData?.message)) {
        message = errorData.message.join(', ');
      }
      
      setErrorMsg(message);
      console.error("Lỗi nghiệp vụ:", errorData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-50 min-h-screen">
      <button 
        onClick={() => router.back()} 
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition"
      >
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

        {/* Thông tin hiển thị nhanh */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User size={18} className="text-blue-500" /> Bệnh nhân: <span className="font-bold">{patientName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Stethoscope size={18} className="text-green-500" /> Bác sĩ: <span className="font-bold">{doctorName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 col-span-2">
            <FilePlus size={18} className="text-purple-500" /> ID Cuộc hẹn: <span className="font-bold">{appointmentId}</span>
          </div>
        </div>

        {/* Form nhập liệu */}
        <MedicalRecordForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}

export default function CreateRecordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>}>
      <CreateFormContent />
    </Suspense>
  );
}