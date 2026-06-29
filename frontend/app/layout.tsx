import AppLayout from '@/components/AppLayout'; // Import file vừa tạo
import './globals.css'; // File CSS của bạn

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}