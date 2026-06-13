'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trash2, Upload, FileText, Loader2, ArrowLeft, Trash, Save } from 'lucide-react';
import { api } from '@/app/lib/axios'; // Đảm bảo import đúng đường dẫn instance api của bạn

export default function RecordDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [record, setRecord] = useState<any>(null);
  const [formData, setFormData] = useState({ diagnosis: '', treatment: '', note: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isStaff, setIsStaff] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_role')?.trim().toUpperCase() === 'STAFF';
    }
    return true;
  });

  useEffect(() => {
    if (id) fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    try {
      // Dùng api thay vì axios
      const res = await api.get(`/medical-record/${id}`);
      setRecord(res.data);
      setFormData({ 
        diagnosis: res.data.diagnosis, 
        treatment: res.data.treatment, 
        note: res.data.note || '' 
      });
    } catch (err) { console.error(err); }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await api.patch(`/medical-record/${id}`, formData);
      alert('Cập nhật thành công!');
      fetchRecord();
    } catch (err) { alert('Cập nhật thất bại!'); } finally { setIsUpdating(false); }
  };

  const handleDeleteRecord = async () => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/medical-record/${id}`);
      router.push('/medical-record');
    } catch (err) { alert('Xóa thất bại!'); } finally { setIsDeleting(false); }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const data = new FormData();
    data.append('file', file);
    try {
      // Dùng api.post cho upload (api mặc định sẽ đính kèm token)
      await api.post(`/medical-record/upload/${id}`, data);
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

  if (!record) return <div className="p-8 text-center text-slate-500">Đang tải...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="text-slate-600 hover:text-blue-600 transition flex items-center gap-2">
          <ArrowLeft size={20} /> Quay lại
        </button>
        {!isStaff && (
          <button onClick={handleDeleteRecord} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
            {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <><Trash size={18} /> Xóa bệnh án</>}
          </button>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="text-blue-600" /> Bệnh án #{id}</h1>
        
        <div className="space-y-4">
          <input disabled={isStaff} className="w-full p-3 border rounded-xl" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} />
          <textarea disabled={isStaff} className="w-full p-3 border rounded-xl h-32" value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} />
          {!isStaff && (
            <button onClick={handleUpdate} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition">
              {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Cập nhật</>}
            </button>
          )}
        </div>

        <div className="border-t pt-8">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-4">Hình ảnh</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {record.images?.map((img: any) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border">
                {/* Thay thế process.env bằng baseURL từ instance hoặc đường dẫn tuyệt đối trực tiếp từ server */}
                <img src={`https://dental-sc.onrender.com/api${img.imageUrl}`} className="w-full h-32 object-cover" />
                {!isStaff && (
                  <button onClick={() => handleDeleteImage(img.id)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!isStaff && (
            <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 transition">
              {isUploading ? <Loader2 className="animate-spin" /> : <><Upload size={20} /> Tải ảnh lên</>}
              <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}