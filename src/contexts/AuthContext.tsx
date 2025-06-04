
import React, { createContext, useContext, useEffect, useState } from 'react';
import { signIn as authSignIn, signUp as authSignUp, getCurrentUser, User } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  profile: User | null;
  session: any;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      const currentUser = getCurrentUser(token);
      if (currentUser) {
        setUser(currentUser);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await authSignIn(email, password);
    
    if (response.error) {
      throw new Error(response.error);
    }

    if (response.user && response.token) {
      setUser(response.user);
      localStorage.setItem('auth_token', response.token);
    }

    return response;
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const isAdmin = user?.role === 'admin';

  const value = {
    user,
    profile: user, // For compatibility
    session: user ? { user } : null, // For compatibility
    loading,
    signIn,
    signOut,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
