'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  Stethoscope, 
  UserCog, 
  LogOut,
  User 
} from 'lucide-react';
import AccountModal from './AccountModal';

export default function Sidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Đảm bảo lấy đúng key bạn đã lưu trong LoginPage
    setRole(localStorage.getItem('user_role'));
  }, []);

  const baseMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Lịch hẹn', path: '/appointments', icon: CalendarDays },
    { name: 'Bệnh nhân', path: '/patients', icon: Users },
    { name: 'Bác sĩ', path: '/doctors', icon: Stethoscope },
    { name: 'Nhân viên', path: '/staff', icon: UserCog },
  ];

  const filteredMenuItems = baseMenuItems.filter((item) => {
    if (role === 'ADMIN') return true;
    if (role === 'DOCTOR' || role === 'STAFF') {
      return ['/dashboard', '/appointments', '/patients'].includes(item.path);
    }
    if (role === 'PATIENT') return item.path === '/appointments';
    return false;
  });

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    window.location.href = '/login';
  };

  const getRoleBadgeStyles = (r: string | null) => {
    switch (r) {
      case 'ADMIN': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'DOCTOR': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'STAFF': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'PATIENT': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="w-64 bg-slate-950 text-white min-h-screen p-5 flex flex-col justify-between border-r border-slate-800">
      <div>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white shadow-lg">D</div>
          <h1 className="text-lg font-bold tracking-wider text-white">DENTAL SC</h1>
        </div>
        
        <nav className="space-y-1.5">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800 space-y-4">
        {/* Nút mở Modal Tài khoản */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-3 w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
        >
          <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center"><User size={18} /></div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Tài khoản</span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase w-max ${getRoleBadgeStyles(role)}`}>
              {role || '...'}
            </span>
          </div>
        </button>

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 w-full p-3 text-sm text-red-400 hover:bg-red-500/5 rounded-xl transition"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* Modal Quản lý tài khoản */}
      <AccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}