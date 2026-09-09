import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export function useTournaments(cityId?: number) {
  return useQuery({
    queryKey: ['tournaments', cityId],
    queryFn: () => api.getTournaments(cityId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTournament(id: number) {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: () => api.getTournament(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}

export function useEvents(tournamentId: number) {
  return useQuery({
    queryKey: ['events', tournamentId],
    queryFn: () => api.getEvents(tournamentId),
    staleTime: 1000 * 60 * 5,
    enabled: !!tournamentId,
  });
}

export function useCreateRegistrationOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, partnerId }: { eventId: number; partnerId?: number | null }) =>
      api.createRegistrationOrder(eventId, partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
    },
  });
}

export function useVerifyRegistrationPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      registrationId: number;
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      paymentIntentId?: string;
    }) => api.verifyRegistrationPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useFreeRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, partnerId }: { eventId: number; partnerId?: number | null }) =>
      api.freeRegister(eventId, partnerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}

export function useMyRegistrations() {
  return useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => api.getMyRegistrations(),
    staleTime: 1000 * 60 * 2,
  });
}
