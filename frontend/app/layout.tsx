'use client'; // BẮT BUỘC ĐỂ DÒNG NÀY Ở ĐẦU TIÊN, KHÔNG ĐƯỢC CÓ GÌ TRÊN NÓ

import { usePathname } from 'next/navigation';
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="vi">
      <body>
        <div className="flex min-h-screen">
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
      </body>
    </html>
  );
}