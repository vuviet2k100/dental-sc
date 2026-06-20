'use client';
import { useState, useEffect } from 'react';
import { Loader2, Save, AlertCircle } from 'lucide-react';

interface FormProps {
  initialData?: { diagnosis: string; treatment: string; note: string };
  onSubmit: (data: { diagnosis: string; treatment: string; note: string }) => void;
  loading: boolean;
  isStaff?: boolean;
}

export default function MedicalRecordForm({ initialData, onSubmit, loading, isStaff = false }: FormProps) {
  const [formData, setFormData] = useState({
    diagnosis: initialData?.diagnosis || '',
    treatment: initialData?.treatment || '',
    note: initialData?.note || ''
  });

  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleValidateAndSubmit = () => {
    if (!formData.diagnosis.trim() || !formData.treatment.trim() || !formData.note.trim()) {
      setLocalError('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    setLocalError(null);
    onSubmit(formData);
  };

  return (
    <div className="space-y-5">
      {/* Thông báo lỗi */}
      {localError && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-center gap-2 border border-red-100">
          <AlertCircle size={18} /> {localError}
        </div>
      )}

      {/* Chẩn đoán */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Chẩn đoán <span className="text-red-500">*</span>
        </label>
        <input 
          disabled={isStaff} 
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-slate-100" 
          placeholder="Nhập chẩn đoán bệnh..."
          value={formData.diagnosis} 
          onChange={e => setFormData({...formData, diagnosis: e.target.value})} 
        />
      </div>

      {/* Điều trị */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
          Điều trị <span className="text-red-500">*</span>
        </label>
        <textarea 
          disabled={isStaff} 
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-slate-100 h-24" 
          placeholder="Nhập phác đồ điều trị..."
          value={formData.treatment} 
          onChange={e => setFormData({...formData, treatment: e.target.value})} 
        />
      </div>

      {/* Tư vấn / Ghi chú */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tư vấn</label>
        <textarea 
          disabled={isStaff} 
          className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition disabled:bg-slate-100 h-24" 
          placeholder="Nhập lời khuyên hoặc ghi chú thêm..."
          value={formData.note} 
          onChange={e => setFormData({...formData, note: e.target.value})} 
        />
      </div>
      
      {/* Nút lưu */}
      {!isStaff && (
        <button 
          onClick={handleValidateAndSubmit}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition disabled:bg-slate-400 font-medium"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <><Save size={20} /> Lưu bệnh án</>
          )}
        </button>
      )}
    </div>
  );
}