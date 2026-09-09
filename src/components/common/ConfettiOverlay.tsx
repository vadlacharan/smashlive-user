import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';
import { Colors } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const NUM_PARTICLES = 30;

const PARTICLE_COLORS = [
  Colors.green,
  Colors.greenDark,
  '#FFB84D',
  '#4DA6FF',
  '#F5F7F6',
  '#FF4D6D',
];

interface ParticleProps {
  index: number;
}

const Particle: React.FC<ParticleProps> = ({ index }) => {
  const startX = Math.random() * SCREEN_WIDTH;
  const targetX = startX + (Math.random() * 120 - 60);
  const targetY = SCREEN_HEIGHT * 0.7 + Math.random() * 200;
  const size = 8 + Math.random() * 8;
  const color = PARTICLE_COLORS[index % PARTICLE_COLORS.length];
  const delay = Math.random() * 300;

  const yAnim = useRef(new Animated.Value(-20)).current;
  const xAnim = useRef(new Animated.Value(startX)).current;
  const rotAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(yAnim, {
          toValue: targetY,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(xAnim, {
          toValue: targetX,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(rotAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(delay + 1400),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, targetX, targetY, xAnim, yAnim, rotAnim, opacityAnim]);

  const spin = rotAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size * (Math.random() > 0.5 ? 1.6 : 1),
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? 2 : size / 2,
          transform: [
            { translateX: xAnim },
            { translateY: yAnim },
            { rotate: spin },
          ],
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

export const ConfettiOverlay: React.FC<{ active?: boolean }> = ({ active = true }) => {
  if (!active) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
