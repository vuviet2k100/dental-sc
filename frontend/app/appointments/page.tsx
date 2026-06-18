'use client';
import { useEffect, useState } from 'react';
import { api, staffService, userService } from '@/services/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ 
    patientId: '', 
    doctorId: '', 
    appointmentTime: new Date(),
    status: 'WAITING',
    note: '' 
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
    } catch (error) { 
      console.error("Lỗi fetch dữ liệu:", error); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    setRole(localStorage.getItem('user_role'));
    fetchData(); 
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ 
      patientId: '', 
      doctorId: '', 
      appointmentTime: new Date(), 
      status: 'WAITING', 
      note: '' 
    });
    setIsOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa lịch hẹn này không?")) {
      try {
        await api.delete(`/appointments/${id}`);
        fetchData();
      } catch (e) {
        alert("Không thể xóa lịch hẹn!");
      }
    }
  };

  const handleSubmit = async () => {
    const currentStaffId = localStorage.getItem('user_id');
    const payload = {
      patientId: parseInt(formData.patientId),
      doctorId: parseInt(formData.doctorId),
      appointmentTime: formData.appointmentTime.toISOString(),
      status: formData.status,
      note: formData.note,
      staffId: currentStaffId ? parseInt(currentStaffId) : null
    };

    if (isNaN(payload.patientId) || isNaN(payload.doctorId)) {
      alert("Vui lòng chọn đầy đủ bệnh nhân và bác sĩ!");
      return;
    }

    try {
      if (editingId) {
        await api.patch(`/appointments/${editingId}`, payload);
      } else {
        await api.post('/appointments', payload);
      }
      setIsOpenModal(false);
      fetchData();
    } catch (e: any) { 
      console.error("Lỗi lưu dữ liệu:", e);
      alert(e.response?.data?.message || "Lỗi lưu dữ liệu!"); 
    }
  };

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <div className="flex justify-between mb-8">
        <h2 className="text-3xl font-black">Quản lý lịch hẹn</h2>
        {!isLoading && role?.trim().toUpperCase() !== 'DOCTOR' && (
          <button onClick={handleOpenAddModal} className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700">
            + Thêm mới
          </button>
        )}
      </div>

      <table className="w-full bg-white rounded-2xl shadow-sm border overflow-hidden">
        <thead className="bg-slate-50 text-slate-400 text-xs uppercase">
          <tr>
            <th className="p-4 text-left">Bệnh nhân</th>
            <th className="p-4 text-left">Bác sĩ</th>
            <th className="p-4 text-left">Thời gian</th>
            <th className="p-4 text-center">Trạng thái</th>
            <th className="p-4 text-left">Ghi chú</th>
            {!isLoading && role?.trim().toUpperCase() !== 'DOCTOR' && <th className="p-4 text-center">Thao tác</th>}
          </tr>
        </thead>
        <tbody className="divide-y">
          {appointments.map((item: any) => (
            <tr key={item.id}>
              <td className="p-4">{item.patient?.name || '---'}</td>
              <td className="p-4">{item.doctor?.name || '---'}</td>
              <td className="p-4">{new Date(item.appointmentTime).toLocaleString()}</td>
              <td className="p-4 text-center">
                <span className={`px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700`}>
                  {item.status}
                </span>
              </td>
              <td className="p-4 text-sm text-slate-600 italic">{item.note || '---'}</td>
              {!isLoading && role?.trim().toUpperCase() !== 'DOCTOR' && (
                <td className="p-4 text-center">
                  <button onClick={() => {
                    setEditingId(item.id);
                    setFormData({
                      patientId: item.patientId?.toString() || '',
                      doctorId: item.doctorId?.toString() || '',
                      appointmentTime: new Date(item.appointmentTime),
                      status: item.status,
                      note: item.note || ''
                    });
                    setIsOpenModal(true);
                  }} className="text-blue-500 mr-4 font-bold">Sửa</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 font-bold">Xóa</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Thêm/Sửa */}
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

              <DatePicker 
                selected={formData.appointmentTime} 
                onChange={(date: Date | null) => { if (date) setFormData({...formData, appointmentTime: date}); }}
                showTimeSelect
                className="w-full p-2 border rounded"
                dateFormat="dd/MM/yyyy HH:mm"
              />

              <select className="w-full p-2 border rounded" 
                value={formData.status} 
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setFormData(prev => ({...prev, status: newStatus}));
                }}
                >
                <option value="WAITING">Chờ khám</option>
                <option value="IN_PROGRESS">Đã xác nhận</option>
                <option value="DONE">Đã xong</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>

              <textarea 
                className="w-full p-2 border rounded" 
                placeholder="Ghi chú tình trạng..."
                value={formData.note} 
                onChange={(e) => setFormData({...formData, note: e.target.value})}
              />
            </div>

            <div className="mt-6 flex gap-2">
              <button onClick={handleSubmit} className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Lưu</button>
              <button onClick={() => setIsOpenModal(false)} className="flex-1 bg-gray-300 p-2 rounded hover:bg-gray-400">Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}