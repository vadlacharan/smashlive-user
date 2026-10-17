import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, api, getAuthToken, getCachedUser, setAuthToken, setCachedUser, setUnauthorizedHandler } from '../api/client';
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
  const queryClient = useQueryClient();

  // Per-user cached data (bookings, registrations, …) must never leak
  // across accounts or linger for guests — refresh it on every auth change.
  const invalidateUserCaches = () => {
    queryClient.invalidateQueries({ queryKey: ['bookings'] });
    queryClient.invalidateQueries({ queryKey: ['registrations'] });
    queryClient.invalidateQueries({ queryKey: ['my-registrations'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  useEffect(() => {
    // If the stored token is rejected mid-session (revoked on another
    // device, expired server-side), drop the UI session immediately.
    setUnauthorizedHandler(() => {
      setUser(null);
      invalidateUserCaches();
    });
    return () => setUnauthorizedHandler(null);
  }, [queryClient]);

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
          try {
            // Refresh from the server. getMe rethrows 401 (dead token) but
            // returns null for offline/transient failures.
            const currentUser = await api.getMe();
            if (currentUser) {
              setUser(currentUser);
            }
          } catch (err) {
            if (err instanceof ApiError && err.statusCode === 401) {
              // Token is revoked/expired server-side — this is a real logout,
              // not an offline blip. Clear everything so a stale session can
              // never masquerade as logged in.
              await setAuthToken(null);
              await setCachedUser(null);
              setUser(null);
            }
            // Otherwise (offline / transient): keep the cached session.
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
      invalidateUserCaches();
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
        invalidateUserCaches();
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
      invalidateUserCaches();
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
