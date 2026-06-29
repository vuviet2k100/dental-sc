'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Nếu đã load xong mà không có user hoặc không phải Admin -> đẩy về trang chủ hoặc login
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  // Trong lúc đang tải Auth, hiển thị màn hình loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Nếu không phải Admin, không hiển thị gì (hoặc hiển thị thông báo)
  if (!user || user.role !== 'ADMIN') {
    return null; 
  }

  // Nếu là Admin, hiển thị nội dung trang
  return <>{children}</>;
}