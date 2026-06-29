'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/api';

// Định nghĩa kiểu dữ liệu cho Context
interface AuthContextType {
  user: any | null;
  setUser: (user: any | null) => void;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role'); // Xóa luôn mấy cái đã set
    localStorage.removeItem('user_id');
    setUser(null); // Cập nhật state ngay lập tức để UI render lại
    window.location.href = '/login'; // Chuyển trang ngay
  }
  useEffect(() => {
    const initAuth = async () => {  
      const token = localStorage.getItem('access_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
        try {
            const res = await authService.getProfile();
            const userData = {
                ...res.data,
                department: res.data.department || res.data.deptName || 'Chưa cập nhật'
            };
            
            setUser(res.data);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook tùy chỉnh để dùng ở bất kỳ đâu
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
};