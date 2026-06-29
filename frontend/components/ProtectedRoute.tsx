'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Nếu đang tải Auth, đợi xong đã
    if (isLoading) return;

    // 2. Các trang công khai
    const isPublicPage = pathname === '/login' || pathname === '/register';
    if (isPublicPage) {
      if (user) router.replace('/dashboard'); // Nếu đã login thì đẩy về dashboard
      return;
    }

    // 3. Nếu chưa login mà vào trang bảo mật -> Đẩy về login
    if (!user) {
      router.replace('/login');
      return;
    }

    // 4. Logic phân quyền (Dùng role từ user object đã lấy từ server)
    const role = user.role;

    // ADMIN có quyền tất cả, bỏ qua kiểm tra
    if (role === 'ADMIN') return;

    // Kiểm tra trang Create/Edit
    if (pathname.includes('/create') || pathname.includes('/edit')) {
      const isAppointmentPage = pathname.includes('/appointment');
      const isMedicalRecordPage = pathname.includes('/medical-record');

      // STAFF chỉ được tạo/sửa Appointment
      if (role === 'STAFF' && isAppointmentPage) return;

      // DOCTOR chỉ được tạo/sửa Medical Record
      if (role === 'DOCTOR' && isMedicalRecordPage) return;

      // Nếu không khớp quyền, chặn lại
      console.warn("Bạn không có quyền truy cập trang này!");
      router.replace('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  // Nếu đang tải Auth, hiện Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>🛡️ Đang xác thực hệ thống...</div>
      </div>
    );
  }

  // Nếu chưa đăng nhập và không phải trang công khai -> Trả về null để không hiển thị gì
  if (!user && pathname !== '/login' && pathname !== '/register') {
    return null;
  }

  return <>{children}</>;
}