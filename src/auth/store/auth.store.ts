import type { User } from '@/interfaces/user.interface';
import { create } from 'zustand';
import { loginAction } from '../actions/login.action';
import { checkAuthAction } from '../actions/check-auth.action';
import { registerAction } from '../actions/register.action';

type AuthStatus = 'authenticated' | 'not-authenticated' | 'checking';

type AuthState = {
  // Properties
  user: User | null;
  token: string | null;
  authStatus: AuthStatus;

  // Getters
  isAdmin: () => boolean;  
  //Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  checkAuthStatus: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  authStatus: 'checking',

  // Getters
  isAdmin: () => {
    const roles = get().user?.roles || [] ;

    return roles.includes('admin');
  },

  // Actions
  login: async(email:string, password: string) => {
    console.log({email, password});

    try {
      const data = await loginAction(email, password);
      localStorage.setItem('token', data.token);
      
      set({ user: data.user, token: data.token, authStatus:'authenticated' });
      
      return true
    } catch (error) {
      
      localStorage.removeItem('token');
      set({ user: null, token: null, authStatus:'not-authenticated' });
      return false;
      
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, authStatus:'not-authenticated' });
  },
  
  register: async(email:string, password: string, fullName: string) => {
    console.log({email, password, fullName});

    try {
      const data = await registerAction(email, password, fullName);
      localStorage.setItem('token', data.token);
      
      set({ user: data.user, token: data.token, authStatus:'authenticated' });
      
      return true
    } catch (error) {
      
      localStorage.removeItem('token');
      set({ user: null, token: null, authStatus:'not-authenticated' });
      return false;
      
    }
  },

  checkAuthStatus: async() => {
    try {
      const { user, token } = await checkAuthAction();

      set({
        user: user,
        token: token,
        authStatus:'authenticated',
      })

      return true;
    } catch (error) {
      set({ user: null, token: null, authStatus:'not-authenticated' });
      return false;
      
    }
  }
}));

