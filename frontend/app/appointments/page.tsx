'use client';

import { useEffect, useState } from 'react';
import { staffService, userService } from '@/services/api';
import { api } from '@/app/lib/axios';

export default function AppointmentsPage() {
  const [data, setData] = useState<any>({ appointments: [], patients: [], doctors: [], staffs: [] });
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});
  
  const [isOtherService, setIsOtherService] = useState(false);
  const [isOtherSource, setIsOtherSource] = useState(false);

  const statusMap: any = { SCHEDULED: "Đặt lịch", DEPOSITED: "Đã cọc", DONE: "Đã làm dịch vụ", CANCELLED: "Đã hủy", FAILED: "Không đến" };
  const serviceLabels: any = { CLEANING: "Tẩy trắng", IMP: "Implant", CERAMIC: "Răng sứ" };
  const sourceLabels: any = { ADS: "Ads", SEEDING: "Seeding", WALKIN: "Vãng lai", REFERRAL: "Giới thiệu" };

  const fetchData = async () => {
    try {
      const [app, p, d, s] = await Promise.all([
        staffService.getAllAppointments(),
        staffService.getAllPatients(),
        userService.getAll('DOCTOR'),
        userService.getAll('STAFF')
      ]);
      setData({ appointments: app.data || [], patients: p.data || [], doctors: d.data || [], staffs: s.data || [] });
    } catch (e) { alert("Lỗi tải dữ liệu"); }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (app: any | null) => {
    if (app) {
      const noteParts = app.note?.split('|') || [];
      const serviceVal = noteParts.find((n: string) => n.startsWith('DV:'))?.replace('DV:', '') || '';
      const sourceVal = noteParts.find((n: string) => n.startsWith('NG:'))?.replace('NG:', '') || '';

      setFormData({
        ...app,
        patientId: app.patientId || '',
        doctorId: app.doctorId || '',
        staffId: app.staffId || '',
        appointmentTime: app.appointmentTime ? new Date(app.appointmentTime).toISOString().slice(0, 16) : '',
        customService: serviceVal,
        customSource: sourceVal
      });
      setIsOtherService(app.service === 'OTHER');
      setIsOtherSource(app.source === 'OTHER');
      setEditingId(app.id);
    } else {
      setFormData({ status: 'SCHEDULED', source: 'WALKIN', revenue: 0, service: 'CLEANING', patientId: '', doctorId: '', staffId: '', customService: '', customSource: '' });
      setIsOtherService(false);
      setIsOtherSource(false);
      setEditingId(null);
    }
    setIsOpenModal(true);
  };

  const handleSubmit = async () => {
    // Chỉ gửi các trường hợp lệ, bỏ qua các object {connect...} nếu Backend báo lỗi Validation
    const payload = {
      patientId: Number(formData.patientId),
      doctorId: Number(formData.doctorId),
      staffId: formData.staffId ? Number(formData.staffId) : null,
      appointmentTime: new Date(formData.appointmentTime).toISOString(),
      status: formData.status,
      revenue: Number(formData.revenue || 0),
      service: isOtherService ? 'OTHER' : formData.service,
      source: isOtherSource ? 'OTHER' : formData.source,
      note: `${isOtherService ? 'DV:' + formData.customService + '|' : ''}${isOtherSource ? 'NG:' + formData.customSource : ''}`
    };

    try {
      if (editingId) await api.patch(`/appointments/${editingId}`, payload);
      else await api.post('/appointments', payload);
      setIsOpenModal(false);
      fetchData();
    } catch (e: any) { 
      alert("Lỗi lưu: " + (e.response?.data?.message || "Kiểm tra lại dữ liệu")); 
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Xóa lịch hẹn này?")) {
      await api.delete(`/appointments/${id}`);
      fetchData();
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Lịch Hẹn</h1>
        <button onClick={() => openModal(null)} className="bg-blue-600 text-white px-6 py-2 rounded-xl">+ Đặt lịch mới</button>
      </div>

      <div className="bg-white shadow rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-800 text-white uppercase text-xs">
            <tr>
              <th className="p-4">Thời gian</th><th className="p-4">Khách</th>
              <th className="p-4">Dịch vụ</th><th className="p-4">Nguồn</th>
              <th className="p-4">Bác sĩ</th><th className="p-4">Trạng thái</th>
              <th className="p-4">Doanh thu</th><th className="p-4">Bệnh án</th><th className="p-4">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.appointments.map((a: any) => {
              const noteParts = a.note?.split('|') || [];
              const svc = a.service === 'OTHER' ? noteParts.find((n:string) => n.startsWith('DV:'))?.replace('DV:','') : serviceLabels[a.service];
              const src = a.source === 'OTHER' ? noteParts.find((n:string) => n.startsWith('NG:'))?.replace('NG:','') : sourceLabels[a.source];
              return (
                <tr key={a.id}>
                  <td className="p-4">{new Date(a.appointmentTime).toLocaleString('vi-VN')}</td>
                  <td className="p-4 font-bold">{a.patient?.name}</td>
                  <td className="p-4">{svc || a.service}</td>
                  <td className="p-4">{src || a.source}</td>
                  <td className="p-4">{a.doctor?.name}</td>
                  <td className="p-4 font-semibold">{statusMap[a.status]}</td>
                  <td className="p-4">{a.revenue?.toLocaleString()}đ</td>
                  <td className="p-4">
                    {a.status === 'DONE' && (
                      <a 
  href={`/medical-record/create?appointmentId=${a.id}&patientId=${a.patient?.id}&doctorId=${a.doctor?.id}&patientName=${a.patient?.name}&doctorName=${a.doctor?.name}`}
  className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-700"
>
  + Bệnh án
</a>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <button onClick={() => openModal(a)} className="text-blue-600 mr-2 font-bold">Sửa</button>
                    <button onClick={() => handleDelete(a.id)} className="text-red-500 font-bold">Xóa</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isOpenModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-3xl w-[500px] shadow-2xl space-y-3 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Sửa lịch hẹn' : 'Đặt lịch mới'}</h2>
            
            <select className="w-full p-3 border rounded-xl" value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})}>
              <option value="">-- Chọn Khách --</option>
              {data.patients.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>

            <input type="datetime-local" className="w-full p-3 border rounded-xl" value={formData.appointmentTime} onChange={e => setFormData({...formData, appointmentTime: e.target.value})} />

            <div className="grid grid-cols-2 gap-2">
              <select className="p-3 border rounded-xl" value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})}>
                <option value="">-- Bác sĩ --</option>
                {data.doctors.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select className="p-3 border rounded-xl" value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})}>
                <option value="">-- Tư vấn --</option>
                {data.staffs.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <select className="w-full p-3 border rounded-xl" value={isOtherService ? 'OTHER' : formData.service} onChange={e => {
              if(e.target.value === 'OTHER') { setIsOtherService(true); setFormData({...formData, service: 'OTHER'}); }
              else { setIsOtherService(false); setFormData({...formData, service: e.target.value}); }
            }}>
              <option value="CLEANING">Tẩy trắng</option><option value="IMP">Implant</option><option value="CERAMIC">Răng sứ</option><option value="OTHER">Khác</option>
            </select>
            {isOtherService && <input className="w-full p-3 border rounded-xl" placeholder="Tên dịch vụ..." value={formData.customService} onChange={e => setFormData({...formData, customService: e.target.value})} />}

            <select className="w-full p-3 border rounded-xl" value={isOtherSource ? 'OTHER' : formData.source} onChange={e => {
              if(e.target.value === 'OTHER') { setIsOtherSource(true); setFormData({...formData, source: 'OTHER'}); }
              else { setIsOtherSource(false); setFormData({...formData, source: e.target.value}); }
            }}>
              <option value="ADS">Ads</option><option value="SEEDING">Seeding</option><option value="WALKIN">Vãng lai</option><option value="OTHER">Khác</option>
            </select>
            {isOtherSource && <input className="w-full p-3 border rounded-xl" placeholder="Tên nguồn..." value={formData.customSource} onChange={e => setFormData({...formData, customSource: e.target.value})} />}

            <select className="w-full p-3 border rounded-xl" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="SCHEDULED">Đặt lịch</option><option value="DEPOSITED">Đã cọc</option>
              <option value="DONE">Đã làm dịch vụ</option><option value="CANCELLED">Đã hủy</option>
              <option value="FAILED">Không đến</option>
            </select>

            {editingId && <input type="number" className="w-full p-3 border rounded-xl" placeholder="Doanh thu" value={formData.revenue} onChange={e => setFormData({...formData, revenue: e.target.value})} />}

            <div className="flex gap-2 pt-4">
              <button onClick={() => setIsOpenModal(false)} className="flex-1 py-3 bg-gray-200 rounded-xl font-bold">Hủy</button>
              <button onClick={handleSubmit} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold">Lưu lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}