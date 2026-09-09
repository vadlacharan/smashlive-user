import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { Colors } from '../../theme';

interface ScreenWashProps {
  style?: ViewStyle;
}

/**
 * Design.md §2 — Screen Wash.
 * A soft green-black radial bloom at the top of the viewport fading to flat
 * charcoal by mid-screen. Rendered behind all screen content.
 */
export const ScreenWash: React.FC<ScreenWashProps> = ({ style }) => {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient
            id="screenWash"
            cx="50%"
            cy="0%"
            r="70%"
            fx="50%"
            fy="0%"
          >
            <Stop offset="0%" stopColor="#14261C" />
            <Stop offset="55%" stopColor={Colors.canvas} />
          </RadialGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#screenWash)" />
      </Svg>
    </View>
  );
};