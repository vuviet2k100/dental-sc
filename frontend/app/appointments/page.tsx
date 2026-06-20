'use client';
import { useEffect, useState } from 'react';
import { staffService, userService } from '@/services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { api } from '@/app/lib/axios'

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  
  const [formData, setFormData] = useState({ 
    patientId: '', doctorId: '', appointmentTime: new Date(), status: 'WAITING', note: '' 
  });
  
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [appRes, pRes, dRes] = await Promise.all([
        staffService.getAllAppointments(),
        staffService.getAllPatients(),
        userService.getAll('DOCTOR')
      ]);
      setAppointments(appRes.data || []);
      setPatients(pRes.data || []);
      setDoctors(dRes.data || []);
    } catch (error) { console.error("Lỗi:", error); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { 
    setRole(localStorage.getItem('user_role'));
    fetchData(); 
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa lịch hẹn này không?")) {
      try {
        await api.delete(`/appointments/${id}`);
        fetchData();
      } catch (e) { alert("Không thể xóa lịch hẹn!"); }
    }
  };

  const handleSubmit = async () => {
    const payload = {
      patientId: parseInt(formData.patientId),
      doctorId: parseInt(formData.doctorId),
      appointmentTime: formData.appointmentTime.toISOString(),
      status: formData.status,
      note: formData.note,
      staffId: parseInt(localStorage.getItem('user_id') || '0')
    };

    if (isNaN(payload.patientId) || isNaN(payload.doctorId)) return alert("Vui lòng chọn đầy đủ!");

    try {
      if (editingId) await api.patch(`/appointments/${editingId}`, payload);
      else await api.post('/appointments', payload);
      setIsOpenModal(false);
      fetchData();
    } catch (e: any) { alert(e.response?.data?.message || "Lỗi!"); }
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const matchesDate = !filterDate || new Date(a.appointmentTime).toDateString() === filterDate.toDateString();
    return matchesStatus && matchesDate;
  });

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black">Quản lý lịch hẹn</h2>
        <button onClick={() => { setEditingId(null); setFormData({ patientId: '', doctorId: '', appointmentTime: new Date(), status: 'WAITING', note: '' }); setIsOpenModal(true); }} className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700">
          + Thêm mới
        </button>
      </div>

      <div className="flex gap-4 mb-6 bg-white p-4 rounded-xl border items-center">
        <DatePicker selected={filterDate} onChange={(date: Date | null) => setFilterDate(date)} placeholderText="Lọc theo ngày" className="p-2 border rounded-lg" isClearable />
        <select className="p-2 border rounded-lg" onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="ALL">Tất cả trạng thái</option>
          <option value="WAITING">Chờ khám</option>
          <option value="IN_PROGRESS">Đã xác nhận</option>
          <option value="DONE">Đã xong</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
      </div>

      <table className="w-full bg-white rounded-2xl shadow-sm border overflow-hidden">
        <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
          <tr>
            <th className="p-4 text-left">Bệnh nhân</th>
            <th className="p-4 text-left">Bác sĩ</th>
            <th className="p-4 text-left">Thời gian</th>
            <th className="p-4 text-center">Trạng thái</th>
            <th className="p-4 text-left">Ghi chú</th>
            <th className="p-4 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filteredAppointments.map((item: any) => (
            <tr key={item.id}>
              <td className="p-4">{item.patient?.name}</td>
              <td className="p-4">{item.doctor?.name}</td>
              <td className="p-4">{new Date(item.appointmentTime).toLocaleString()}</td>
              <td className="p-4 text-center"><span className="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">{item.status}</span></td>
              <td className="p-4 text-sm italic text-gray-500">{item.note || '---'}</td>
              <td className="p-4 text-center space-x-2">
                {/* Link sang trang tạo bệnh án khi trạng thái là IN_PROGRESS */}
                {item.status === 'IN_PROGRESS' && (
                  <a 
                    href={`/medical-record/create?patientId=${item.patientId}&doctorId=${item.doctorId}&appointmentId=${item.id}&patientName=${encodeURIComponent(item.patient?.name || '')}&doctorName=${encodeURIComponent(item.doctor?.name || '')}`}
                    className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700"
                    >
                  Khám bệnh
                  </a>
                )}
                <button onClick={() => { setEditingId(item.id); setFormData({ patientId: item.patientId.toString(), doctorId: item.doctorId.toString(), appointmentTime: new Date(item.appointmentTime), status: item.status, note: item.note || '' }); setIsOpenModal(true); }} className="text-blue-500 font-bold text-xs">Sửa</button>
                <button onClick={() => handleDelete(item.id)} className="text-red-500 font-bold text-xs">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[400px]">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Sửa lịch hẹn' : 'Thêm lịch hẹn'}</h2>
            <div className="space-y-4">
              <select className="w-full p-2 border rounded" value={formData.patientId} onChange={(e) => setFormData({...formData, patientId: e.target.value})}>
                <option value="">Chọn bệnh nhân</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select className="w-full p-2 border rounded" value={formData.doctorId} onChange={(e) => setFormData({...formData, doctorId: e.target.value})}>
                <option value="">Chọn bác sĩ</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select className="w-full p-2 border rounded" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option value="WAITING">Chờ khám</option>
                <option value="IN_PROGRESS">Đã xác nhận</option>
                <option value="DONE">Đã xong</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
              <DatePicker selected={formData.appointmentTime} onChange={(date: Date | null) => date && setFormData({...formData, appointmentTime: date})} showTimeSelect className="w-full p-2 border rounded" dateFormat="dd/MM/yyyy HH:mm" />
              <textarea className="w-full p-2 border rounded" placeholder="Ghi chú..." value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} />
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white p-2 rounded">Lưu</button>
              <button onClick={() => setIsOpenModal(false)} className="flex-1 bg-gray-300 p-2 rounded">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}