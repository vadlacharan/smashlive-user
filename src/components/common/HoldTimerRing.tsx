import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Clock } from 'lucide-react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';

interface HoldTimerRingProps {
  createdAt?: string | Date;
  holdDurationMinutes?: number; // default 15 mins
  onExpire?: () => void;
}

export const HoldTimerRing: React.FC<HoldTimerRingProps> = ({
  createdAt = new Date(),
  holdDurationMinutes = 15,
  onExpire,
}) => {
  const totalSeconds = holdDurationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createdTime = new Date(createdAt).getTime();
    const expiryTime = createdTime + totalSeconds * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, totalSeconds]);

  const isUnderTwoMinutes = secondsRemaining <= 120 && secondsRemaining > 0;

  useEffect(() => {
    if (isUnderTwoMinutes) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isUnderTwoMinutes, pulseAnim]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const size = 26;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (secondsRemaining / totalSeconds) * circumference;

  const strokeColor = isUnderTwoMinutes ? Colors.warning : Colors.green;

  return (
    <Animated.View
      style={[
        styles.container,
        isUnderTwoMinutes && styles.containerWarning,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <View style={styles.ringWrapper}>
        <Svg width={size} height={size}>
          <Circle
            stroke={Colors.surface3}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke={strokeColor}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.iconCenter}>
          <Clock size={11} color={strokeColor} />
        </View>
      </View>

      <Text style={[styles.timerText, { color: strokeColor }]}>{formatted}</Text>
    </Animated.View>
  );
};

export const HoldTimerBanner: React.FC<HoldTimerRingProps> = ({
  createdAt = new Date(),
  holdDurationMinutes = 15,
  onExpire,
}) => {
  const totalSeconds = holdDurationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalSeconds);

  useEffect(() => {
    const createdTime = new Date(createdAt).getTime();
    const expiryTime = createdTime + totalSeconds * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt, totalSeconds]);

  const isUnderTwoMinutes = secondsRemaining <= 120 && secondsRemaining > 0;
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const accentColor = isUnderTwoMinutes ? Colors.warning : Colors.green;

  return (
    <View style={[styles.bannerContainer, isUnderTwoMinutes && styles.bannerWarning]}>
      <View style={[styles.bannerIconWrapper, { backgroundColor: isUnderTwoMinutes ? 'rgba(234, 179, 8, 0.15)' : Colors.greenMuted }]}>
        <Clock size={16} color={accentColor} />
      </View>
      <View style={styles.bannerTextCol}>
        <View style={styles.bannerHeaderRow}>
          <Text style={styles.bannerTitle}>15-MINUTE SLOT HOLD ACTIVE</Text>
          <Text style={[styles.bannerTimer, { color: accentColor }]}>{formatted}</Text>
        </View>
        <Text style={styles.bannerSubtitle}>
          These slots are locked exclusively for you. Complete payment before the timer expires.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 5,
  },
  containerWarning: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warningMuted,
  },
  ringWrapper: {
    width: 26,
    height: 26,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyBold,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 136, 0.35)',
    gap: Spacing.sm,
  },
  bannerWarning: {
    borderColor: Colors.warning,
    backgroundColor: Colors.warningMuted,
  },
  bannerIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  bannerTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.micro,
    fontFamily: Fonts.heading,
    letterSpacing: 0.6,
  },
  bannerTimer: {
    fontSize: Typography.footnote,
    fontFamily: Fonts.heading,
    fontVariant: ['tabular-nums'],
  },
  bannerSubtitle: {
    color: Colors.textTertiary,
    fontSize: Typography.caption,
    lineHeight: 16,
  },
});
