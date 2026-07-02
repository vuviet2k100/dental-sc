'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trash2, Upload, FileText, Loader2, ArrowLeft, Trash, History } from 'lucide-react';
import { medicalRecordService } from '@/services/api';
import MedicalRecordForm from '@/components/MedicalRecordForm';

export default function RecordDetail() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  
  // State quản lý dữ liệu
  const [record, setRecord] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isStaff, setIsStaff] = useState(false);

  // Kiểm tra quyền hạn
  useEffect(() => {
    const role = localStorage.getItem('user_role')?.trim().toUpperCase();
    setIsStaff(role === 'STAFF');
  }, []);

  // Tải dữ liệu bệnh án
  useEffect(() => {
    if (id) fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    try {
      const res = await medicalRecordService.getById(id);
      setRecord(res.data);
    } catch (err) {
      console.error("Lỗi khi tải bệnh án:", err);
    }
  };

  // Xử lý cập nhật với cơ chế nối chuỗi log
 const handleUpdate = async (data: any) => {
  setIsUpdating(true);
  try {
    const now = new Date();
    // Định dạng: HH:mm DD/MM/YYYY
    const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    
    // Tạo block log mới
    const newEntry = `[${timestamp}] ${data.treatment}`;
    
    // Nối vào nội dung hiện tại của trường treatment
    // Nếu record.treatment đã có dữ liệu thì xuống dòng rồi nối tiếp
    const existingHistory = record.treatment ? record.treatment + '\n' : '';
    
    const updatedPayload = {
      ...data,
      treatment: existingHistory + newEntry // Lưu lịch sử vào chính trường treatment
    };

    await medicalRecordService.update(id, updatedPayload);
    alert('Cập nhật bệnh án thành công!');
    fetchRecord(); // Load lại data mới nhất từ server
  } catch (err) {
    alert('Cập nhật thất bại!');
  } finally {
    setIsUpdating(false);
  }
};

  // Xử lý xóa bệnh án
  const handleDeleteRecord = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ bệnh án này?')) return;
    try {
      await medicalRecordService.delete(id);
      router.back();
    } catch (err) {
      alert('Không thể xóa bệnh án!');
    }
  };

  // Xử lý upload ảnh
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await medicalRecordService.upload(id, formData);
      await fetchRecord();
    } catch (err) {
      alert('Upload ảnh thất bại!');
    } finally {
      setIsUploading(false);
    }
  };

  // Xử lý xóa ảnh
  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Bạn có chắc muốn xóa ảnh này?')) return;
    try {
      await medicalRecordService.deleteImage(imageId);
      await fetchRecord();
    } catch (err) {
      alert('Không thể xóa ảnh!');
    }
  };

  if (!record) {
    return <div className="p-8 text-center text-slate-500"><Loader2 className="animate-spin inline mr-2" /> Đang tải bệnh án...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-50 min-h-screen">
      {/* Header Điều hướng */}
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition">
          <ArrowLeft size={20} /> Quay lại
        </button>
        {!isStaff && (
          <button onClick={handleDeleteRecord} className="text-red-600 flex items-center gap-2 hover:bg-red-50 p-2 rounded transition">
            <Trash size={18} /> Xóa bệnh án
          </button>
        )}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border space-y-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="text-blue-600" /> Bệnh án #{id}
        </h1>

        {/* Thông tin mở rộng từ Lịch hẹn */}
        <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="text-slate-500 block">Khách hàng:</span>
            <span className="font-semibold">{record.appointment?.patient?.name || '---'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Bác sĩ:</span>
            <span className="font-semibold">{record.appointment?.doctor?.name || '---'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Dịch vụ:</span>
            <span className="font-semibold">{record.appointment?.service || '---'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Doanh thu:</span>
            <span className="font-semibold text-blue-600">
              {record.appointment?.revenue ? record.appointment.revenue.toLocaleString('vi-VN') + 'đ' : '0đ'}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500 block">Sale Note:</span>
            <div className="p-2 bg-white rounded border mt-1 italic text-gray-700">
              {record.appointment?.saleNote || 'Không có ghi chú sale.'}
            </div>
          </div>
        </div>
        {/* Lịch sử điều trị (Chỉ hiện nếu có note) */}
        {record.treatment && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
            <div className="font-bold mb-3 text-amber-800 flex items-center gap-2">
              <History size={16} /> Lịch sử điều trị:
            </div>
            <div className="bg-white p-3 rounded-lg border border-amber-100 max-h-60 overflow-y-auto">
                {record.treatment.split('\n').reverse().map((line: string, i: number) => (
              <div key={i} className="text-gray-700 border-b border-gray-50 pb-2">
                {line.startsWith('[') ? (
                  <span className="font-mono font-bold text-blue-600 block text-[10px]">
                    {line.split(']')[0] + ']'}
                  </span>
                ) : null}
                <p className="text-gray-800">{line.replace(/\[.*?\]/, '')}</p>
              </div>
            ))}
            </div>
          </div>
        )}

        {/* Form Cập nhật */}
        <MedicalRecordForm 
          initialData={{ diagnosis: record.diagnosis, treatment: record.treatment, note: '' }} 
          onSubmit={handleUpdate}
          loading={isUpdating}
          isStaff={isStaff}
        />

        {/* Khu vực Hình ảnh */}
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