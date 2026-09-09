import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import Svg, { Circle } from 'react-native-svg';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { ScreenWash } from './ScreenWash';
import { ShuttlecockIcon } from './SportsIcons';

interface BadmintonLoaderProps {
  message?: string;
  submessage?: string;
  fullscreen?: boolean;
}

const RING_SIZE = 148;

/** The badminton swing Lottie animation — used on the launch splash. */
export const BadmintonSplashAnim: React.FC<{ size?: number }> = ({ size = 300 }) => (
  <LottieView
    source={require('../../../assets/Badminton Animation.json')}
    autoPlay
    loop
    style={{ width: size, height: size }}
  />
);

export const LoadingOrb: React.FC = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const ringSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const tilt = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const spin = Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    float.start();
    tilt.start();
    spin.start();
    return () => {
      float.stop();
      tilt.stop();
      spin.stop();
    };
  }, [floatAnim, rotateAnim, ringSpin]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [6, -8],
  });
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '10deg'],
  });
  const ringRotate = ringSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.orbWrapper}>
      {/* Glow halo */}
      <LinearGradient
        colors={['rgba(57,255,136,0.18)', 'rgba(57,255,136,0.02)']}
        style={styles.halo}
      />
      {/* Spinning progress ring */}
      <Animated.View style={{ transform: [{ rotate: ringRotate }] }}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={(RING_SIZE - 4) / 2}
            stroke="rgba(57,255,136,0.25)"
            strokeWidth={3}
            fill="none"
            strokeDasharray="12 26"
            strokeLinecap="round"
          />
          <Circle
            cx={RING_SIZE / 2}
            cy={RING_SIZE / 2}
            r={(RING_SIZE - 4) / 2}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
            fill="none"
          />
        </Svg>
      </Animated.View>
      {/* Floating shuttlecock */}
      <Animated.View
        style={[
          styles.shuttleWrapper,
          { transform: [{ translateY }, { rotate }] },
        ]}
      >
        <ShuttlecockIcon size={56} color={Colors.green} />
      </Animated.View>
      {/* Baseline glow */}
      <View style={styles.baseline} />
    </View>
  );
};

export const SplashProgressBar: React.FC = () => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-90, 90],
  });

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, { transform: [{ translateX }] }]} />
    </View>
  );
};

export const BadmintonLoader: React.FC<BadmintonLoaderProps> = ({
  message = 'Loading...',
  submessage,
  fullscreen = false,
}) => {
  const content = (
    <View style={styles.cardContainer}>
      {fullscreen ? (
        <BadmintonSplashAnim size={320} />
      ) : (
        <LoadingOrb />
      )}
      <Text style={styles.messageText} allowFontScaling={false}>{message}</Text>
      {submessage ? <Text style={styles.submessageText}>{submessage}</Text> : null}
      {fullscreen && <SplashProgressBar />}
    </View>
  );

  if (fullscreen) {
    return (
      <View style={styles.fullscreenContainer}>
        <ScreenWash />
        <LinearGradient
          colors={['rgba(57,255,136,0.06)', 'rgba(11,15,13,0)']}
          style={StyleSheet.absoluteFill}
        />
        {content}
        {/* Brand Watermark — bottom */}
        <View style={styles.brandRow}>
          <ShuttlecockIcon size={20} color={Colors.green} />
          <Text
            style={styles.brandText}
            allowFontScaling={false}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            SMASHLIVE
          </Text>
        </View>
      </View>
    );
  }

  return <View style={styles.inlineContainer}>{content}</View>;
};

const styles = StyleSheet.create({
  fullscreenContainer: {
    flex: 1,
    backgroundColor: Colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    paddingBottom: 140,
  },
  inlineContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    gap: 10,
    paddingHorizontal: Spacing.xl,
    zIndex: 2,
    elevation: 2,
  },
  brandText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.heading,
    fontSize: 16,
    letterSpacing: 1,
  },
  orbWrapper: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  halo: {
    position: 'absolute',
    width: RING_SIZE + 60,
    height: RING_SIZE + 60,
    borderRadius: (RING_SIZE + 60) / 2,
    opacity: 0.8,
  },
  shuttleWrapper: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseline: {
    position: 'absolute',
    bottom: 8,
    width: 44,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(57,255,136,0.25)',
  },
  messageText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.headingSemibold,
    fontSize: Typography.title3,
    textAlign: 'center',
    letterSpacing: 0,
    marginTop: Spacing.md,
  },
  submessageText: {
    color: Colors.textTertiary,
    fontFamily: Fonts.body,
    fontSize: Typography.footnote,
    textAlign: 'center',
    marginTop: Spacing.sm,
    maxWidth: 280,
    lineHeight: 18,
  },
  progressTrack: {
    marginTop: Spacing.xxl,
    width: 180,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(57, 255, 136, 0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    width: 90,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.green,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
});