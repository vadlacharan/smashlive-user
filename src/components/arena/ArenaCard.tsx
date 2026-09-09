import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { ImageOff, MapPin, Star } from 'lucide-react-native';
import { useLocation } from '../../context/LocationContext';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { Arena, SportType } from '../../types';
import { getSportLabel } from '../common/Badge';
import { photoSimGradient, SportSvgIcon } from '../common/SportsIcons';
import { resolveMediaUrl } from '../../utils/media';

interface ArenaCardProps {
  arena: Arena;
  layout?: 'card' | 'horizontal' | 'compact';
}

export const ArenaCard: React.FC<ArenaCardProps> = ({ arena, layout = 'card' }) => {
  const router = useRouter();
  const { getDistanceFromUser } = useLocation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const { formatted: distanceStr } = getDistanceFromUser(arena.location);
  const minPrice =
    arena.Courts?.reduce((min, c) => (c.pricePerHour < min ? c.pricePerHour : min), Infinity) ||
    400;

  const sportCounts = arena.Courts?.reduce((acc, c) => {
    acc[c.sportType] = (acc[c.sportType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const primarySport = (Object.keys(sportCounts)[0] as SportType) || 'badminton';

  const photoUrl =
    arena.photos?.[0]?.url
      ? resolveMediaUrl(arena.photos[0].url)
      : 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push(`/arena/${arena.id}`);
  };

  const isHorizontal = layout === 'horizontal';

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={() => scaleAnim.setValue(0.97)}
        onPressOut={() =>
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 25,
            bounciness: 4,
          }).start()
        }
        activeOpacity={0.95}
        style={[
          styles.card,
          isHorizontal ? styles.horizontalCard : styles.verticalCard,
        ]}
      >
        {/* Layer 1: Photo — Layer 2: Photo Simulation fallback behind it */}
        <LinearGradient
          colors={photoSimGradient(primarySport)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Image
          source={{ uri: photoUrl }}
          style={StyleSheet.absoluteFill}
          onLoadStart={() => {
            setImageLoading(true);
            setImageError(false);
          }}
          onLoad={() => setImageLoading(false)}
          onError={() => {
            setImageLoading(false);
            setImageError(true);
          }}
        />
        {imageLoading && (
          <View style={[StyleSheet.absoluteFill, styles.imageLoadingWrap]}>
            <ActivityIndicator size="small" color={Colors.green} />
          </View>
        )}
        {imageError && (
          <View style={[StyleSheet.absoluteFill, styles.imageErrorWrap]}>
            <ImageOff size={24} color="rgba(245, 247, 246, 0.25)" />
          </View>
        )}

        {/* Neutral highlight bloom (photo-sim life) */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.07)', 'transparent']}
          style={styles.accentBloom}
        />

        {/* Layer 3: Directional scrim */}
        <LinearGradient
          colors={Colors.heroOverlay}
          style={StyleSheet.absoluteFill}
        />

        {/* Top badges */}
        <View style={styles.topBadgesRow}>
          {!!distanceStr && (
            <View style={styles.glassPill}>
              <MapPin size={11} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.pillText}>{distanceStr} away</Text>
            </View>
          )}
        </View>

        {/* Layer 4: Content on image */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.title, isHorizontal && styles.horizontalTitle]}
              numberOfLines={1}
            >
              {arena.title}
            </Text>
            {arena.rating && (
              <View style={styles.ratingPill}>
                <Star size={10} color={Colors.gold} fill={Colors.gold} />
                <Text style={styles.ratingText}>{arena.rating}</Text>
              </View>
            )}
          </View>

          <Text style={styles.venueText} numberOfLines={1}>
            {arena.venue || 'Sports Arena'}
          </Text>

          <View style={styles.footerRow}>
            <Text style={styles.priceText}>
              from <Text style={styles.priceBold}>₹{minPrice}</Text>
              <Text style={styles.priceUnit}>/hr</Text>
            </Text>
            <View style={styles.sportsRow}>
              {Object.entries(sportCounts)
                .slice(0, 2)
                .map(([sport, count]) => (
                  <View key={sport} style={styles.sportChip}>
                    <SportSvgIcon sport={sport as SportType} size={11} color="#FFFFFF" />
                    <Text style={styles.sportChipText}>
                      {getSportLabel(sport as SportType)}
                      {count > 1 ? ` ×${count}` : ''}
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 6,
    marginBottom: Spacing.md,
  },
  verticalCard: {
    height: 220,
    width: '100%',
  },
  horizontalCard: {
    width: 320,
    height: 200,
    marginRight: Spacing.md,
    marginBottom: 0,
  },
  horizontalTitle: {
    fontSize: 19,
    lineHeight: 24,
  },
  accentBloom: {
    position: 'absolute',
    top: -20,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  imageLoadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageErrorWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  glassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: Typography.micro,
    fontFamily: Fonts.bodySemibold,
  },
  content: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: Fonts.heading,
    fontSize: Typography.title3,
    flex: 1,
    letterSpacing: -0.2,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
    fontVariant: ['tabular-nums'],
  },
  venueText: {
    color: 'rgba(245, 247, 246, 0.75)',
    fontSize: Typography.footnote,
    fontFamily: Fonts.body,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceText: {
    color: 'rgba(245, 247, 246, 0.75)',
    fontSize: Typography.footnote,
    fontFamily: Fonts.body,
  },
  priceBold: {
    color: Colors.green,
    fontFamily: Fonts.headingSemibold,
    fontSize: Typography.headline,
    fontVariant: ['tabular-nums'],
  },
  priceUnit: {
    color: 'rgba(245, 247, 246, 0.6)',
    fontSize: Typography.micro,
  },
  sportsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  sportChipText: {
    color: '#FFFFFF',
    fontSize: Typography.micro,
    fontFamily: Fonts.bodySemibold,
  },
});