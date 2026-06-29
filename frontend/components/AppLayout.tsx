'use client'; // Bắt buộc vì dùng hooks

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar'; // Đảm bảo đường dẫn này đúng
import ProtectedRoute from '@/components/ProtectedRoute'; // Đường dẫn file ProtectedRoute của bạn
import { AuthProvider } from '@/context/AuthContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Xác định xem có phải trang Auth không
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        {/* Sidebar chỉ hiện nếu KHÔNG phải trang Auth */}
        {!isAuthPage && <Sidebar />}
        
        <main className="flex-1 bg-gray-50">
          {isAuthPage ? (
            children
          ) : (
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          )}
        </main>
      </div>
    </AuthProvider>
  );
}