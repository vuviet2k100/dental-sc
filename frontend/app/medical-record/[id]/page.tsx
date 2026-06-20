'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trash2, Upload, FileText, Loader2, ArrowLeft, Trash } from 'lucide-react';
import { api } from '@/app/lib/axios';
import MedicalRecordForm from '@/components/MedicalRecordForm';

export default function RecordDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isStaff] = useState(() => typeof window !== 'undefined' && localStorage.getItem('user_role')?.trim().toUpperCase() === 'STAFF');

  useEffect(() => { if (id) fetchRecord(); }, [id]);

  const fetchRecord = async () => {
    try {
      const res = await api.get(`/medical-record/${id}`);
      setRecord(res.data);
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async (data: any) => {
    setIsUpdating(true);
    try {
      await api.patch(`/medical-record/${id}`, data);
      alert('Cập nhật thành công!');
      fetchRecord();
    } catch (err) { alert('Cập nhật thất bại!'); } finally { setIsUpdating(false); }
  };

  const handleDeleteRecord = async () => {
    if (!confirm('Bạn có chắc muốn xóa toàn bộ bệnh án này?')) return;
    try {
      await api.delete(`/medical-record/${id}`);
      router.back();
    } catch (err) { alert('Không thể xóa bệnh án!'); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await api.post(`/medical-record/upload/${id}`, formData);
      await fetchRecord();
    } catch (err) { alert('Upload lỗi!'); } finally { setIsUploading(false); }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Xóa ảnh này?')) return;
    try {
      await api.delete(`/medical-record/image/${imageId}`);
      await fetchRecord();
    } catch (err) { alert('Không thể xóa ảnh!'); }
  };

  if (!record) return <div className="p-8 text-center text-slate-500">Đang tải bệnh án...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-blue-600">
            <ArrowLeft size={20} /> Quay lại
        </button>
        {!isStaff && (
          <button onClick={handleDeleteRecord} className="text-red-600 flex items-center gap-2 hover:bg-red-50 p-2 rounded">
            <Trash size={18} /> Xóa bệnh án
          </button>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-8">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText /> Bệnh án #{id}</h1>
        
        <MedicalRecordForm 
          initialData={{ diagnosis: record.diagnosis, treatment: record.treatment, note: record.note }}
          onSubmit={handleUpdate}
          loading={isUpdating}
          isStaff={isStaff}
        />

        <div className="border-t pt-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Hình ảnh điều trị</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {record.images?.map((img: any) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border">
                <img src={img.url} className="w-full h-32 object-cover" alt="Điều trị" />
                {!isStaff && (
                  <button onClick={() => handleDeleteImage(img.id)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!isStaff && (
            <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
              {isUploading ? <Loader2 className="animate-spin" /> : <><Upload size={20} /> Tải ảnh lên</>}
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}