'use client';
import { useState } from 'react';
import axios from 'axios';
import { Upload, X } from 'lucide-react';

interface Props {
  recordId: number;
  onUploadSuccess: () => void;
}

export default function FileUploader({ recordId, onUploadSuccess }: Props) {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file); // Phải khớp với 'file' trong @UseInterceptors(FileInterceptor('file'))

    try {
      await axios.post(`process.env.NEXT_PUBLIC_API_URL/medical-record/upload/${recordId}`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'multipart/form-data' 
        }
      });
      setFile(null);
      onUploadSuccess();
      alert('Upload thành công!');
    } catch (err) {
      console.error(err);
      alert('Upload thất bại');
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 border-2 border-dashed rounded-xl border-slate-300">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button 
        onClick={handleUpload}
        disabled={!file}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
      >
        <Upload size={16} /> Tải lên
      </button>
    </div>
  );
}