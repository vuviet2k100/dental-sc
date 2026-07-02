'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/app/lib/axios';
import { medicalRecordService } from '@/services/api';
import { ArrowLeft, FilePlus, Loader2, User, Stethoscope, AlertCircle, History } from 'lucide-react';
import MedicalRecordForm from '@/components/MedicalRecordForm';

function CreateFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const appointmentId = searchParams.get('appointmentId');
  
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch dữ liệu lịch hẹn đầy đủ từ server
  useEffect(() => {
    if (appointmentId) {
      api.get(`/appointments/${appointmentId}`)
        .then(res => setAppointment(res.data))
        .catch(() => setErrorMsg("Không thể tải thông tin lịch hẹn!"));
    }
  }, [appointmentId]);

  // 2. Xử lý lưu bệnh án với cơ chế "Nối chuỗi" (Log lịch sử)
  const handleSubmit = async (data: { diagnosis: string; treatment: string; note: string }) => {
    if (!appointment) return;

    setLoading(true);
    setErrorMsg(null);
    
    try {
      // Tạo timestamp định dạng: HH:mm DD/MM/YYYY
      const now = new Date();
      const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
      const newLog = `--- ${timestamp} ---\n${data.note}\n`;
      
      // Ghép note mới vào note cũ (nếu có)
      const oldNotes = appointment.medicalRecord?.note || '';
      const finalNote = oldNotes ? `${oldNotes}\n${newLog}` : newLog;

      const commonData = {
        ...data,
        note: finalNote,
        };
      if (appointment.medicalRecord?.id) {
        // Nếu đã có bệnh án, update
        await medicalRecordService.update(appointment.medicalRecord.id.toString(), commonData);
      } else {
        // Nếu chưa có bệnh án, tạo mới
        const createPayload = {
        ...commonData,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentId: Number(appointmentId)
      };
        await medicalRecordService.create(createPayload);
      }
      router.push('/appointments'); 
      
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Lỗi khi lưu bệnh án');
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-50 min-h-screen">
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

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-sm">
            <AlertCircle size={20} />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Thông tin nhanh */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-xl border">
          <div className="flex items-center gap-2 text-sm text-slate-600">
             <User size={18} className="text-blue-500" /> Bệnh nhân: <span className="font-bold">{appointment.patient?.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
             <Stethoscope size={18} className="text-green-500" /> Bác sĩ: <span className="font-bold">{appointment.doctor?.name}</span>
          </div>
        </div>        

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