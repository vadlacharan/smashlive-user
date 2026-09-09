import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, Text, TextStyle } from 'react-native';
import { Colors, Fonts, Typography } from '../../theme';

interface RollingCounterProps {
  value: number | string;
  prefix?: string;
  suffix?: string;
  style?: StyleProp<TextStyle>;
  highlightColor?: string;
}

export const RollingCounter: React.FC<RollingCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  style,
  highlightColor = Colors.green,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [value, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Text style={[styles.text, style]}>
        {prefix}
        {value}
        {suffix}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  text: {
    color: Colors.textPrimary,
    fontSize: Typography.headline,
    fontFamily: Fonts.headingSemibold,
    fontVariant: ['tabular-nums'],
  },
});
