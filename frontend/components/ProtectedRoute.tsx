'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Cho qua các trang public
    if (pathname === '/login' || pathname === '/register') {
      setIsVerified(true);
      return;
    }

    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');

    if (!token) {
      router.push('/login');
      return;
    }

    // 2. Phân quyền truy cập ADMIN
    if (role === 'ADMIN') {
      setIsVerified(true);
      return;
    }

    // 3. CHẶN cứng các trang thuộc admin/ nếu không phải là ADMIN
    if (pathname.startsWith('/admin')) {
      console.warn("Bạn không có quyền truy cập trang quản trị!");
      router.push('/dashboard');
      setIsVerified(false);
      return;
    }

    // 4. Phân quyền cho STAFF & DOCTOR
    // STAFF và DOCTOR chỉ được vào các trang nghiệp vụ, chặn trang tạo/sửa
    if (pathname.includes('/create') || pathname.includes('/edit')) {
      router.push('/dashboard');
      setIsVerified(false);
      return;
    }

    // Nếu qua được các bước trên thì cho phép
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