import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock authentication - in production, this would be a real API call
    if (username === 'admin' && password === 'admin123') {
      const userData: User = {
        id: 'admin1',
        username: 'admin',
        email: 'admin@parcbayouta.dz',
        role: 'admin',
      };
      setUser(userData);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
