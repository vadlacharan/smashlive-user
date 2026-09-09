import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Colors, Spacing } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1400,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 220],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.07)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

export const ArenaCardSkeleton: React.FC = () => (
  <View style={styles.cardSkeleton}>
    <Skeleton height={150} borderRadius={BorderRadius.card} />
    <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
      <Skeleton width="70%" height={22} />
      <Skeleton width="50%" height={16} />
      <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs }}>
        <Skeleton width={80} height={26} borderRadius={BorderRadius.full} />
        <Skeleton width={90} height={26} borderRadius={BorderRadius.full} />
      </View>
    </View>
  </View>
);

export const TournamentCardSkeleton: React.FC = () => (
  <View style={styles.cardSkeleton}>
    <Skeleton height={160} borderRadius={BorderRadius.card} />
    <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
      <Skeleton width="80%" height={24} />
      <Skeleton width="55%" height={16} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.xs }}>
        <Skeleton width={100} height={20} />
        <Skeleton width={80} height={20} />
      </View>
    </View>
  </View>
);

export const HorizontalRailSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <View style={styles.horizontalRail}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={styles.horizontalRailCard}>
        <Skeleton height={140} borderRadius={BorderRadius.card} />
        <View style={{ marginTop: Spacing.sm, gap: 6 }}>
          <Skeleton width="75%" height={18} />
          <Skeleton width="50%" height={14} />
        </View>
      </View>
    ))}
  </View>
);

export const SlotGridSkeleton: React.FC = () => (
  <View style={styles.slotGridContainer}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
      <Skeleton width={180} height={16} />
      <Skeleton width={70} height={16} />
    </View>
    <View style={styles.slotGrid}>
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton
          key={i}
          width="30%"
          height={52}
          borderRadius={BorderRadius.md}
          style={{ flexGrow: 1 }}
        />
      ))}
    </View>
  </View>
);

export const NextUpCardSkeleton: React.FC = () => (
  <View style={styles.nextUpSkeleton}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md }}>
      <Skeleton width={130} height={22} borderRadius={BorderRadius.full} />
      <Skeleton width={110} height={22} borderRadius={BorderRadius.full} />
    </View>
    <Skeleton width="60%" height={24} style={{ marginBottom: 6 }} />
    <Skeleton width="40%" height={16} style={{ marginBottom: Spacing.md }} />
    <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs }}>
      <Skeleton width="48%" height={40} borderRadius={BorderRadius.md} />
      <Skeleton width="48%" height={40} borderRadius={BorderRadius.md} />
    </View>
  </View>
);

export const BookingCardSkeleton: React.FC = () => (
  <View style={styles.bookingSkeleton}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
      <Skeleton width="60%" height={20} />
      <Skeleton width={65} height={22} borderRadius={BorderRadius.full} />
    </View>
    <Skeleton width="40%" height={14} style={{ marginBottom: Spacing.sm }} />
    <View style={{ flexDirection: 'row', gap: Spacing.sm, marginTop: 4 }}>
      <Skeleton width={90} height={24} borderRadius={BorderRadius.sm} />
      <Skeleton width={80} height={24} borderRadius={BorderRadius.sm} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.surface2,
  },
  cardSkeleton: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  horizontalRail: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  horizontalRailCard: {
    width: 320,
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slotGridContainer: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.xxl,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  nextUpSkeleton: {
    marginHorizontal: Spacing.screenPadding,
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 136, 0.25)',
  },
  bookingSkeleton: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});