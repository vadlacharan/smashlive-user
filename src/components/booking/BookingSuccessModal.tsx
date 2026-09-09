import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Check, CheckCircle2, Navigation, QrCode, Zap } from 'lucide-react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { addToCalendar, formatDateShort, formatTimeRange, openMapsDirections } from '../../utils/calendar';
import { Button } from '../common/Button';
import { ConfettiOverlay } from '../common/ConfettiOverlay';

interface BookingSuccessModalProps {
  visible: boolean;
  arenaTitle: string;
  court: string;
  slotStart: string;
  durationHours: number;
  totalAmount: number;
  paymentRef: string;
  venue?: string;
  venueCoords?: [number, number];
  onClose: () => void;
}

export const BookingSuccessModal: React.FC<BookingSuccessModalProps> = ({
  visible,
  arenaTitle,
  court,
  slotStart,
  durationHours,
  totalAmount,
  paymentRef,
  venue,
  venueCoords,
  onClose,
}) => {
  const router = useRouter();

  if (!visible) return null;

  const dateStr = formatDateShort(slotStart);
  const timeStr = formatTimeRange(slotStart, durationHours);

  const handleCalendar = () => {
    addToCalendar(
      `Court Booking: ${arenaTitle} (${court})`,
      new Date(slotStart),
      durationHours,
      venue
    );
  };

  const handleDirections = () => {
    openMapsDirections(venueCoords, venue);
  };

  const handleDone = () => {
    onClose();
    router.replace('/profile/bookings');
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <ConfettiOverlay active={visible} />

        <View style={styles.modalCard}>
          {/* Green Check Ring */}
          <View style={styles.checkRingWrapper}>
            <View style={styles.checkRing}>
              <Check size={36} color={Colors.textInverse} strokeWidth={3} />
            </View>
          </View>

          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your slot on {court} has been reserved.
          </Text>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Arena</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {arenaTitle}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Court</Text>
              <Text style={styles.detailValue}>{court}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {dateStr} • {timeStr}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Paid</Text>
              <Text style={[styles.detailValue, styles.amountValue]}>
                ₹{totalAmount}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Ref</Text>
              <Text style={styles.refValue} numberOfLines={1}>
                {paymentRef}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsCol}>
            <View style={styles.quickButtonsRow}>
              <Button
                title="Add to Calendar"
                onPress={handleCalendar}
                variant="secondary"
                size="sm"
                icon={<Calendar size={15} color={Colors.textPrimary} />}
                style={{ flex: 1 }}
              />
              <Button
                title="Directions"
                onPress={handleDirections}
                variant="secondary"
                size="sm"
                icon={<Navigation size={15} color={Colors.textPrimary} />}
                style={{ flex: 1 }}
              />
            </View>

            <Button
              title="View My Bookings"
              onPress={handleDone}
              variant="primary"
              fullWidth
              style={{ marginTop: Spacing.sm }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.screenPadding,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.sheet,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(57, 255, 136, 0.4)',
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  checkRingWrapper: {
    marginBottom: Spacing.md,
  },
  checkRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
  successTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.title2,
    fontFamily: Fonts.heading,
    marginBottom: 4,
    textAlign: 'center',
  },
  successSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: {
    color: Colors.textTertiary,
    fontSize: Typography.footnote,
  },
  detailValue: {
    color: Colors.textPrimary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
    maxWidth: '65%',
    textAlign: 'right',
  },
  amountValue: {
    color: Colors.green,
    fontFamily: Fonts.bodyBold,
  },
  refValue: {
    color: Colors.textSecondary,
    fontSize: Typography.micro,
    fontVariant: ['tabular-nums'],
  },
  actionsCol: {
    width: '100%',
    gap: Spacing.sm,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
});
