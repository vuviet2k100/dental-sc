'use client';
import { useState, useEffect } from 'react';
import { Loader2, Save } from 'lucide-react';

// 1. Cập nhật interface để khớp với cấu trúc Database mới
interface FormProps {
  initialData?: { diagnosis: string; treatment: string; consultation: string };
  onSubmit: (data: { diagnosis: string; treatment: string; consultation: string }) => void;
  loading: boolean;
  isStaff?: boolean;
}

export default function MedicalRecordForm({ initialData, onSubmit, loading, isStaff = false }: FormProps) {
  // 2. Khởi tạo state với tên trường mới 'consultation'
  const [formData, setFormData] = useState({
    diagnosis: initialData?.diagnosis || '',
    treatment: initialData?.treatment || '',
    consultation: initialData?.consultation || ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Chẩn đoán</label>
        <input 
          disabled={isStaff} 
          className="w-full p-3 border rounded-xl" 
          value={formData.diagnosis} 
          onChange={e => setFormData({...formData, diagnosis: e.target.value})} 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Điều trị</label>
        <textarea 
          disabled={isStaff} 
          className="w-full p-3 border rounded-xl h-24" 
          value={formData.treatment} 
          onChange={e => setFormData({...formData, treatment: e.target.value})} 
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tư vấn (Consultation)</label>
        <textarea 
          disabled={isStaff} 
          className="w-full p-3 border rounded-xl h-24" 
          value={formData.consultation} 
          onChange={e => setFormData({...formData, consultation: e.target.value})} 
        />
      </div>
      
      {!isStaff && (
        <button 
          onClick={() => onSubmit(formData)}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition disabled:bg-slate-400"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Lưu bệnh án</>}
        </button>
      )}
    </div>
  );
}