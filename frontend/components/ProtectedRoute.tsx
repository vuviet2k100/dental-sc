'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Cho qua các trang công khai
    if (pathname === '/login' || pathname === '/register') {
      setIsVerified(true);
      return;
    }

    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role')?.trim().toUpperCase();

    if (!token) {
      router.push('/login');
      return;
    }

    // 2. ADMIN có quyền truy cập mọi nơi
    if (role === 'ADMIN') {
      setIsVerified(true);
      return;
    }

    // 3. Phân quyền chi tiết cho STAFF và DOCTOR
    // Nếu truy cập các trang tạo hoặc sửa
    if (pathname.includes('/create') || pathname.includes('/edit')) {
      const isAppointmentPage = pathname.includes('/appointment');
      const isMedicalRecordPage = pathname.includes('/medical-record');

      // STAFF chỉ được tạo/sửa Appointment
      if (role === 'STAFF' && isAppointmentPage) {
        setIsVerified(true);
        return;
      }

      // DOCTOR chỉ được tạo/sửa Medical Record
      if (role === 'DOCTOR' && isMedicalRecordPage) {
        setIsVerified(true);
        return;
      }

      // Nếu không khớp quyền, chặn lại
      console.warn("Bạn không có quyền thao tác trên trang này!");
      router.push('/dashboard');
      setIsVerified(false);
      return;
    }

    // 4. Các trang khác (không phải create/edit) cho phép truy cập
    setIsVerified(true);
  }, [pathname, router]);

  if (isVerified === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>🛡️ Đang xác thực...</div>
      </div>
    );
  }

  return <>{children}</>;
}