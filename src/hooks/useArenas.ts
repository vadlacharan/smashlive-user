import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useArenas(sportType?: string) {
  return useQuery({
    queryKey: ['arenas', sportType],
    queryFn: () => api.getArenas(sportType),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useArena(id: number) {
  return useQuery({
    queryKey: ['arena', id],
    queryFn: () => api.getArena(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}

export function useAvailability(arenaId: number, date: string, sportType?: string) {
  return useQuery({
    queryKey: ['availability', arenaId, date, sportType],
    queryFn: () => api.checkAvailability(arenaId, date, sportType),
    staleTime: 0, // always fresh
    refetchInterval: 20000, // 20s polling for live court availability
    enabled: !!arenaId && !!date,
  });
}

export function useCreateBookingOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { arenaId: number; court: string; slotStarts: string[] }) =>
      api.createBookingOrder(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useVerifyBookingPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      bookingId: number;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      paymentIntentId?: string;
    }) => api.verifyBookingPayment(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}
