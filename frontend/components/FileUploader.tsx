'use client';
import { useState } from 'react';
import { medicalRecordService } from '@/services/api'; // Import service thay vì api trực tiếp
import { Upload } from 'lucide-react';

interface Props {
  recordId: number;
  onUploadSuccess: () => void;
}

export default function FileUploader({ recordId, onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      // Sử dụng service layer
      await medicalRecordService.upload(recordId, formData);
      
      setFile(null);
      onUploadSuccess();
      alert('Upload thành công!');
    } catch (err) {
      console.error("Lỗi upload:", err);
      alert('Upload thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 border-2 border-dashed rounded-xl border-slate-300">
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)} 
        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      <button 
        onClick={handleUpload}
        disabled={!file || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2 hover:bg-blue-700 transition"
      >
        <Upload size={16} /> {loading ? 'Đang tải...' : 'Tải lên'}
      </button>
    </div>
  );
}