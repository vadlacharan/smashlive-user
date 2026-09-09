import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { SportType } from '../../types';
import { SportSvgIcon } from './SportsIcons';

interface LiveBadgeProps {
  label?: string;
  size?: 'sm' | 'md';
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({ label = 'LIVE', size = 'sm' }) => {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseAnim]);

  const isSmall = size === 'sm';

  return (
    <View style={[styles.liveContainer, isSmall && styles.liveContainerSm]}>
      <Animated.View
        style={[
          styles.liveDot,
          isSmall && styles.liveDotSm,
          { opacity: pulseAnim },
        ]}
      />
      <Text style={[styles.liveText, isSmall && styles.liveTextSm]}>{label}</Text>
    </View>
  );
};

export const SportIcon: React.FC<{ sport: SportType; size?: number; color?: string }> = ({
  sport,
  size = 14,
  color = Colors.green,
}) => <SportSvgIcon sport={sport} size={size} color={color} />;

export function getSportLabel(sport: SportType): string {
  switch (sport) {
    case 'badminton':
      return 'Badminton';
    case 'cricket-turf':
      return 'Cricket Turf';
    case 'box-cricket':
      return 'Box Cricket';
    case 'pickleball':
      return 'Pickleball';
    case 'football':
      return 'Football / Futsal';
    case 'swimming':
      return 'Swimming';
    case 'gym':
      return 'Gym';
    default:
      return sport;
  }
}

export const SportBadge: React.FC<{ sport: SportType; count?: number; active?: boolean }> = ({
  sport,
  count,
  active = false,
}) => {
  return (
    <View style={[styles.sportBadge, active && styles.sportBadgeActive]}>
      <SportIcon sport={sport} size={13} color={active ? Colors.textInverse : Colors.green} />
      <Text style={[styles.sportText, active && styles.sportTextActive]}>
        {getSportLabel(sport)}
        {count !== undefined && count > 0 ? ` ×${count}` : ''}
      </Text>
    </View>
  );
};

export const StatusBadge: React.FC<{
  status: 'PAID' | 'PENDING' | 'FAILED' | 'UPCOMING' | 'COMPLETED' | 'LIVE' | 'REFUNDED' | 'CONFIRMED' | 'WAITLISTED' | 'FULL';
}> = ({ status }) => {
  let bg: string = Colors.surface2;
  let text: string = Colors.textSecondary;

  switch (status) {
    case 'PAID':
    case 'UPCOMING':
    case 'LIVE':
    case 'CONFIRMED':
      bg = Colors.greenMuted;
      text = Colors.green;
      break;
    case 'PENDING':
    case 'WAITLISTED':
      bg = Colors.warningMuted;
      text = Colors.warning;
      break;
    case 'FAILED':
    case 'REFUNDED':
    case 'FULL':
      bg = Colors.dangerMuted;
      text = Colors.danger;
      break;
    case 'COMPLETED':
      bg = Colors.surface2;
      text = Colors.textSecondary;
      break;
  }

  return (
    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color: text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.live,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 6,
    shadowColor: Colors.live,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  liveContainerSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  liveDotSm: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: Typography.footnote,
    fontFamily: Fonts.heading,
    letterSpacing: 0.5,
  },
  liveTextSm: {
    fontSize: Typography.micro,
  },
  sportBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 13, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  sportBadgeActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  sportText: {
    color: Colors.textPrimary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyMedium,
  },
  sportTextActive: {
    color: Colors.textInverse,
    fontFamily: Fonts.bodyBold,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.5,
  },
});