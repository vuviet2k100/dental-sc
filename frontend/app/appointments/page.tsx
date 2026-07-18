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

  // --- STATE ---
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState<any>({ appointments: [], patients: [], doctors: [], staffs: [] });
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false); // Đã thêm
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [activeTab, setActiveTab] = useState<string>(AppointmentType.SCHEDULE_VISIT);
  const [filters, setFilters] = useState({ date: '', status: '', name: '' });
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  // --- LOGIC QUYỀN ---
  const isAdmin = user?.role === 'ADMIN';
  const isReception = user?.department === 'RECEPTION';
  const isFollowUp = activeTab === AppointmentType.FOLLOW_UP; 


  const canEdit = useMemo(() => {
    if (isAdmin) return true;
    const dep = user?.department;
    if (activeTab === AppointmentType.SCHEDULE_VISIT) return dep === Department.TELE_SALE;
    if (activeTab === AppointmentType.PROCEDURE) return isReception;
    if (activeTab === AppointmentType.FOLLOW_UP) return isReception;   
    return false;
}, [activeTab, isAdmin, isReception, user?.department]);

const canCreate = useMemo(() => {
  // Logic: Chỉ Admin hoặc Telesale mới có quyền đặt lịch
  // Và chỉ được đặt lịch khi đang ở tab Lịch hẹn (Schedule)
  const isTeleSale = user?.department === Department.TELE_SALE;
  return (isAdmin || isTeleSale) && activeTab === AppointmentType.SCHEDULE_VISIT;
}, [isAdmin, user?.department, activeTab]);

// --- CÁC HÀM XỬ LÝ ---
  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
  }, [user, isLoading, router]);

  useEffect(() => {
  setFilters({ date: '', status: '', name: '' });
  setPatientSearch('');
}, [activeTab]);


 
// Biến này để khóa các input trong Modal
//const isReadOnly = !canEdit;

const fetchData = useCallback(async () => {
  if (!user) return; 
  try {
    // Nên kiểm tra xem API của ông có cần gửi thêm activeTab không
    // Nếu API /appointments trả về tất cả, thì không sao. 
    // Nhưng nên thêm activeTab vào dependency nếu dữ liệu thay đổi theo tab.
    const [app, p, d, s] = await Promise.all([
      api.get(`/appointments`).then(res => res.data),
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
  } catch (e: any) { 
    console.error("Lỗi fetch:", e);
    // Tránh dùng alert nếu lỗi xảy ra liên tục (gây khó chịu cho user)
  }
}, [user]); // Nếu dữ liệu lịch hẹn thay đổi theo tab, hãy đổi thành [user, activeTab]

useEffect(() => { 
  if (!isLoading && user) fetchData(); 
}, [fetchData, isLoading, user]); // fetchData nằm trong dependency
  

const filteredPatients = useMemo(() => {
    return data.patients.filter((p: any) => p.name.toLowerCase().includes(patientSearch.toLowerCase()));
  }, [data.patients, patientSearch]);

  const filteredAppointments = useMemo(() => {
    return data.appointments.filter((a: any) => {
      const matchType = a.type === activeTab;
      const matchName = a.patient?.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchStatus = filters.status === '' || a.status === filters.status;
      const datePart = new Date(a.appointmentTime).toISOString().split('T')[0];
      const matchDate = filters.date === '' || datePart === filters.date;
        //(a.appointmentTime ? a.appointmentTime.split('T')[0] === filters.date : false);      
        
      return matchType && matchName && matchStatus && matchDate;
    });
  }, [data.appointments, filters, activeTab]);

  const handleReset = () => {
  setFilters({ date: '', status: '', name: '' });
  // Thêm dòng này nếu ông muốn reset luôn input date trên UI
  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput) (dateInput as HTMLInputElement).value = '';
};

  const handleDelete = async (id: number) => {
    if (confirm("Xóa lịch hẹn này?")) {
      try {
        await api.delete(`/appointments/${id}`);
        fetchData();
      } catch (e) { alert("Không thể xóa"); }
    }
  };

  const openModal = (app: any | null) => {
    const isAuthorized = !app || isAdmin || canEdit;
    const isOtherService = !Object.keys(ServiceLabels).includes(app?.service || 'CLEANING');
    const isOtherSource = !Object.keys(SourceLabels).includes(app?.source || 'WALKIN');
    setIsReadOnly(!isAuthorized);
    if (app) {
      const formatForInput = (isoDate: string) => {
        const date = new Date(isoDate);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
      };
      const noteParts = app.note?.split('|') || [];
      const customSvc = noteParts.find((n: string) => n.startsWith('DV:'))?.replace('DV:', '') || '';
      const customSrc = noteParts.find((n: string) => n.startsWith('NG:'))?.replace('NG:', '') || '';
      const actualNote = noteParts.find((n: string) => !n.startsWith('DV:') && !n.startsWith('NG:')) || app.note;
      
      const staff = data.staffs.find((s: any) => s.id === app.staffId);
      const isTele = staff?.department === Department.TELE_SALE;
      
      setFormData({ 
        ...app, 
        staffId: isTele ? app.staffId : '',
        appointmentTime: app.appointmentTime ? formatForInput(app.appointmentTime) : '',
        service: isOtherService ? 'OTHER' : (app.service || 'CLEANING'),
        customService: isOtherService ? app.service : '',
        source: isOtherSource ? 'OTHER' : (app.source || 'WALKIN'),
        customSource: isOtherSource ? app.source : '',
        note: actualNote,
        saleNote: app.saleNote || '', 
        revenue: app.revenue || 0,
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
    const formattedDate = new Date(formData.appointmentTime).toISOString();
    
    const payload = { 
        patientId: Number(formData.patientId),
        doctorId: Number(formData.doctorId || 0),
        staffId: formData.staffId ? Number(formData.staffId) : null,
        appointmentTime: formattedDate,
        revenue: Number(formData.revenue || 0),
        note: finalNote,
        status: formData.status,
        type: finalType,
        service: formData.service,
        source: formData.source,
        saleNote: formData.saleNote || '',
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

      // Hành động 1: Chuyển sang tab Thực hiện khi có đặt cọc
      if (newStatus === 'DEPOSITED') { 
        updatedData.type = AppointmentType.PROCEDURE; 
      } 
      // Hành động 2: Chuyển sang tab Tái khám khi hoàn thành
      else if (newStatus === 'DONE') {
        updatedData.type = AppointmentType.FOLLOW_UP;
      }
      else {
        updatedData.type = AppointmentType.SCHEDULE_VISIT;
      }
      return updatedData;
    });
  };

  const STATUS_COLORS: Record<string, string> = {
  WAITING: 'bg-white-50 border-white-200', // Chưa chốt - màu nền mặc định
  SCHEDULED: 'bg-purple-50 border-purple-200', // Đã đặt lịch - tím
  DEPOSITED: 'bg-yellow-50 border-yellow-200', // Đã đặt cọc - vàng
  DONE: 'bg-green-50 border-green-200',        // Hoàn thành - xanh
  CANCELLED: 'bg-red-50 border-red-200',       // Đã hủy - đỏ
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  WAITING: 'text-gray-700',
  SCHEDULED: 'text-purple-700',
  DEPOSITED: 'text-yellow-700',
  DONE: 'text-green-700',
  CANCELLED: 'text-red-700',
};

  if (isLoading) return <div>Đang tải...</div>;
  if (!user) return null;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Lịch Hẹn</h1>
        {canCreate && (
          <button 
            onClick={() => openModal(null)} 
            className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition"
          >
            + Đặt lịch mới
          </button>
        )}
      </div>

      <div className="flex gap-4 mb-6">
        {Object.entries(TypeLabels).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`px-4 py-2 rounded-lg font-bold ${activeTab === key ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        {/* Lọc theo ngày */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Ngày:</label>
          <input 
            type="date" 
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            value={filters.date}
            onChange={e => setFilters({...filters, date: e.target.value})} 
          />
        </div>

        {/* Lọc theo trạng thái */}
        {activeTab !== AppointmentType.PROCEDURE && activeTab !== AppointmentType.FOLLOW_UP && (
          <select 
            className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value})}
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(StatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        )}

        {/* Tìm kiếm */}
        <input 
          type="text" 
          placeholder="Tìm tên khách..." 
          className="p-2 border rounded-lg flex-1 min-w-[200px] focus:ring-2 focus:ring-blue-500 outline-none" 
          value={filters.name}
          onChange={e => setFilters({...filters, name: e.target.value})} 
        />

        {/* Nút Reset */}
        <button 
          onClick={() => setFilters({ date: '', status: '', name: '' })}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
        >
          Reset
        </button>
      </div>

      <div className="bg-white shadow rounded-xl border overflow-x-auto">
        <table className="w-full text-sm table-auto border-collapse">
          <thead className="bg-gray-800 text-white uppercase text-xs">
              <tr>
                {/* 1. Nhóm cố định luôn hiện */}
                <th className="p-4 text-center min-w-[5px]">Thời gian</th>
                <th className="p-4 text-center min-w-[150px]">Khách hàng</th>
                <th className="p-4 text-center min-w-[8px]">Nguồn</th>
                {/* 2. Nhóm cột hiện theo Tab (Không phải Tái khám) */}
                {!isFollowUp && (
                  <>
                    <th className="p-4 text-center min-w-[200px]">Tình trạng</th>
                    <th className="p-4 text-center min-w-[80px]">Dịch vụ</th>
                  </>
                )}

                {/* 3. Nhóm Nhân sự & Trạng thái (luôn hiện) */}
                <th className="p-4 text-center min-w-[150px]">Telesale</th>
                <th className="p-4 text-center min-w-[150px]">Bác sĩ</th>
                <th className="p-4 text-center min-w-[120px]">Trạng thái</th>
                

                {/* 4. Nhóm cột chỉ hiện ở tab Procedure (Thực hiện) & Tái khám */}
                {(activeTab === AppointmentType.PROCEDURE || 
                activeTab === AppointmentType.FOLLOW_UP) && (
                  <>
                    <th className="p-4 text-center min-w-[200px]">Sale Note</th>
                    <th className="p-4 text-center min-w-[100px]">Doanh thu</th>
                    <th className="p-4 text-center min-w-[100px]">Bệnh án</th>

                  </>
                )}
                {/* 5. Nhóm cố định cuối */}
                <th className="p-4 text-center min-w-[100px]">Hành động</th>
              </tr>
            </thead>
          <tbody className="divide-y">
          {filteredAppointments.map((a: any) => (
            <tr key={a.id} className={`${STATUS_COLORS[a.status as keyof typeof STATUS_COLORS] || 'bg-white'} border-b hover:opacity-90 transition`}>
              {/* 1. Nhóm cố định */}
              <td className="p-4 whitespace-normal">{new Date(a.appointmentTime).toLocaleString('vi-VN')}</td>
              <td className="p-4 whitespace-normal">
                <div className="flex flex-col">
                  <span className="text-center font-bold">{a.patient?.name || '-'}</span>
                  <span className="text-gray-500 text-center">{a.patient?.phone || '-'}</span>
                </div>
              </td>
              <td className="p-4 text-center whitespace-normal">{SourceLabels[a.source as keyof typeof SourceLabels]}</td>

              {/* 2. Nhóm cột ẩn theo Tab (Phải khớp với Header) */}
              {!isFollowUp && (
                <>
                  <td className="p-4 whitespace-normal">{a.note?.split('|')[0]}</td>
                  <td className="p-4 text-center whitespace-normal">{ServiceLabels[a.service as keyof typeof ServiceLabels]}</td>
                </>
              )}

              {/* 3. Nhóm cố định */}
              <td className="p-4 text-center whitespace-normal">{data.staffs.find((s: any) => s.id === a.staffId)?.name || '-'}</td>
              <td className="p-4 text-center whitespace-normal">{data.doctors.find((d: any) => d.id === a.doctorId)?.name || '-'}</td>
              <td className="p-4 font-semibold">
                <span className={`px-2 py-1 rounded-full text-xs border ${STATUS_TEXT_COLORS[a.status]}`}>
                  {StatusLabels[a.status as keyof typeof StatusLabels]}
                </span>
              </td>

              {/* 4. Nhóm cột Procedure (Chỉ hiện khi ở tab Thực hiện) */}
              {(activeTab === AppointmentType.PROCEDURE || 
              activeTab === AppointmentType.FOLLOW_UP) && (
                <>
                  <td className="p-4 whitespace-normal">{a.saleNote || '-'}</td>
                  <td className="p-4 text-right taburlar-nums font-semibold text-blue-600">
                    {Number(a.revenue || 0).toLocaleString('vi-VN')}            
                  </td>
                  <td className="p-4 text-center">
                    {(() => {
                      // 1. Kiểm tra quyền
                      const isAuthorized = isAdmin || Number(user?.id) === Number(a.doctorId);
                      if (!isAuthorized) return <span className="text-gray-400 text-xs">-</span>;
                      
                      // 2. Logic điều hướng thông minh
                      return (
                        <button 
                          onClick={() => {
                            if (a.medicalRecord) {
                              // NẾU ĐÃ CÓ: Đẩy sang trang chi tiết bệnh án (Xem/Sửa)
                              // Giả sử đường dẫn xem chi tiết là /medical-record/view/:id
                              router.push(`/medical-record/${a.medicalRecord.id}`);
                            } else {
                              // NẾU CHƯA CÓ: Đẩy sang trang tạo mới
                              router.push(`/medical-record/create?appointmentId=${a.id}`);
                            }
                          }}
                          className={`font-bold hover:underline ${a.medicalRecord ? "text-green-600" : "text-blue-600"}`}
                        >
                          {a.medicalRecord ? "Xem bệnh án" : "Tạo/Gắn bệnh án"}
                        </button>
                      );
                    })()}
                  </td>
                </>
              )}

              {/* 5. Cột Hành động - Phân quyền động */}
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
                              <select disabled={isReadOnly} className={inputClass} value={formData.service || ''} 
                              onChange={e => setFormData({...formData, service: e.target.value})}>
                                  {Object.entries(ServiceLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                  <option value="OTHER"></option>
                              </select>
                              {formData.service === 'OTHER' && (
                                <input disabled={isReadOnly} className={`${inputClass} mt-2 border-blue-500`} 
                                  placeholder="Nhập tên dịch vụ khác" value={formData.customService || ''} 
                                  onChange={e => setFormData({...formData, customService: e.target.value})} />
                              )}
                            </div>
                            <div className="space-y-1">
                              <label className={labelClass}>Nguồn</label>
                              <select disabled={isReadOnly} className={inputClass} value={formData.source || ''} onChange={e => setFormData({...formData, source: e.target.value})}>
                                {Object.entries(SourceLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                <option value="OTHER"></option>
                              </select>
                              {formData.source === 'OTHER' && (
                                <input disabled={isReadOnly} className={`${inputClass} mt-2 border-blue-500`} 
                                  placeholder="Nhập nguồn khác" value={formData.customSource || ''} 
                                  onChange={e => setFormData({...formData, customSource: e.target.value})} />
                              )}
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
                                <input disabled={isReadOnly} type="text" 
                                className={inputClass} 
                                value={formData.revenue ? Number(formData.revenue).toLocaleString('vi-VN') : ''} 
                                  onChange={e => {
                                    // 1. Lấy giá trị thô, loại bỏ sạch dấu chấm và chữ
                                    const rawValue = e.target.value.replace(/\D/g, '');
                                    // 2. Chuyển thành số thực sự (Number)
                                    const numericValue = rawValue ? parseInt(rawValue, 10) : 0;
                                    // 3. Cập nhật state
                                    setFormData({...formData, revenue: numericValue});
                                }} />
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