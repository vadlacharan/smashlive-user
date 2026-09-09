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
import { Calendar, ChevronRight, MapPin, Trophy, UserPlus } from 'lucide-react-native';
import { useLocation } from '../../context/LocationContext';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { Tournament } from '../../types';
import { formatDateShort } from '../../utils/calendar';
import { resolveMediaUrl } from '../../utils/media';
import { toTitleCase } from '../../utils/text';
import { LiveBadge } from '../common/Badge';

interface TournamentCardProps {
  tournament: Tournament;
  layout?: 'card' | 'horizontal';
  featured?: boolean;
}

export const TournamentCard: React.FC<TournamentCardProps> = ({
  tournament,
  layout = 'card',
  featured = false,
}) => {
  const router = useRouter();
  const { getDistanceFromUser } = useLocation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const { formatted: distanceStr } = getDistanceFromUser(tournament.venueLocation);

  const cityName =
    typeof tournament.city === 'object' ? tournament.city?.name : '';
  const deadlineStr = tournament.tournamentRegistrationEndDate
    ? formatDateShort(tournament.tournamentRegistrationEndDate)
    : tournament.registrationDeadline
      ? formatDateShort(tournament.registrationDeadline)
      : '';

  const photoUrl =
    tournament.thumbnail?.[0]?.url
      ? resolveMediaUrl(tournament.thumbnail[0].url)
      : 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.push(`/tournament/${tournament.id}`);
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
          featured && styles.featuredRing,
        ]}
      >
        {/* Photo + simulation layers */}
        <LinearGradient
          colors={['#33261B', '#14201A', '#0F1512']}
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
            <Trophy size={26} color="rgba(245, 247, 246, 0.25)" />
          </View>
        )}
        <LinearGradient
          colors={['rgba(255, 216, 115, 0.1)', 'transparent']}
          style={styles.accentBloom}
        />
        <LinearGradient
          colors={Colors.heroOverlay}
          style={StyleSheet.absoluteFill}
        />

        {/* Top badges */}
        <View style={styles.topBadgesRow}>
          {tournament.isLive ? (
            <LiveBadge label="LIVE DRAW" size="sm" />
          ) : (
            <View style={styles.glassPill}>
              <Text style={styles.glassText}>{cityName || 'OPEN'}</Text>
            </View>
          )}

          {tournament.prizePool && (
            <View style={styles.prizePill}>
              <Trophy size={11} color={Colors.gold} />
              <Text style={styles.prizeText}>{tournament.prizePool}</Text>
            </View>
          )}
        </View>

        {/* Content on image */}
        <View style={styles.content}>
          <Text
            style={[styles.title, isHorizontal && styles.horizontalTitle]}
            numberOfLines={1}
          >
            {toTitleCase(tournament.title)}
          </Text>
          <Text style={styles.venueText} numberOfLines={1}>
            {tournament.venue}
          </Text>

          <View style={styles.footerRow}>
            <View style={styles.metaItem}>
              <Calendar size={12} color="rgba(245, 247, 246, 0.6)" />
              <Text style={styles.metaText}>Deadline: {deadlineStr}</Text>
            </View>

            {/* Register pill — Directions-style translucent white */}
            <View style={styles.actionPill}>
              {tournament.isLive ? (
                <Trophy size={12} color="#FFFFFF" strokeWidth={2.4} />
              ) : (
                <UserPlus size={12} color="#FFFFFF" strokeWidth={2.4} />
              )}
              <Text style={styles.actionText}>
                {tournament.isLive ? 'View Draw' : 'Register'}
              </Text>
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
    height: 228,
    width: '100%',
  },
  horizontalCard: {
    width: 320,
    height: 205,
    marginRight: Spacing.md,
    marginBottom: 0,
  },
  horizontalTitle: {
    fontSize: 19,
    lineHeight: 24,
  },
  featuredRing: {
    borderWidth: 1,
    borderColor: 'rgba(57,255,136,0.25)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 34,
    elevation: 10,
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
    backgroundColor: 'rgba(20, 16, 10, 0.55)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  glassText: {
    color: Colors.textPrimary,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.3,
  },
  prizePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 16, 10, 0.55)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 216, 115, 0.3)',
  },
  prizeText: {
    color: Colors.gold,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
  },
  content: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 12,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: Fonts.heading,
    fontSize: Typography.title3,
    letterSpacing: -0.2,
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
    marginTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: 'rgba(245, 247, 246, 0.65)',
    fontSize: Typography.micro,
    fontFamily: Fonts.body,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: Typography.footnote,
    fontFamily: Fonts.headingSemibold,
  },
});