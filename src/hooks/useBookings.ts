import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Booking } from '../types';

export function useMyBookings() {
  const { isAuthenticated, isLoading } = useAuth();
  return useQuery({
    queryKey: ['bookings', 'me'],
    queryFn: () => api.getMyBookings(),
    // Never fire account endpoints as a guest (or before session restore
    // finishes) — avoids pointless 401s and stale cross-account data.
    enabled: isAuthenticated && !isLoading,
    staleTime: 1000 * 60,
  });
}

export function useMyRegistrations() {
  const { isAuthenticated, isLoading } = useAuth();
  return useQuery({
    queryKey: ['registrations', 'me'],
    queryFn: () => api.getMyRegistrations(),
    enabled: isAuthenticated && !isLoading,
    staleTime: 1000 * 60,
  });
}

/**
 * Splits bookings into upcoming and past groups with contiguous hour merging
 */
export function splitBookings(bookings: Booking[] = []) {
  const now = new Date();
  const upcoming: Booking[] = [];
  const past: Booking[] = [];

  bookings.forEach((b) => {
    if (b.isPaid !== true) return;
    const slotDate = new Date(b.slotStart);
    if (slotDate >= now) {
      upcoming.push(b);
    } else {
      past.push(b);
    }
  });

  return { upcoming, past };
}
