import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, getAuthToken, getCachedUser } from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (payload: {
    email: string;
    password: string;
    fullname: string;
    phoneNumber: string;
    dateOfBirth: string;
  }) => Promise<{ user: User; message: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const token = await getAuthToken();
        if (token) {
          // Restore the last known user instantly — works fully offline.
          const cached = await getCachedUser();
          if (cached) {
            setUser(cached);
          }
          // Refresh from the server. If this fails (offline / transient
          // network error), the cached session is kept — never force-logout.
          const currentUser = await api.getMe();
          if (currentUser) {
            setUser(currentUser);
          }
        } else {
          setUser(null);
        }
      } catch {
        // Keep whatever session state we restored; don't clear on errors.
      } finally {
        setIsLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await api.login(email, pass);
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: {
    email: string;
    password: string;
    fullname: string;
    phoneNumber: string;
    dateOfBirth: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await api.signup(payload);
      // No email verification — log the new player straight in.
      if (result?.user) {
        setUser(result.user);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    const updated = await api.updateProfile(user.id, updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
