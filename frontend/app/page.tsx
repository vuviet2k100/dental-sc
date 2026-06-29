'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-5">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md border border-slate-100">
        <h1 className="text-3xl font-black text-sky-700 mb-2">DentalCare Pro</h1>
        <p className="text-slate-500 mb-8">
          Hệ thống quản lý phòng khám nha khoa chuyên nghiệp và bảo mật.
        </p>
        
        <Link 
          href="/login" 
          className="inline-block bg-sky-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200"
        >
          Đăng nhập hệ thống
        </Link>
      </div>
    </main>
  );
}