import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User } from '@/services/types';
import { authService } from '@/services';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('attendance_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await authService.login({ username, password });
      setUser(result.user);
      return true;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const switchRole = useCallback(() => {
    if (!user) return;
    // 切换角色只在 mock 模式下有效
    const mockUsers = JSON.parse(localStorage.getItem('attendance_mock_users') || '[]');
    if (mockUsers.length === 0) {
      // 简单切换：修改当前用户角色显示
      const newRole = user.role === 'employee' ? 'admin' : 'employee';
      const updated = { ...user, role: newRole as User['role'] };
      setUser(updated);
      localStorage.setItem('attendance_user', JSON.stringify(updated));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
