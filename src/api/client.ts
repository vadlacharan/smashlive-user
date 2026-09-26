import * as SecureStore from 'expo-secure-store';
import {
  Arena,
  AvailabilityResponse,
  Booking,
  Event,
  Match,
  Registration,
  SetModel,
  Tournament,
  Transaction,
  User,
} from '../types';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://smashlive-omega.vercel.app';
const TOKEN_KEY = 'smashlive_auth_token';
const TOKEN_ISSUED_AT_KEY = 'smashlive_auth_token_issued_at';
const CACHED_USER_KEY = 'smashlive_cached_user';
// Persist the session for 1 year — expired tokens are pruned at read time.
const TOKEN_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

let memoryToken: string | null = null;

export async function getAuthToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  try {
    const issuedAtRaw = await SecureStore.getItemAsync(TOKEN_ISSUED_AT_KEY);
    if (issuedAtRaw && Date.now() - Number(issuedAtRaw) > TOKEN_MAX_AGE_MS) {
      // Token is older than 30 days — prune it safely.
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(TOKEN_ISSUED_AT_KEY);
      await SecureStore.deleteItemAsync(CACHED_USER_KEY);
      return null;
    }
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    memoryToken = token;
    return token;
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string | null): Promise<void> {
  memoryToken = token;
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(TOKEN_ISSUED_AT_KEY, String(Date.now()));
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(TOKEN_ISSUED_AT_KEY);
      await SecureStore.deleteItemAsync(CACHED_USER_KEY);
    }
  } catch (e) {
    console.warn('SecureStore error:', e);
  }
}

// Last known user profile — lets the app restore the session while offline.
export async function getCachedUser(): Promise<User | null> {
  try {
    const raw = await SecureStore.getItemAsync(CACHED_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export async function setCachedUser(user: User | null): Promise<void> {
  try {
    if (user) {
      await SecureStore.setItemAsync(CACHED_USER_KEY, JSON.stringify(user));
    } else {
      await SecureStore.deleteItemAsync(CACHED_USER_KEY);
    }
  } catch (e) {
    console.warn('Cached user store error:', e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401 && token) {
      // Session revoked server-side — clear it safely. Offline failures never
      // reach this branch, so we never wipe the session on network errors.
      await setAuthToken(null);
    }
    const errorData = await res.json().catch(() => ({}));
    const message =
      errorData?.errors?.[0]?.message || errorData?.error || errorData?.message || `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  return (await res.json()) as T;
}

// -----------------------------------------------------------------------------
// Live Backend API Client (No Mock Data)
// -----------------------------------------------------------------------------
export const api = {
  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    try {
      const data = await request<{ user: User; token: string }>('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await setAuthToken(data.token);
      await setCachedUser(data.user);
      return data;
    } catch (err: any) {
      if (
        err.message?.toLowerCase().includes('verify') ||
        err.message?.toLowerCase().includes('unverified') ||
        err.message?.toLowerCase().includes('not verified')
      ) {
        try {
          await this.resendVerification(email);
        } catch {}
        throw new Error('UNVERIFIED_EMAIL');
      }
      throw err;
    }
  },

  async signup(payload: {
    email: string;
    password: string;
    fullname: string;
    phoneNumber: string;
    dateOfBirth: string;
  }): Promise<{ user: User; message: string }> {
    const data = await request<{ doc: User; token?: string; message?: string }>('/api/users', {
      method: 'POST',
      body: JSON.stringify({ ...payload, role: 'player' }),
    });
    // No email verification — signup returns a token, so the account is
    // active and the session starts immediately.
    if (data.token) {
      await setAuthToken(data.token);
      await setCachedUser(data.doc);
    }
    return {
      user: data.doc,
      message: data.message || 'Account created successfully.',
    };
  },

  async resendVerification(email: string): Promise<boolean> {
    await request('/api/users/verify', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return true;
  },

  async forgotPassword(email: string): Promise<void> {
    await request('/api/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await request('/api/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  async logout(): Promise<void> {
    try {
      await request('/api/users/logout', { method: 'POST' });
    } catch {}
    await setAuthToken(null);
    await setCachedUser(null);
  },

  async deleteAccount(userId: number): Promise<void> {
    await request(`/api/users/${userId}`, { method: 'DELETE' });
    await setAuthToken(null);
    await setCachedUser(null);
  },

  async getMe(): Promise<User | null> {
    try {
      const data = await request<{ user: User }>('/api/users/me');
      if (data?.user) {
        await setCachedUser(data.user);
      }
      return data?.user || null;
    } catch {
      return null;
    }
  },

  async updateProfile(userId: number, updates: Partial<User>): Promise<User> {
    const data = await request<{ doc: User }>(`/api/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    if (data.doc) {
      await setCachedUser(data.doc);
    }
    return data.doc;
  },

  // ---------------------------------------------------------------------------
  // Arenas & Court Bookings
  // ---------------------------------------------------------------------------
  async getArenas(sportType?: string): Promise<Arena[]> {
    const data = await request<{ docs: Arena[] }>('/api/arenas?depth=2&limit=50');
    let arenas = data.docs || [];
    if (sportType && sportType !== 'all') {
      arenas = arenas.filter((a) => a.Courts?.some((c) => c.sportType === sportType));
    }
    return arenas;
  },

  async getArena(id: number): Promise<Arena> {
    return await request<Arena>(`/api/arenas/${id}?depth=2`);
  },

  async checkAvailability(arenaId: number, date: string, sportType?: string): Promise<AvailabilityResponse> {
    return await request<AvailabilityResponse>('/api/bookings/check-availability', {
      method: 'POST',
      body: JSON.stringify({ arenaId, date, sportType }),
    });
  },

  async createBookingOrder(params: {
    arenaId: number;
    court: string;
    slotStarts: string[];
  }): Promise<{
    amount: number;
    currency: 'INR' | 'USD';
    arenaTitle: string;
    court: string;
    slotCount: number;
    keyId: string;
    orderId: string;
    provider: 'razorpay' | 'stripe';
    bookingIds: number[];
    createdAt: string;
  }> {
    return await request<any>('/api/bookings/create-order', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async verifyBookingPayment(params: {
    bookingId: number;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    paymentIntentId?: string;
  }): Promise<{ isPaid: boolean; paymentId: string; bookingIds: number[] }> {
    return await request<any>('/api/bookings/verify-payment', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // ---------------------------------------------------------------------------
  // Tournaments & Events
  // ---------------------------------------------------------------------------
  async getTournaments(cityId?: number): Promise<Tournament[]> {
    const query = cityId ? `&where[city][equals]=${cityId}` : '';
    const data = await request<{ docs: Tournament[] }>(`/api/tournaments?depth=2&limit=50${query}`);
    return data.docs || [];
  },

  async getTournament(id: number): Promise<Tournament> {
    return await request<Tournament>(`/api/tournaments/${id}?depth=2`);
  },

  async getEvents(tournamentId: number): Promise<Event[]> {
    const data = await request<{ docs: Event[] }>(
      `/api/events?where[tournament][equals]=${tournamentId}&sort=startdate`
    );
    return data.docs || [];
  },

  async createRegistrationOrder(eventId: number, partnerId?: number | null): Promise<any> {
    return await request<any>('/api/registrations/create-order', {
      method: 'POST',
      body: JSON.stringify({ eventId, partnerId }),
    });
  },

  async verifyRegistrationPayment(payload: {
    registrationId: number;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    paymentIntentId?: string;
  }): Promise<{ isPaid: boolean; registrationId: number }> {
    return await request<any>('/api/registrations/verify-payment', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async freeRegister(eventId: number, partnerId?: number | null): Promise<any> {
    return await request<any>('/api/registrations/free-register', {
      method: 'POST',
      body: JSON.stringify({ eventId, partnerId }),
    });
  },

  // ---------------------------------------------------------------------------
  // Matches & Live Scores
  // ---------------------------------------------------------------------------
  async getLiveMatches(): Promise<Match[]> {
    const data = await request<{ docs: Match[] }>(
      '/api/matches?where[inProgress][equals]=true&depth=2&limit=50'
    );
    const matches = data.docs || [];
    if (matches.length === 0) return [];

    // Fetch sets for all live matches concurrently so each match has populated sets with real-time scores
    const matchesWithSets = await Promise.all(
      matches.map(async (m) => {
        try {
          const setsData = await request<{ docs: SetModel[] }>(
            `/api/sets?where[match][equals]=${m.id}&sort=set&depth=0`
          );
          return {
            ...m,
            sets: setsData.docs || [],
          };
        } catch {
          return m;
        }
      })
    );

    return matchesWithSets;
  },

  async getMatches(eventId: number): Promise<Match[]> {
    const data = await request<{ docs: Match[] }>(
      `/api/matches?where[event][equals]=${eventId}&sort=round,match&depth=2&limit=200`
    );
    return data.docs || [];
  },

  async getMatch(id: number): Promise<Match> {
    return await request<Match>(`/api/matches/${id}?depth=2`);
  },

  async getMyMatches(userId: number): Promise<Match[]> {
    const query = [
      `where[or][0][player1][equals]=${userId}`,
      `where[or][1][player2][equals]=${userId}`,
      `where[or][2][player1Partner][equals]=${userId}`,
      `where[or][3][player2Partner][equals]=${userId}`,
    ].join('&');
    const data = await request<{ docs: Match[] }>(
      `/api/matches?${query}&sort=-matchDate&depth=2&limit=100`
    );
    return data.docs || [];
  },

  async getSets(matchId: number): Promise<SetModel[]> {
    const data = await request<{ docs: SetModel[] }>(
      `/api/sets?where[match][equals]=${matchId}&sort=set&depth=0`
    );
    return data.docs || [];
  },

  // ---------------------------------------------------------------------------
  // User Data & Ledger
  // ---------------------------------------------------------------------------
  async getMyBookings(): Promise<Booking[]> {
    const data = await request<{ docs: Booking[] }>(
      '/api/bookings?where[user]=me&where[isPaid][equals]=true&sort=-slotStart&depth=1'
    );
    return (data.docs || []).filter((b) => b.isPaid === true);
  },

  async getMyRegistrations(): Promise<Registration[]> {
    const data = await request<{ docs: Registration[] }>(
      '/api/registrations?where[player]=me&where[isPaid][equals]=true&depth=2'
    );
    return (data.docs || []).filter((r) => r.isPaid === true);
  },

  async getTransactions(): Promise<Transaction[]> {
    try {
      const [bookings, registrations] = await Promise.all([
        this.getMyBookings().catch(() => []),
        this.getMyRegistrations().catch(() => []),
      ]);

      const txList: Transaction[] = [];

      bookings.forEach((b) => {
        const arenaTitle = typeof b.arena === 'object' ? b.arena.title : 'Arena Booking';
        const arenaId = typeof b.arena === 'object' ? b.arena.id : typeof b.arena === 'number' ? b.arena : undefined;
        const dur = b.durationHours || 1;
        txList.push({
          id: `tx_b_${b.id}`,
          type: 'booking',
          title: arenaTitle,
          subtitle: `${b.court} • ${dur} ${dur === 1 ? 'hr' : 'hrs'}`,
          amount: b.amount || 0,
          currency: b.currency || 'INR',
          status: b.isPaid ? 'PAID' : 'PENDING',
          date: b.slotStart || new Date().toISOString(),
          paymentGateway: b.paymentGateway || 'razorpay',
          referenceId: b.razorpayPaymentId || b.paymentIntentId || `BK-${b.id}`,
          sportType: b.sportType || 'badminton',
          arenaId,
        });
      });

      registrations.forEach((r) => {
        const eventTitle = typeof r.event === 'object' ? r.event.title : 'Tournament Event';
        const eventTournamentId =
          typeof r.event === 'object'
            ? typeof r.event.tournament === 'object'
              ? r.event.tournament.id
              : typeof r.event.tournament === 'number'
              ? r.event.tournament
              : undefined
            : undefined;

        txList.push({
          id: `tx_r_${r.id}`,
          type: 'tournament_entry',
          title: eventTitle,
          subtitle: typeof r.partner === 'object' && r.partner ? `With ${r.partner.fullname}` : 'Singles Entry',
          amount: r.amount || 0,
          currency: r.currency || 'INR',
          status: r.isPaid ? 'PAID' : 'PENDING',
          date: r.createdAt || new Date().toISOString(),
          paymentGateway: r.paymentGateway || 'razorpay',
          referenceId: r.razorpayPaymentId || r.paymentIntentId || `REG-${r.id}`,
          tournamentId: eventTournamentId,
        });
      });

      return txList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch {
      return [];
    }
  },

  async searchPartners(query: string): Promise<User[]> {
    try {
      const q = encodeURIComponent(query.trim());
      const data = await request<{ docs: User[] }>(
        `/api/users?where[role][equals]=player&where[fullname][contains]=${q}&limit=20`
      );
      return data.docs || [];
    } catch {
      return [];
    }
  },
};
