import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { SlotAvailability } from '../../types';

interface SlotGridProps {
  slots: SlotAvailability[];
  selectedCourt: string;
  selectedSlots: string[]; // array of slotStart ISOs
  onToggleSlot: (slotStart: string) => void;
  maxSlots?: number;
}

const formatDisplayHour = (slot: SlotAvailability) => {
  if (slot.hourLabel && (slot.hourLabel.includes('AM') || slot.hourLabel.includes('PM'))) {
    return slot.hourLabel;
  }
  if (slot.hourLabel && slot.hourLabel.includes(':')) {
    const [hStr] = slot.hourLabel.split(':');
    const h = parseInt(hStr, 10);
    if (!isNaN(h)) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:00 ${ampm}`;
    }
  }
  if (slot.slotStart && slot.slotStart.includes('T')) {
    const timePart = slot.slotStart.split('T')[1];
    const h = parseInt(timePart.split(':')[0], 10);
    if (!isNaN(h)) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      return `${hour12}:00 ${ampm}`;
    }
  }
  return slot.hourLabel || '6:00 AM';
};

export const SlotGrid: React.FC<SlotGridProps> = ({
  slots,
  selectedCourt,
  selectedSlots,
  onToggleSlot,
  maxSlots = 8,
}) => {
  if (!slots || slots.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No slots available for this date.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>SELECT TIME SLOTS (1–8 HRS)</Text>
        <Text style={styles.slotsCount}>
          {selectedSlots.length} / {maxSlots} selected
        </Text>
      </View>

      <View style={styles.grid}>
        {slots.map((slot) => {
          const courtInfo = slot.courts?.find((c) => c.court === selectedCourt);
          const isAvailable = courtInfo ? courtInfo.available : slot.available;
          const isSelected = selectedSlots.includes(slot.slotStart);

          // Check if slot is in the past
          const slotDate = new Date(slot.slotStart);
          const isPast = slotDate.getTime() < Date.now();

          const handlePress = () => {
            if (!isAvailable || isPast) return;

            if (!isSelected && selectedSlots.length >= maxSlots) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
              Alert.alert('Limit Reached', `You can select up to ${maxSlots} hours per booking.`);
              return;
            }

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            onToggleSlot(slot.slotStart);
          };

          return (
            <TouchableOpacity
              key={slot.slotStart}
              onPress={handlePress}
              disabled={!isAvailable || isPast}
              style={[
                styles.slotChip,
                isSelected && styles.slotChipSelected,
                (!isAvailable || isPast) && styles.slotChipDisabled,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.slotTime,
                  isSelected && styles.slotTimeSelected,
                  (!isAvailable || isPast) && styles.slotTimeDisabled,
                ]}
              >
                {formatDisplayHour(slot)}
              </Text>

              {!isAvailable && !isPast && (
                <Text style={styles.takenTag}>TAKEN</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.xxl,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.2,
  },
  slotsCount: {
    color: Colors.green,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyBold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  slotChip: {
    flexBasis: '30%',
    flexGrow: 1,
    height: 54,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slotChipSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    shadowColor: '#39FF88',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  slotChipDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'rgba(255, 255, 255, 0.04)',
    opacity: 0.45,
  },
  slotTime: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontFamily: Fonts.headingSemibold,
    fontVariant: ['tabular-nums'],
  },
  slotTimeSelected: {
    color: '#0F9A52',
    fontFamily: Fonts.heading,
  },
  slotTimeDisabled: {
    color: Colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  takenTag: {
    position: 'absolute',
    bottom: 4,
    fontSize: 8,
    color: Colors.danger,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.5,
  },
});