import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

// Live data is pushed via SSE (LiveSync) with a 20s polling fallback —
// pull-to-refresh is available everywhere too.
export function useLiveMatches() {
  return useQuery({
    queryKey: ['matches', 'live'],
    queryFn: () => api.getLiveMatches(),
    refetchInterval: 20000,
    staleTime: 30_000,
  });
}

export function useMatches(eventId: number) {
  return useQuery({
    queryKey: ['matches', eventId],
    queryFn: () => api.getMatches(eventId),
    refetchInterval: 20000,
    staleTime: 30_000,
    enabled: !!eventId,
  });
}

export function useMatch(matchId: number) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => api.getMatch(matchId),
    refetchInterval: 20000,
    staleTime: 30_000,
    enabled: !!matchId,
  });
}

export function useMatchSets(matchId: number) {
  return useQuery({
    queryKey: ['sets', matchId],
    queryFn: () => api.getSets(matchId),
    refetchInterval: 20000,
    staleTime: 30_000,
    enabled: !!matchId,
  });
}
