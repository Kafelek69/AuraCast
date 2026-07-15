import { create } from 'zustand';

interface User { id: number; username: string; role: string; }

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

// Funkcja pomocnicza do pobrania usera z localStorage
const getSavedUser = () => {
  const saved = localStorage.getItem('user');
  return saved ? JSON.parse(saved) : null;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getSavedUser(),
  token: localStorage.getItem('token'),
  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user)); // Zapisujemy usera
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));