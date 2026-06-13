'use client';
import { useState } from 'react';
import { api } from '@/app/lib/axios'; // Import instance api đã cấu hình
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
      // Instance 'api' đã đính kèm token trong interceptor
      await api.post(`/medical-record/upload/${recordId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
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
        className="text-sm"
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