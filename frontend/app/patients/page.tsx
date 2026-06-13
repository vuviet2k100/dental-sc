'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PatientsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  const [form, setForm] = useState({ 
    id: null, name: '', phone: '', birthDate: '', gender: 'Nam', address: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => { setUserRole(localStorage.getItem('user_role')); }, []);

  const getAuthConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } });

  const fetchData = async () => {
    try {
      const res = await axios.get('process.env.NEXT_PUBLIC_API_URL/patients', getAuthConfig());
      setList(res.data || []);
    } catch (err: any) {
      if (err.response?.status === 401) router.push('/login');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return alert("Vui lòng điền đủ Tên và SĐT!");

    try {
      const payload = { name: form.name, phone: form.phone, birthDate: form.birthDate, gender: form.gender, address: form.address };
      if (isEditing && form.id) await axios.patch(`process.env.NEXT_PUBLIC_API_URL/patients/${form.id}`, payload, getAuthConfig());
      else await axios.post('process.env.NEXT_PUBLIC_API_URL/patients', payload, getAuthConfig());
      
      setForm({ id: null, name: '', phone: '', birthDate: '', gender: 'Nam', address: '' });
      setIsEditing(false);
      fetchData();
    } catch (err: any) { alert("Lỗi lưu dữ liệu!"); }
  };

  const startEdit = (p: any) => {
    setForm({ id: p.id, name: p.name, phone: p.phone, birthDate: p.birthDate?.split('T')[0] || '', gender: p.gender || 'Nam', address: p.address || '' });
    setIsEditing(true);
  };

  const deletePatient = async (id: number) => {
    if (!window.confirm("Xác nhận xóa bệnh nhân?")) return;
    try { await axios.delete(`process.env.NEXT_PUBLIC_API_URL/patients/${id}`, getAuthConfig()); fetchData(); } 
    catch (err: any) { alert("Chỉ Admin mới có quyền xóa!"); }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Đang tải hồ sơ...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Hồ sơ bệnh nhân</h1>
            <p className="text-slate-500 text-sm">Quản lý và cập nhật thông tin bệnh nhân trong phòng khám</p>
          </div>
          <span className="bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-lg text-sm">Tổng: {list.length}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Card */}
          <div className="bg-white p-7 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 h-fit">
            <h2 className="text-lg font-bold mb-6 text-slate-800">{isEditing ? "📝 Chỉnh sửa hồ sơ" : "👤 Thêm bệnh nhân mới"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Họ và tên" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Số điện thoại" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              <input type="date" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} />
              <input className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Địa chỉ" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
              <select className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white" value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                <option value="Nam">Nam</option><option value="Nữ">Nữ</option>
              </select>
              <button className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">
                {isEditing ? "Lưu cập nhật" : "Lưu bệnh nhân"}
              </button>
            </form>
          </div>

          {/* Table Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <input className="w-full p-5 border-b border-slate-100 outline-none text-sm" placeholder="🔍 Tìm kiếm bệnh nhân theo tên..." onChange={e => setSearchQuery(e.target.value)} />
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr><th className="p-5 text-xs font-bold text-slate-400 uppercase">Thông tin bệnh nhân</th><th className="p-5 text-right text-xs font-bold text-slate-400 uppercase">Hành động</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((i: any) => (
                  <tr key={i.id} className="hover:bg-blue-50/50 transition">
                    <td className="p-5"><Link href={`/patients/${i.id}`} className="font-bold text-slate-800 hover:text-blue-600">{i.name}</Link><p className="text-xs text-slate-400">{i.phone} • {i.address || 'Chưa có địa chỉ'}</p></td>
                    <td className="p-5 text-right space-x-3">
                      <button onClick={() => startEdit(i)} className="text-blue-600 font-bold text-sm">Sửa</button>
                      {userRole === 'ADMIN' && <button onClick={() => deletePatient(i.id)} className="text-red-500 font-bold text-sm">Xóa</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}