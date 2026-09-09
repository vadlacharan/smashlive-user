import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar, CheckCircle2, Clock, MapPin, Navigation, Zap } from 'lucide-react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { Booking } from '../../types';
import { addToCalendar, formatDateShort, formatTimeRange, openMapsDirections } from '../../utils/calendar';
import { SportBadge, StatusBadge } from '../common/Badge';

interface BookingCardProps {
  booking: Booking;
  onPress?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onPress }) => {
  const arenaTitle =
    typeof booking.arena === 'object' ? booking.arena.title : 'Arena';
  const arenaVenue =
    typeof booking.arena === 'object' ? booking.arena.venue : '';
  const arenaLocation =
    typeof booking.arena === 'object' ? booking.arena.location : undefined;

  const dateStr = formatDateShort(booking.slotStart);
  const timeStr = formatTimeRange(booking.slotStart, booking.durationHours || 1);

  const isUpcoming = new Date(booking.slotStart).getTime() >= Date.now();

  const handleDirections = () => {
    openMapsDirections(arenaLocation, arenaVenue);
  };

  const handleCalendar = () => {
    addToCalendar(
      `Court Booking: ${arenaTitle} (${booking.court})`,
      new Date(booking.slotStart),
      booking.durationHours || 1,
      arenaVenue
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.card}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.dateCol}>
          <Text style={styles.dateText}>{dateStr.toUpperCase()}</Text>
          <Text style={styles.timeText}>{timeStr}</Text>
        </View>

        <StatusBadge
          status={
            isUpcoming && booking.isPaid
              ? 'CONFIRMED'
              : isUpcoming
              ? 'UPCOMING'
              : 'COMPLETED'
          }
        />
      </View>

      {/* Main Info */}
      <View style={styles.mainInfo}>
        <Text style={styles.arenaTitle} numberOfLines={1}>
          {arenaTitle}
        </Text>
        <Text style={styles.courtName}>{booking.court}</Text>

        <View style={styles.badgeRow}>
          <SportBadge sport={booking.sportType} />
          <View style={styles.pricePill}>
            <Text style={styles.priceText}>
              ₹{booking.amount} • {booking.paymentGateway?.toUpperCase() || 'RAZORPAY'}
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      {isUpcoming && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={handleDirections}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <Navigation size={13} color={Colors.textPrimary} />
            <Text style={styles.actionText}>Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCalendar}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <Calendar size={13} color={Colors.textPrimary} />
            <Text style={styles.actionText}>Add to Calendar</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    paddingBottom: Spacing.sm,
  },
  dateCol: {
    flex: 1,
  },
  dateText: {
    color: Colors.green,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.5,
  },
  timeText: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontFamily: Fonts.headingSemibold,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  mainInfo: {
    marginBottom: Spacing.md,
  },
  arenaTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.headline,
    fontFamily: Fonts.bodyBold,
  },
  courtName: {
    color: Colors.textSecondary,
    fontSize: Typography.subhead,
    marginTop: 2,
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pricePill: {
    backgroundColor: Colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  priceText: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface2,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionText: {
    color: Colors.textPrimary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
  },
});
