import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Calendar, ChevronRight, MapPin, Navigation, Trophy } from 'lucide-react-native';
import { BorderRadius, Fonts, Spacing, Typography } from '../../theme';
import { Booking, Match, SportType } from '../../types';
import {
  addToCalendar,
  formatDateShort,
  formatTimeRange,
  openMapsDirections,
} from '../../utils/calendar';
import { getSportLabel } from '../common/Badge';
import { SportSvgIcon } from '../common/SportsIcons';

interface NextUpCardProps {
  booking?: Booking;
  match?: Match;
}

// One hue per card — drawn from the app's accent palette (info blue, amber, green, live pink)
const CARD_HUES: Record<string, { from: string; to: string }> = {
  badminton: { from: '#4DA6FF', to: '#2F62C9' }, // info blue — the km-away pill color
  'cricket-turf': { from: '#FFC96B', to: '#C97E2B' }, // warning amber
  'box-cricket': { from: '#FFC96B', to: '#C97E2B' },
  pickleball: { from: '#5CFFA3', to: '#1BA75F' }, // brand green
  football: { from: '#5CB0FF', to: '#3F6BD1' }, // blue
  swimming: { from: '#6FC8FF', to: '#3E87C9' }, // cyan-blue
  gym: { from: '#FF7A8C', to: '#C93F55' }, // live pink
  tournament: { from: '#FF7A8C', to: '#C93F55' },
};

const hueFor = (booking?: Booking, match?: Match) => {
  if (booking) return CARD_HUES[booking.sportType] || CARD_HUES.badminton;
  return CARD_HUES.tournament;
};

export const NextUpCard: React.FC<NextUpCardProps> = ({ booking, match }) => {
  const router = useRouter();

  if (!booking && !match) {
    return null;
  }

  const isBooking = !!booking;
  const hue = hueFor(booking, match);
  const sportType = (isBooking ? booking.sportType : undefined) as SportType | undefined;

  const title = isBooking
    ? typeof booking.arena === 'object'
      ? booking.arena.title
      : 'Arena'
    : typeof match?.event === 'object'
    ? match.event.title
    : 'Tournament Match';

  const venueAddress = isBooking && typeof booking.arena === 'object' ? booking.arena.venue : '';

  const slotStart = isBooking ? booking.slotStart : match?.matchDate || new Date().toISOString();
  const dateFormatted = formatDateShort(slotStart);
  const timeFormatted = isBooking
    ? formatTimeRange(slotStart, booking.durationHours || 1)
    : '6:30 PM';

  const handlePressCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (isBooking && typeof booking.arena === 'object') {
      router.push(`/arena/${booking.arena.id}`);
    } else if (match) {
      router.push(`/match/${match.id}`);
    }
  };

  const handleDirections = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    if (isBooking && typeof booking.arena === 'object') {
      openMapsDirections(booking.arena.location, booking.arena.venue);
    }
  };

  const handleCalendar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    addToCalendar(
      `${isBooking ? 'Court Booking' : 'Match'}: ${title}`,
      new Date(slotStart),
      isBooking ? booking?.durationHours || 1 : 1,
      venueAddress || 'SmashLive Arena'
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={handlePressCard}
        style={[styles.cardTouchable, { shadowColor: hue.to }]}
      >
        <View style={styles.card}>
          {/* Solid diagonal gradient — one hue per card */}
          <LinearGradient
            colors={[hue.from, hue.to]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Decorative ring — faint white arc bleeding off the top-right */}
          <View style={[styles.decorRing, { borderColor: 'rgba(255, 255, 255, 0.12)' }]} />
          <View style={[styles.decorRingSmall, { borderColor: 'rgba(255, 255, 255, 0.07)' }]} />

          {/* Top row: sport pill (left) · chevron (right) */}
          <View style={styles.topRow}>
            <View style={styles.sportPill}>
              {isBooking ? (
                <SportSvgIcon sport={sportType || 'badminton'} size={13} color="#FFFFFF" />
              ) : (
                <Trophy size={13} color="#FFFFFF" />
              )}
              <Text style={styles.sportPillText} numberOfLines={1}>
                {isBooking && sportType ? getSportLabel(sportType) : 'Tournament Match'}
              </Text>
            </View>

            <View style={styles.chevronChip}>
              <ChevronRight size={16} color="rgba(255, 255, 255, 0.85)" strokeWidth={2.5} />
            </View>
          </View>

          {/* Headline — the arena / event name */}
          <Text style={styles.headlineText} numberOfLines={1}>
            {title}
          </Text>

          {/* Date + time — inline, middot-separated */}
          <View style={styles.dateRow}>
            <Text style={styles.dateText}>
              {dateFormatted} • {timeFormatted}
            </Text>
            {!!venueAddress && (
              <View style={styles.venueRow}>
                <MapPin size={12} color="rgba(255, 255, 255, 0.7)" />
                <Text style={styles.venueText} numberOfLines={1}>
                  {venueAddress}
                </Text>
              </View>
            )}
          </View>

          {/* Bottom row — flat pills */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={handleDirections}
              style={styles.directionsBtn}
              activeOpacity={0.85}
            >
              <Navigation size={14} color="#FFFFFF" />
              <Text style={styles.directionsText}>Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCalendar}
              style={[styles.calendarBtn, { backgroundColor: '#FFFFFF' }]}
              activeOpacity={0.85}
            >
              <Calendar size={14} color={hue.to} />
              <Text style={[styles.calendarText, { color: hue.to }]}>Add to Calendar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.xxl,
  },
  cardTouchable: {
    borderRadius: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 34,
    elevation: 10,
  },
  card: {
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 14,
    paddingTop: 16,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden',
    position: 'relative',
  },
  decorRing: {
    position: 'absolute',
    top: -70,
    right: -60,
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1.5,
  },
  decorRingSmall: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sportPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  sportPillText: {
    color: '#FFFFFF',
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
    letterSpacing: 0.2,
    maxWidth: 160,
  },
  chevronChip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  headlineText: {
    color: '#FFFFFF',
    fontFamily: Fonts.heading,
    fontSize: 23,
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  dateRow: {
    marginBottom: Spacing.lg,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: Typography.body,
    fontFamily: Fonts.bodyMedium,
    fontVariant: ['tabular-nums'],
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  venueText: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: Typography.footnote,
    fontFamily: Fonts.body,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: Spacing.md,
  },
  directionsBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingVertical: 11,
    borderRadius: BorderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  directionsText: {
    color: '#FFFFFF',
    fontSize: Typography.footnote,
    fontFamily: Fonts.headingSemibold,
  },
  calendarBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: BorderRadius.full,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  calendarText: {
    fontSize: Typography.footnote,
    fontFamily: Fonts.headingSemibold,
  },
});