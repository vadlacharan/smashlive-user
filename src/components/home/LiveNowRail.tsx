import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Radio } from 'lucide-react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { Match } from '../../types';
import { LiveBadge } from '../common/Badge';

interface LiveNowRailProps {
  matches: Match[];
}

export const LiveNowRail: React.FC<LiveNowRailProps> = ({ matches }) => {
  const router = useRouter();

  if (!matches || matches.length === 0) {
    return null;
  }

  const renderMatchCard = ({ item, index }: { item: Match; index: number }) => {
    const p1Name = typeof item.player1 === 'object' ? item.player1?.fullname : 'TBD';
    const p2Name = typeof item.player2 === 'object' ? item.player2?.fullname : 'TBD';
    const p1Partner = typeof item.player1Partner === 'object' ? item.player1Partner?.fullname : '';
    const p2Partner = typeof item.player2Partner === 'object' ? item.player2Partner?.fullname : '';

    const currentSet = item.sets?.find((s) => s.inProgress) || item.sets?.[0];
    const s1 = currentSet?.player1Score ?? 0;
    const s2 = currentSet?.player2Score ?? 0;
    const setNum = currentSet?.set || 1;

    return (
      <TouchableOpacity
        onPress={() => router.push(`/match/${item.id}`)}
        style={[styles.card, index === 0 && styles.cardFeatured]}
        activeOpacity={0.88}
      >
        <View style={styles.cardHeader}>
          <LiveBadge size="sm" label={`SET ${setNum}`} />
          <Text style={styles.courtLabel} numberOfLines={1}>
            {item.court || 'Court 1'}
          </Text>
        </View>

        {/* Team 1 */}
        <View style={styles.teamRow}>
          <View style={styles.teamNameCol}>
            <Text style={styles.playerName} numberOfLines={1}>
              {p1Name}
            </Text>
            {!!p1Partner && (
              <Text style={styles.partnerName} numberOfLines={1}>
                & {p1Partner}
              </Text>
            )}
          </View>
          <Text style={[styles.scoreText, s1 > s2 && styles.scoreLeading]}>{s1}</Text>
        </View>

        {/* Divider */}
        <View style={styles.scoreDivider} />

        {/* Team 2 */}
        <View style={styles.teamRow}>
          <View style={styles.teamNameCol}>
            <Text style={styles.playerName} numberOfLines={1}>
              {p2Name}
            </Text>
            {!!p2Partner && (
              <Text style={styles.partnerName} numberOfLines={1}>
                & {p2Partner}
              </Text>
            )}
          </View>
          <Text style={[styles.scoreText, s2 > s1 && styles.scoreLeading]}>{s2}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <View style={styles.livePulseDot} />
          </View>
          <Text style={styles.sectionTitle}>LIVE MATCHES</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/live')}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>View all</Text>
          <ChevronRight size={14} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={matches}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMatchCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.live,
    shadowColor: Colors.live,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bodyBold,
    fontSize: Typography.footnote,
    letterSpacing: 1.2,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
  },
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.md,
  },
  card: {
    width: 286,
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 6,
  },
  cardFeatured: {
    borderColor: 'rgba(57, 255, 136, 0.3)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.55,
    shadowRadius: 34,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  courtLabel: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodySemibold,
    maxWidth: 120,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  teamNameCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  playerName: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontFamily: Fonts.bodySemibold,
  },
  partnerName: {
    color: Colors.textTertiary,
    fontSize: Typography.footnote,
  },
  scoreText: {
    color: Colors.textSecondary,
    fontSize: Typography.title3,
    fontFamily: Fonts.heading,
    fontVariant: ['tabular-nums'],
  },
  scoreLeading: {
    color: Colors.green,
  },
  scoreDivider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: 4,
  },
});
