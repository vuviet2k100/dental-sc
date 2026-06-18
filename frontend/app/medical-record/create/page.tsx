'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/app/lib/axios';
import { ArrowLeft, FilePlus, Loader2 } from 'lucide-react';
import MedicalRecordForm from '@/components/MedicalRecordForm';

function CreateFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get('patientId');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: { diagnosis: string; treatment: string; consultation: string }) => {
    if (!patientId) {
      alert('Lỗi: Không tìm thấy thông tin bệnh nhân!');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/medical-record`, {
        ...data,
        patientId: Number(patientId),
      });
      alert('Tạo bệnh án thành công! Bạn sẽ được chuyển hướng để thêm hình ảnh.');
      router.push(`/medical-record/${response.data.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi khi tạo bệnh án!');
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