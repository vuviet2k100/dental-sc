'use client';
import { useState, useEffect } from 'react';
import { api } from '@/app/lib/axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PatientsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ 
    id: null, name: '', phone: '', birthDate: '', gender: 'MALE', address: '' 
  });
  
  const router = useRouter();

  useEffect(() => { 
    setUserRole(localStorage.getItem('user_role')); 
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/patients');
      setList(res.data || []);
    } catch (err: any) {
      if (err.response?.status === 401) router.push('/login');
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && form.id) {
        await api.patch(`/patients/${form.id}`, form);
      } else {
        await api.post('/patients', form);
      }
      setForm({ id: null, name: '', phone: '', birthDate: '', gender: 'MALE', address: '' });
      setShowModal(false);
      setIsEditing(false);
      fetchData();
    } catch (err: any) { 
      alert("Lỗi lưu dữ liệu: " + (err.response?.data?.message || "Có lỗi xảy ra")); 
    }
  };

  const deletePatient = async (id: number) => {
    if (!window.confirm("Xác nhận xóa bệnh nhân?")) return;
    try { 
      await api.delete(`/patients/${id}`); 
      fetchData(); 
    } catch (err: any) { alert("Chỉ Admin mới có quyền xóa!"); }
  };

  const openForm = (p: any = null) => {
    if (p) {
      setForm({ 
        id: p.id, 
        name: p.name, 
        phone: p.phone, 
        birthDate: p.birthDate?.split('T')[0] || '', 
        gender: p.gender || 'MALE', 
        address: p.address || '' 
      });
      setIsEditing(true);
    } else {
      setForm({ id: null, name: '', phone: '', birthDate: '', gender: 'MALE', address: '' });
      setIsEditing(false);
    }
    setShowModal(true);
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Đang tải hồ sơ...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Hồ sơ bệnh nhân</h1>
            <p className="text-slate-500">Quản lý thông tin bệnh nhân trong phòng khám</p>
          </div>
          <button 
            onClick={() => openForm()}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            + Thêm bệnh nhân
          </button>
        </div>

        {/* Modal Form */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold mb-4">{isEditing ? "Sửa hồ sơ" : "Thêm mới bệnh nhân"}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input className="w-full border p-3 rounded-lg" placeholder="Họ và tên" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                <input className="w-full border p-3 rounded-lg" placeholder="Số điện thoại" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required />
                <input type="date" className="w-full border p-3 rounded-lg" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} />
                <input className="w-full border p-3 rounded-lg" placeholder="Địa chỉ" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
                <select className="w-full border p-3 rounded-lg" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                </select>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-100 rounded-lg font-bold">Hủy</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold">Lưu</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Danh sách */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <input className="w-full p-5 border-b border-slate-100 outline-none text-sm" placeholder="🔍 Tìm kiếm bệnh nhân theo tên..." onChange={e => setSearchQuery(e.target.value)} />
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr><th className="p-5 text-xs font-bold text-slate-400 uppercase">Thông tin bệnh nhân</th><th className="p-5 text-right text-xs font-bold text-slate-400 uppercase">Hành động</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((i: any) => (
                <tr key={i.id} className="hover:bg-slate-50 transition">
                  <td className="p-5">
                    <Link href={`/patients/${i.id}`} className="font-bold text-blue-600 hover:underline">{i.name}</Link>
                    <p className="text-xs text-slate-400">{i.phone} • {i.address || 'Chưa có địa chỉ'}</p>
                  </td>
                  <td className="p-5 text-right space-x-3">
                    <button onClick={() => openForm(i)} className="text-blue-600 font-bold text-sm">Sửa</button>
                    {userRole === 'ADMIN' && <button onClick={() => deletePatient(i.id)} className="text-red-500 font-bold text-sm">Xóa</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}