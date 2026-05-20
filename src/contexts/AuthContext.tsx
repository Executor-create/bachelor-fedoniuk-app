import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '../types/user.type';
import api from '../config/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      const userData = response.data;

      const cb = Date.now();
      if (userData?.profile?.avatar_url) {
        userData.profile.avatar_url = `${userData.profile.avatar_url}?cb=${cb}`;
      }
      if (userData?.avatar_url) {
        userData.avatar_url = `${userData.avatar_url}?cb=${cb}`;
      }

      setUser(userData);
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error loading user profile:', error);

      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
