import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { ArrowRight } from 'lucide-react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { Button } from '../common/Button';
import { RollingCounter } from '../common/RollingCounter';

interface PriceBarProps {
  slotCount: number;
  totalPrice: number;
  currency?: 'INR' | 'USD';
  onContinue: () => void;
  disabled?: boolean;
}

export const PriceBar: React.FC<PriceBarProps> = ({
  slotCount,
  totalPrice,
  currency = 'INR',
  onContinue,
  disabled = false,
}) => {
  const insets = useSafeAreaInsets();

  if (slotCount === 0) return null;

  const prefix = currency === 'INR' ? '₹' : '$';

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
      <BlurView intensity={40} tint="dark" style={styles.content}>
        <View style={styles.priceCol}>
          <Text style={styles.hoursLabel}>
            {slotCount} {slotCount === 1 ? 'hour' : 'hours'} selected
          </Text>
          <View style={styles.totalRow}>
            <RollingCounter
              value={totalPrice}
              prefix={prefix}
              style={styles.totalAmount}
            />
            <Text style={styles.taxLabel}>total</Text>
          </View>
        </View>

        <Button
          title="Continue"
          onPress={onContinue}
          disabled={disabled || slotCount === 0}
          icon={<ArrowRight size={18} color={Colors.textInverse} />}
          iconPosition="right"
          style={styles.continueButton}
        />
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.screenPadding,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(13, 17, 15, 0.55)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  priceCol: {
    justifyContent: 'center',
  },
  hoursLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyMedium,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  totalAmount: {
    color: Colors.textPrimary,
    fontSize: Typography.title2,
    fontFamily: Fonts.heading,
  },
  taxLabel: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    textTransform: 'uppercase',
  },
  continueButton: {
    minWidth: 140,
  },
});
