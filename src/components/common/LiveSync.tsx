import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLiveEvents } from '../../hooks/useLiveEvents';

/**
 * Single SSE subscription for the whole app, mounted once in the root layout.
 * When the backend pushes a score/match event we invalidate the live match
 * query keys — React Query then refetches ONLY the queries currently on
 * screen, keeping the homepage rail, live tab, match page, and bracket all
 * in sync from the same cache (single source of truth).
 */
export const LiveSync: React.FC = () => {
  const queryClient = useQueryClient();

  useLiveEvents(() => {
    queryClient.invalidateQueries({ queryKey: ['matches'] });
    queryClient.invalidateQueries({ queryKey: ['match'] });
    queryClient.invalidateQueries({ queryKey: ['sets'] });
  });

  return null;
};
