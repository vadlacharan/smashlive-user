import { useEffect, useRef } from 'react';
import EventSource from 'react-native-sse';
import { API_BASE_URL } from '../api/client';

export interface LiveEvent {
  type: 'score' | 'match' | 'ready';
  matchId?: number;
  eventId?: number;
  tournamentId?: number;
  matchCompleted?: boolean;
  setScore?: {
    player1Score: number;
    player2Score: number;
    setCompleted: boolean;
  };
}

/**
 * Subscribes to the backend SSE stream (Backend → live pushes from Rally).
 * Reconnects with a short backoff on error/close. Call onEvent with your
 * handler; the hook never re-renders on its own — screens refetch data on
 * their own schedule via onEvent.
 */
export function useLiveEvents(
  onEvent: (event: LiveEvent) => void,
  deps: readonly unknown[] = []
) {
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    let es: EventSource<any> | null = null;
    let closed = false;
    let retry: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closed) return;

      es = new EventSource(`${API_BASE_URL}/api/live/stream`, {
        // Polling control is not used — server keeps pushing heartbeats.
        // Silence RN's auto-reconnect: we manage retries ourselves.
        timeout: 30000,
        pollingInterval: 0,
      } as any);

      const handle = (event: string) => (e: { data?: string | null }) => {
        try {
          const parsed = e.data ? JSON.parse(e.data) : {};
          handlerRef.current({ type: event as LiveEvent['type'], ...parsed });
        } catch {}
      };

      es.addEventListener('score', handle('score'));
      es.addEventListener('match', handle('match'));
      es.addEventListener('error', scheduleRetry);
      es.addEventListener('close', scheduleRetry);
    };

    const scheduleRetry = () => {
      if (closed || retry) return;
      retry = setTimeout(() => {
        retry = null;
        connect();
      }, 3000);
    };

    connect();

    return () => {
      closed = true;
      if (retry) clearTimeout(retry);
      retry = null;
      if (es) es.close();
      es = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
