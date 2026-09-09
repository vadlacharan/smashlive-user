import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  count?: number;
}

export const Chip: React.FC<ChipProps> = ({ label, selected, onPress, icon, count }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.chip,
          selected ? styles.chipSelected : styles.chipDefault,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text
          style={[
            styles.label,
            selected ? styles.labelSelected : styles.labelDefault,
          ]}
        >
          {label}
        </Text>
        {count !== undefined && count > 0 && (
          <View style={[styles.countBadge, selected && styles.countBadgeSelected]}>
            <Text style={[styles.countText, selected && styles.countTextSelected]}>
              {count}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
  },
  chipDefault: {
    backgroundColor: Colors.surface2,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.greenMuted,
    borderColor: 'transparent',
  },
  iconContainer: {
    marginRight: 6,
  },
  label: {
    fontSize: Typography.subhead,
    fontFamily: Fonts.bodySemibold,
  },
  labelDefault: {
    color: Colors.textSecondary,
  },
  labelSelected: {
    color: Colors.green,
  },
  countBadge: {
    marginLeft: 6,
    backgroundColor: Colors.surface3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  countBadgeSelected: {
    backgroundColor: 'rgba(57, 255, 136, 0.15)',
  },
  countText: {
    color: Colors.textPrimary,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
  },
  countTextSelected: {
    color: Colors.green,
  },
});