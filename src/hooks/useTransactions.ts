import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions', 'me'],
    queryFn: () => api.getTransactions(),
    staleTime: 1000 * 60,
  });
}
