import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function useTransactions() {
  const { isAuthenticated, isLoading } = useAuth();
  return useQuery({
    queryKey: ['transactions', 'me'],
    queryFn: () => api.getTransactions(),
    // Account endpoint — don't fire for guests or before session restore.
    enabled: isAuthenticated && !isLoading,
    staleTime: 1000 * 60,
  });
}
