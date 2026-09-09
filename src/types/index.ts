export type SportType =
  | 'badminton'
  | 'cricket-turf'
  | 'box-cricket'
  | 'pickleball'
  | 'football'
  | 'swimming'
  | 'gym';

export interface User {
  id: number;
  email: string;
  fullname: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  role: 'player' | 'organiser' | 'umpire';
  profilePicture?: {
    id: number;
    url: string;
  } | null;
}

export interface City {
  id: number;
  name: string;
  state?: string;
}

export interface Media {
  id: number;
  url: string;
  alt?: string;
}

export interface Tournament {
  id: number;
  title: string;
  venue: string;
  venueLocation?: [number, number]; // [longitude, latitude]
  tournamentRegistrationEndDate?: string;
  registrationDeadline?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  city?: City | number;
  thumbnail?: Media[];
  organiser?: User | number;
  createdAt?: string;
  updatedAt?: string;
  // Computed / UI properties
  events?: Event[];
  isLive?: boolean;
  distanceKm?: number;
  prizePool?: string;
  additionalEventDiscountPrice?: number;
}

export interface CourtConfig {
  CourtIdentifier: string;
  sportType: SportType;
  pricePerHour: number;
}

export interface Event {
  id: number;
  title: string;
  description?: string;
  tournament: Tournament | number;
  eventType: 'singles' | 'doubles';
  pairingType?: 'round-robin' | 'single-elimination';
  numberOfSets: number;
  maxScore: number;
  startdate: string;
  enddate: string;
  startTime?: string;
  endTime?: string;
  duration?: '30' | '60';
  intervalBetweenMatches?: '5' | '10';
  Courts?: { CourtIdentifier: string }[];
  registrationDeadline: string;
  cost: number;
  currency: 'INR' | 'USD';
  areMatchesGenerated: boolean;
  registeredCount?: number;
  maxTeams?: number;
}

export interface Registration {
  id: number;
  event: Event | number;
  player: User | number;
  partner?: User | number | null;
  playerEmail?: string;
  isPaid: boolean;
  paymentGateway?: 'razorpay' | 'stripe';
  paymentStatus?: 'pending' | 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  amount?: number;
  currency?: 'INR' | 'USD';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentIntentId?: string;
  paidAt?: string;
  paymentVerifiedAt?: string;
  createdAt?: string;
}

export interface Match {
  id: number;
  event: Event | number;
  player1?: User | number;
  player2?: User | number;
  player1Partner?: User | number | null;
  player2Partner?: User | number | null;
  umpire?: User | number | null;
  winner?: User | number | null;
  player1SetsWon: number;
  player2SetsWon: number;
  matchDate?: string;
  court?: string;
  round: number;
  match: number;
  winnerRound?: number;
  winnerMatch?: number;
  isCompleted: boolean;
  inProgress: boolean;
  // Computed / UI
  sets?: SetModel[];
  currentServer?: number;
}

export interface SetModel {
  id: number;
  match: Match | number;
  set: number;
  player1Score: number;
  player2Score: number;
  winner?: User | number | null;
  isCompleted: boolean;
  inProgress: boolean;
}

export interface Rally {
  id: number;
  set: SetModel | number;
  rallyWinner: User | number;
  rallyNumber?: number;
  currentServer?: number;
  nextServer?: number;
  timestamp?: string;
}

export interface Arena {
  id: number;
  title: string;
  description?: string;
  organiser?: User | number;
  city?: City | number;
  venue?: string;
  location?: [number, number]; // [longitude, latitude]
  photos?: Media[];
  openTime?: string;
  closeTime?: string;
  currency: 'INR' | 'USD';
  Courts: CourtConfig[];
  isActive: boolean;
  // Derived / UI properties
  distanceKm?: number;
  minPrice?: number;
  isOpenNow?: boolean;
  sportsOffered?: SportType[];
  rating?: number;
  reviewCount?: number;
}

export interface SlotAvailability {
  slotStart: string;
  hourLabel: string;
  available: boolean;
  courts: {
    court: string;
    sportType: SportType;
    pricePerHour: number;
    available: boolean;
  }[];
}

export interface AvailabilityResponse {
  date: string;
  openTime?: string;
  closeTime?: string;
  currency: 'INR' | 'USD';
  slots: SlotAvailability[];
}

export interface Booking {
  id: number;
  user: User | number;
  userEmail?: string;
  arena: Arena | number;
  court: string;
  sportType: SportType;
  slotStart: string; // ISO date string
  slotEnd?: string;
  isPaid: boolean;
  paymentGateway?: 'razorpay' | 'stripe';
  paymentStatus?: 'pending' | 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
  amount: number;
  currency: 'INR' | 'USD';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentIntentId?: string;
  paidAt?: string;
  createdAt: string;
  // Merged visual slot group properties
  durationHours?: number;
  contiguousSlots?: string[];
}

export interface Transaction {
  id: string;
  type: 'booking' | 'tournament_entry';
  title: string;
  subtitle: string;
  sportType?: SportType;
  amount: number;
  currency: 'INR' | 'USD';
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  date: string;
  paymentGateway: 'razorpay' | 'stripe' | 'free';
  referenceId: string;
  arenaId?: number;
  tournamentId?: number;
  eventId?: number;
}

export interface GeoLocationCoords {
  latitude: number;
  longitude: number;
  cityName?: string;
  areaName?: string;
}
