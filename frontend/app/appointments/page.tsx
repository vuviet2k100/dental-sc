'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { staffService, userService } from '@/services/api';
import { api } from '@/app/lib/axios';
import { 
 SourceLabels, StatusLabels, ServiceLabels, TypeLabels, AppointmentType, Department 
} from '@common/enum';
import { useAuth } from '@/context/AuthContext';

export default function AppointmentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [data, setData] = useState<any>({ appointments: [], patients: [], doctors: [], staffs: [] });
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<string>(AppointmentType.SCHEDULE_VISIT);
  
  const [filters, setFilters] = useState({ date: '', status: '', name: '' });
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
  setFilters({ date: '', status: '', name: '' });
  setPatientSearch('');
}, [activeTab]);

  const isAdmin = user?.role === 'ADMIN';
  const isDoctor = user?.department === 'DOCTOR';
  console.log(">>> Role thực tế của user:", user.role); 
  console.log(">>> Giá trị isDoctor đang tính toán:", isDoctor);
  const isReception = user?.department === 'RECEPTION';
  const isFollowUp = activeTab === AppointmentType.FOLLOW_UP; 

  const canEdit = useMemo(() => {
    console.log(">>> CHECK PERMISSION:", {
    activeTab,
    isDoctor,
    isReception,
    isAdmin,
    userRole: user?.role, // hoặc user?.department tùy ông lưu
  });
  if (isAdmin) return true; // Admin luôn được sửa mọi thứ
  
  if (activeTab === AppointmentType.SCHEDULE_VISIT) {
    return isReception; // Lịch hẹn: Lễ tân được sửa
  }
  if (activeTab === AppointmentType.PROCEDURE) {
    return isDoctor || user.department === Department.TELE_SALE; // Lịch thực hiện: Bác sĩ + Tele được sửa
  }
  if (activeTab === AppointmentType.FOLLOW_UP) {
    return isDoctor; // Tái khám: Bác sĩ được sửa
  }
  return false;
}, [activeTab, user, isAdmin, isReception, isDoctor]);

// Biến này để khóa các input trong Modal
const isReadOnly = !canEdit;

const fetchData = useCallback(async () => {
  if (!user) return; 
  try {
    const timestamp = Date.now();
    const [app, p, d, s] = await Promise.all([
      api.get(`/appointments?type=${activeTab}`).then(res => res.data),
      staffService.getAllPatients(),
      userService.getAll('DOCTOR'),
      userService.getAll('STAFF')
    ]);
    setData({ 
      appointments: app || [], 
      patients: p.data || [], 
      doctors: d.data || [], 
      staffs: s.data || [] 
    });
  } catch (e) { console.error(e); alert("Lỗi tải dữ liệu"); }
}, [activeTab, user]); // Chỉ chạy lại khi activeTab hoặc user thay đổi

useEffect(() => { 
  if (!isLoading && user) fetchData(); 
}, [fetchData, isLoading, user]); // fetchData nằm trong dependency
  const filteredPatients = useMemo(() => {
    return data.patients.filter((p: any) => p.name.toLowerCase().includes(patientSearch.toLowerCase()));
  }, [data.patients, patientSearch]);

  const filteredAppointments = useMemo(() => {
    return data.appointments.filter((a: any) => {
      const matchName = a.patient?.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchStatus = filters.status === '' || a.status === filters.status;
      const matchDate = filters.date === '' || a.appointmentTime.startsWith(filters.date);
      return matchName && matchStatus && matchDate;
    });
  }, [data.appointments, filters]);

  const handleDelete = async (id: number) => {
    if (confirm("Xóa lịch hẹn này?")) {
      try {
        await api.delete(`/appointments/${id}`);
        fetchData();
      } catch (e) { alert("Không thể xóa"); }
    }
  };

  const openModal = (app: any | null) => {
    if (app) {
      const noteParts = app.note?.split('|') || [];
      const customSvc = noteParts.find((n: string) => n.startsWith('DV:'))?.replace('DV:', '') || '';
      const customSrc = noteParts.find((n: string) => n.startsWith('NG:'))?.replace('NG:', '') || '';
      const actualNote = noteParts.find((n: string) => !n.startsWith('DV:') && !n.startsWith('NG:')) || app.note;
      
      const staff = data.staffs.find((s: any) => s.id === app.staffId);
      const isTele = staff?.department === Department.TELE_SALE;
      
      setFormData({ 
        ...app, 
        staffId: isTele ? app.staffId : '',
        appointmentTime: app.appointmentTime ? new Date(app.appointmentTime).toISOString().slice(0, 16) : '',
        customService: customSvc,
        customSource: customSrc,
        note: actualNote
      });
      setPatientSearch(app.patient?.name || '');
      setEditingId(app.id);
    } else {
      setFormData({ status: 'SCHEDULED', type: activeTab, service: 'CLEANING', source: 'WALKIN', revenue: 0, note: '' });
      setPatientSearch('');
      setEditingId(null);
    }
    setIsOpenModal(true);
  };

  const handleSubmit = async () => {
    // 1. Chuẩn bị payload (giữ nguyên logic của bạn)
    if (isSaving) return; 
    
    setIsSaving(true);
    try {

    const baseNote = (formData.note || '').split('|')[0];
    const servicePart = formData.service === 'OTHER' ? `|DV:${formData.customService || ''}` : '';
    const sourcePart = formData.source === 'OTHER' ? `|NG:${formData.customSource || ''}` : '';
    const finalNote = `${baseNote}${servicePart}${sourcePart}`;
    const finalType = formData.status === 'DONE' ? AppointmentType.FOLLOW_UP : (formData.type || AppointmentType.SCHEDULE_VISIT);

    const payload = { 
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId || 0),
        staffId: formData.staffId ? Number(formData.staffId) : null,
        appointmentTime: new Date(formData.appointmentTime).toISOString(),
        revenue: Number(formData.revenue || 0),
        note: finalNote,
        status: formData.status,
        type: finalType,
        service: formData.service,
        source: formData.source,
        saleNote: formData.saleNote
    };

    if (editingId) {
            await api.patch(`/appointments/${editingId}`, payload);
        } else {
            await api.post('/appointments', payload);
        }

        setIsOpenModal(false);
        await new Promise(resolve => setTimeout(resolve, 300));
        await fetchData();
        
        if (finalType !== activeTab) {
            setActiveTab(finalType);
        }

    } catch (e: any) { 
        alert("Lỗi lưu dữ liệu: " + (e.response?.data?.message || "Kiểm tra lại thông tin!")); 
        console.error(e);
    } finally {
      setIsSaving(false);
    }
};
  
  const handleStatusChange = (newStatus: string) => {
    if (isReadOnly) return;
    setFormData((prev: any) => {
      const updatedData = { ...prev, status: newStatus };
      if (newStatus === 'DEPOSITED') { 
        updatedData.type = AppointmentType.PROCEDURE; 
      }
      return updatedData;
    });
  };

  if (isLoading) return <div>Đang tải...</div>;
  if (!user) return null;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Lịch Hẹn</h1>
        {(isAdmin || (isReception && activeTab !== AppointmentType.PROCEDURE && activeTab !== 'FOLLOW_UP')) && (
          <button onClick={() => openModal(null)} className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition">+ Đặt lịch mới</button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        {Object.entries(TypeLabels).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`px-4 py-2 rounded-lg font-bold ${activeTab === key ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-4 mb-4 bg-white p-4 rounded-xl border">
        <input type="date" className="p-2 border rounded-lg" onChange={e => setFilters({...filters, date: e.target.value})} />
        {activeTab !== AppointmentType.PROCEDURE && activeTab !== 'FOLLOW_UP' && (
          <select className="p-2 border rounded-lg" onChange={e => setFilters({...filters, status: e.target.value})}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(StatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        )}
        <input type="text" placeholder="Tìm tên khách..." className="p-2 border rounded-lg flex-1" onChange={e => setFilters({...filters, name: e.target.value})} />
      </div>

      <div className="bg-white shadow rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white uppercase text-xs">
  <tr>
    {/* 1. Nhóm cố định luôn hiện */}
    <th className="p-4">Thời gian</th>
    <th className="p-4">Khách</th>
    <th className="p-4">SĐT</th>

    {/* 2. Nhóm cột ẩn theo Tab (Không phải Tái khám) */}
    {!isFollowUp && (
      <>
        <th className="p-4">Nguồn</th>
        <th className="p-4">Tình trạng</th>
        <th className="p-4">Telesale</th>
        <th className="p-4">Dịch vụ</th>
      </>
    )}

    {/* 3. Nhóm cột Bác sĩ & Trạng thái (luôn hiện) */}
    <th className="p-4">Bác sĩ</th>
    <th className="p-4">Trạng thái</th>

    {/* 4. Nhóm cột chỉ hiện ở tab Procedure (Thực hiện) */}
    {activeTab === AppointmentType.PROCEDURE && !isFollowUp && (
      <>
        <th className="p-4">Sale Note</th>
        <th className="p-4">Doanh thu</th>
      </>
    )}

    {/* 5. Nhóm cố định cuối */}
    <th className="p-4">Bệnh án</th>
    <th className="p-4">Hành động</th>
  </tr>
</thead>
          <tbody className="divide-y">
  {filteredAppointments.map((a: any) => (
    <tr key={a.id} className="border-b hover:bg-gray-50">
      {/* 1. Nhóm cố định */}
      <td className="p-4">{new Date(a.appointmentTime).toLocaleString('vi-VN')}</td>
      <td className="p-4 font-bold">{a.patient?.name}</td>
      <td className="p-4">{a.patient?.phone || '-'}</td>

      {/* 2. Nhóm cột ẩn theo Tab (Phải khớp với Header) */}
      {!isFollowUp && (
        <>
          <td className="p-4">{SourceLabels[a.source as keyof typeof SourceLabels] || 'Khác'}</td>
          <td className="p-4">{a.note?.split('|')[0]}</td>
          <td className="p-4">{data.staffs.find((s: any) => s.id === a.staffId)?.name || '-'}</td>
          <td className="p-4">{ServiceLabels[a.service as keyof typeof ServiceLabels] || 'Khác'}</td>
        </>
      )}

      {/* 3. Nhóm cố định */}
      <td className="p-4">{data.doctors.find((d: any) => d.id === a.doctorId)?.name || '-'}</td>
      <td className="p-4"><span className="px-2 py-1 rounded bg-gray-100">{StatusLabels[a.status as keyof typeof StatusLabels]}</span></td>

      {/* 4. Nhóm cột Procedure (Phải khớp với Header) */}
      {activeTab === AppointmentType.PROCEDURE && !isFollowUp && (
        <>
          <td className="p-4">{a.saleNote || '-'}</td>
          <td className="p-4">{a.revenue?.toLocaleString()}đ</td>
        </>
      )}

      {/* 5. Nhóm cố định cuối */}
      <td className="p-4">
        <a href={`/medical-record/create?appointmentId=${a.id}`} className="text-blue-600 font-bold underline">+ Bệnh án</a>
      </td>
      {/* Cột Hành động - Phân quyền động */}
<td className="p-4 text-center">
  <div className="flex justify-center gap-2">
    {canEdit ? (
      <>
        {/* Nút Sửa */}
        <button 
          onClick={() => openModal(a)} 
          className="text-blue-600 font-bold hover:underline"
        >
          Sửa
        </button>
        
        {/* Nút Xóa (Chỉ cho Sửa thì mới cho Xóa) */}
        <button 
          onClick={() => handleDelete(a.id)} 
          className="text-red-600 font-bold hover:underline"
        >
          Xóa
        </button>
      </>
    ) : (
      /* Nút Xem (Dành cho người không có quyền sửa) */
      <button 
        onClick={() => openModal(a)} 
        className="text-gray-600 font-bold underline"
      >
        Xem
      </button>
    )}
  </div>
</td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
      
      {isOpenModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
    <div className="bg-white p-6 rounded-3xl w-[600px] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold">
        {editingId ? (isReadOnly ? 'Xem lịch hẹn' : 'Sửa lịch hẹn') : 'Đặt lịch mới'}
      </h2>

      {(() => {
        // Chỉ ẩn Sale Note & Doanh thu ở tab Lịch hẹn
        const isScheduleTab = activeTab === AppointmentType.SCHEDULE_VISIT; 
        const inputClass = `w-full p-3 border rounded-xl transition ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`;
        const labelClass = "text-sm font-semibold text-gray-700";

        return (
          <div className="space-y-4">
            {/* Hàng 1: Thời gian & Trạng thái */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Thời gian</label>
                <input disabled={isReadOnly} type="datetime-local" className={inputClass} value={formData.appointmentTime || ''} onChange={e => setFormData({...formData, appointmentTime: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Trạng thái</label>
                <select disabled={isReadOnly} className={inputClass} value={formData.status || ''} onChange={(e) => handleStatusChange(e.target.value)}>
                  {Object.entries(StatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            {/* Hàng 2: Khách hàng & Bác sĩ */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 relative">
                <label className={labelClass}>Khách hàng</label>
                <input disabled={isReadOnly} className={inputClass} placeholder="Tìm tên..." value={patientSearch} onChange={e => { if(!isReadOnly) { setPatientSearch(e.target.value); setShowPatientDropdown(true); }}} />
                {!isReadOnly && showPatientDropdown && (
                  <div className="absolute z-50 bg-white border rounded-xl shadow-lg w-full max-h-40 overflow-y-auto mt-1">
                    {filteredPatients.map((p:any) => <div key={p.id} className="p-2 cursor-pointer hover:bg-gray-100" onClick={() => { setFormData({...formData, patientId: p.id}); setPatientSearch(p.name); setShowPatientDropdown(false); }}>{p.name}</div>)}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Bác sĩ</label>
                <select disabled={isReadOnly} className={inputClass} value={formData.doctorId || ''} onChange={e => setFormData({...formData, doctorId: e.target.value})}>
                  <option value="">-- Chọn bác sĩ --</option>
                  {data.doctors.map((d:any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            {/* Hàng 3: Telesale, Dịch vụ, Nguồn */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className={labelClass}>Telesale</label>
                <select disabled={isReadOnly} className={inputClass} value={formData.staffId || ''} onChange={e => setFormData({...formData, staffId: e.target.value ? Number(e.target.value) : null})}>
                  <option value="">-- Chọn --</option>
                  {data.staffs.filter((s:any) => s.department === Department.TELE_SALE).map((s:any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                 <label className={labelClass}>Dịch vụ</label>
                 <select disabled={isReadOnly} className={inputClass} value={formData.service || ''} onChange={e => setFormData({...formData, service: e.target.value})}>
                    {Object.entries(ServiceLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    <option value="OTHER">Khác</option>
                 </select>
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Nguồn</label>
                <select disabled={isReadOnly} className={inputClass} value={formData.source || ''} onChange={e => setFormData({...formData, source: e.target.value})}>
                  <option value="ADS">ADS</option>
                  <option value="SEEDING">Seeding</option>
                  <option value="WALKIN">Vãng lai</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            {/* Hàng 4: Tình trạng (Note) */}
            <div className="space-y-1">
              <label className={labelClass}>Tình trạng</label>
              <textarea disabled={isReadOnly} className={inputClass} rows={2} value={formData.note || ''} onChange={e => setFormData({...formData, note: e.target.value})} />
            </div>

            {/* PHẦN NÂNG CAO: Chỉ hiện khi KHÔNG phải tab Lịch hẹn */}
            {!isScheduleTab && (
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-dashed">
                <div className="space-y-1 col-span-2">
                  <label className={labelClass}>Sale Note (Nội bộ)</label>
                  <textarea disabled={isReadOnly} className={inputClass} rows={2} value={formData.saleNote || ''} onChange={e => setFormData({...formData, saleNote: e.target.value})} />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className={labelClass}>Doanh thu dự kiến</label>
                  <input disabled={isReadOnly} type="number" className={inputClass} value={formData.revenue ?? ''} onChange={e => setFormData({...formData, revenue: e.target.value})} />
                </div>
              </div>
            )}
          </div>
        );
      })()}

      <div className="flex gap-2 pt-4">
        <button onClick={() => setIsOpenModal(false)} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold">Hủy</button>
        {!isReadOnly && (
          <button onClick={handleSubmit} disabled={isSaving} className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white">
            {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}