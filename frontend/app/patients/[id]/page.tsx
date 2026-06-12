'use client';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { MapPin, Phone, ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import MedicalRecordsList from '@/components/MedicalRecordsList';

export default function PatientDetailPage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'appointments' | 'medicalRecords'>('info');
  
  const [isStaff, setIsStaff] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_role')?.trim().toUpperCase() === 'STAFF';
    }
    return true;
  });

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/patients/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
      });
      setPatient(res.data);
    } catch (err) { console.error("Lỗi tải thông tin bệnh nhân:", err); }
  };

  useEffect(() => { 
    if (id) fetchData(); 
  }, [id]);

  if (!patient) return <div className="p-10 text-center text-slate-500">Đang tải hồ sơ...</div>;

  const getAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const birth = new Date(birthDate);
    return new Date().getFullYear() - birth.getFullYear();
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <button onClick={() => window.history.back()} className="flex items-center text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft size={16} className="mr-2"/> Quay lại
      </button>
      
      <div className="bg-white p-8 rounded-3xl border shadow-sm">
        <h1 className="text-4xl font-black text-slate-900 mb-2">{patient.name}</h1>
        <div className="flex gap-6 text-slate-600 text-sm">
          <span className="flex items-center gap-2"><Phone size={16}/> {patient.phone}</span>
          <span className="flex items-center gap-2"><MapPin size={16}/> {patient.address || 'Chưa cập nhật địa chỉ'}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b">
        {['info', 'appointments', 'medicalRecords'].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} 
            className={`pb-3 font-bold capitalize transition-colors ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>
            {tab === 'info' ? 'Thông tin cá nhân' : tab === 'appointments' ? 'Lịch hẹn' : 'Bệnh án'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border">
        {activeTab === 'info' && (
          <div className="grid grid-cols-2 gap-6">
            <InfoItem label="Ngày sinh" value={patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('vi-VN') : 'N/A'} />
            <InfoItem label="Tuổi hiện tại" value={`${getAge(patient.birthDate)} tuổi`} />
            <InfoItem label="Giới tính" value={patient.gender} />
            <InfoItem label="Địa chỉ" value={patient.address || 'Chưa cập nhật'} />
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="space-y-3">
            {patient.appointments?.length > 0 ? patient.appointments.map((app: any) => (
              <div key={app.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{new Date(app.appointmentTime).toLocaleString('vi-VN')}</p>
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                      <User size={14} /> Bác sĩ: <span className="font-semibold text-slate-700">{app.doctor?.name || 'Chưa phân công'}</span>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white border border-blue-200 text-blue-700 rounded-lg text-xs font-bold shadow-sm">
                  {app.status}
                </span>
              </div>
            )) : <p className="text-slate-400 text-center py-4 italic">Chưa có lịch hẹn nào được ghi nhận</p>}
          </div>
        )}
        
        {activeTab === 'medicalRecords' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-lg">Danh sách bệnh án</h3>
              {!isStaff && (
                <Link href={`/medical-record/create?patientId=${id}`} 
                      className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                  + Thêm bệnh án
                </Link>
              )}
            </div>
            <MedicalRecordsList patientId={id as string} />
          </div>
        )}
      </div>
    </div>
  );
}

const InfoItem = ({label, value}: any) => (
  <div>
    <p className="text-xs text-slate-400 uppercase font-bold mb-1">{label}</p>
    <p className="font-bold text-slate-800">{value}</p>
  </div>
);