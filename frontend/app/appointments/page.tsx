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
    status: 'WAITING' 
  });
  
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Dùng các service đã cấu hình sẵn trong api.ts
      const [appRes, pRes, dRes] = await Promise.all([
        staffService.getAllAppointments(), // Đã tự động kèm token
        staffService.getAllPatients(),
        userService.getAll('DOCTOR')
      ]);
      setAppointments(appRes.data || []);
      setPatients(pRes.data || []);
      setDoctors(dRes.data || []);
    } catch (error) { 
      console.error("Lỗi fetch:", error); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    setRole(localStorage.getItem('user_role'));
    fetchData(); 
  }, []);

  const handleEdit = (item: any) => { 
    setEditingId(item.id);
    setFormData({ 
      patientId: item.patientId?.toString() || '', 
      doctorId: item.doctorId?.toString() || '', 
      appointmentTime: new Date(item.appointmentTime),
      status: item.status
    });
    setIsOpenModal(true); 
  };

  const handleSubmit = async () => {
    const currentStaffId = localStorage.getItem('user_id'); // Lấy staffId từ localStorage nếu có
    
    const payload = {
      patientId: parseInt(formData.patientId),
      doctorId: parseInt(formData.doctorId),
      appointmentTime: formData.appointmentTime.toISOString(),
      status: formData.status,
      staffId: currentStaffId ? parseInt(currentStaffId) : null
    };

    if (isNaN(payload.patientId) || isNaN(payload.doctorId)) {
      alert("Vui lòng chọn đầy đủ bệnh nhân và bác sĩ!");
      return;
    }

    try {
      // Dùng 'api' instance để tự động đính kèm token
      if (editingId) {
        await api.patch(`/appointments/${editingId}`, payload);
      } else {
        await api.post('/appointments', payload);
      }
      setIsOpenModal(false);
      fetchData();
    } catch (e: any) { 
      console.error(e);
      alert(e.response?.data?.message || "Lỗi lưu dữ liệu!"); 
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await api.delete(`/appointments/${id}`);
        fetchData();
      } catch (e) {
        alert("Không thể xóa!");
      }
    }
  };

  return (
    <div className="p-10 bg-slate-50 min-h-screen">
      <div className="flex justify-between mb-8">
        <h2 className="text-3xl font-black">Quản lý lịch hẹn</h2>
        {!isLoading && role?.trim().toUpperCase() !== 'DOCTOR' && (
          <button 
            onClick={() => { 
              console.log("Bấm nút!")
              // setEditingId(null); 
              // setFormData({ patientId: '', doctorId: '', appointmentTime: new Date(), status: 'WAITING' }); 
              // setIsOpenModal(true); 
            }} 
            className="bg-blue-600 text-white px-5 py-3 rounded-xl hover:bg-blue-700"
          >
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
                <span className={`px-3 py-1 rounded-full text-xs ${item.status === 'DONE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {item.status}
                </span>
              </td>
              {!isLoading && role?.trim().toUpperCase() !== 'DOCTOR' && (
                <td className="p-4 text-center">
                  <button onClick={() => handleEdit(item)} className="text-blue-500 mr-4 font-bold">Sửa</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-500 font-bold">Xóa</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal giữ nguyên logic cũ nhưng đảm bảo dữ liệu hiển thị tốt */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white p-10 rounded-xl">
      <h2 className="mb-4">Test Modal</h2>
      <button onClick={() => setIsOpenModal(false)} className="bg-red-500 text-white p-2">Đóng</button>
    </div>
  </div>
        // <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        //    {/* ... code modal giữ nguyên ... */}
        // </div>
      )}
    </div>
  );
}