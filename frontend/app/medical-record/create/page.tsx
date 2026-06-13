'use client';
import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/app/lib/axios'; // IMPORT INSTANCE API ĐÃ CẤU HÌNH
import { ArrowLeft, Save, FilePlus, Loader2 } from 'lucide-react';

function CreateFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patientId = searchParams.get('patientId');
  
  const [formData, setFormData] = useState({ diagnosis: '', treatment: '', note: '' });
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (formData.diagnosis || formData.treatment || formData.note) {
      if (!confirm('Bạn có thay đổi chưa lưu, vẫn muốn thoát?')) return;
    }
    router.back();
  };

  const handleSubmit = async () => {
    if (!formData.diagnosis || !formData.treatment) {
      alert('Vui lòng điền đủ chẩn đoán và điều trị!');
      return;
    }

    setLoading(true);
    try {
      // Dùng api.post (đã tự động đính kèm token qua interceptor)
      const response = await api.post(`/medical-record`, {
        ...formData,
        patientId: Number(patientId),
        doctorId: 1, // Nên lấy từ JWT payload thay vì cứng 1
      });

      alert('Tạo bệnh án thành công!');
      router.push(`/medical-record/${response.data.id}`);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi tạo bệnh án!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-50 min-h-screen">
      <button 
        onClick={handleBack} 
        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div className="bg-white p-8 rounded-2xl shadow-sm border">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FilePlus className="text-blue-600" /> Thêm bệnh án mới
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chẩn đoán</label>
            <input 
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Nhập chẩn đoán..." 
              onChange={e => setFormData({...formData, diagnosis: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Điều trị</label>
            <textarea 
              className="w-full p-3 border rounded-xl h-32 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Nhập phác đồ điều trị..." 
              onChange={e => setFormData({...formData, treatment: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
            <input 
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Ghi chú thêm..." 
              onChange={e => setFormData({...formData, note: e.target.value})} 
            />
          </div>

          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Lưu bệnh án</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateRecordPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải form...</div>}>
      <CreateFormContent />
    </Suspense>
  );
}