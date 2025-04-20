import { User } from '../types';
import { create } from 'zustand';

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  login: (username: string) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
  login: async (username: string) => {
    const res = await fetch(`http://localhost:8000/users?username=${encodeURIComponent(username)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to login/register user');
    const data = await res.json();
    set({ user: { id: data.id, username, username_hash: data.username_hash } });
  },
}));
