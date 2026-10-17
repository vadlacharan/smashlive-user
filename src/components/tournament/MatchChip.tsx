import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Trophy } from 'lucide-react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { Match } from '../../types';

interface MatchChipProps {
  match: Match;
  isFinal?: boolean;
}

const initialFor = (name?: string | null) => {
  return (name || '?').trim().charAt(0).toUpperCase() || '?';
};

/**
 * Clickable match card — the shared "bracket chip" used by the knockout
 * bracket and the group-stage fixtures.
 */
export const MatchChip: React.FC<MatchChipProps> = ({ match, isFinal = false }) => {
  const router = useRouter();

  const p1Name =
    typeof match.player1 === 'object' && match.player1
      ? match.player1.fullname
      : match.player1Placeholder || 'TBD';
  const p2Name =
    typeof match.player2 === 'object' && match.player2
      ? match.player2.fullname
      : match.player2Placeholder || 'TBD';

  const p1Won = Boolean(
    match.isCompleted &&
      match.winner &&
      typeof match.winner === 'object' &&
      match.winner.id === (typeof match.player1 === 'object' ? match.player1?.id : match.player1)
  );
  const p2Won = Boolean(
    match.isCompleted &&
      match.winner &&
      typeof match.winner === 'object' &&
      match.winner.id === (typeof match.player2 === 'object' ? match.player2?.id : match.player2)
  );

  const isBye = !match.player2 && match.isCompleted;
  const isLive = Boolean(match.inProgress);

  return (
    <TouchableOpacity
      onPress={() => router.push(`/match/${match.id}`)}
      style={[styles.matchCard, isFinal && styles.matchCardFinal, isLive && styles.matchCardLive]}
      activeOpacity={0.85}
    >
      <View style={styles.cardTop}>
        <Text style={styles.courtText}>{match.court || `Match ${match.match}`}</Text>
        <View style={styles.cardTags}>
          {isLive && (
            <View style={styles.livePill}>
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          {isBye && <Text style={styles.byeTag}>BYE</Text>}
          <ChevronRight size={13} color={Colors.textTertiary} />
        </View>
      </View>

      {/* Team 1 */}
      <View style={[styles.playerRow, p1Won && styles.playerRowWinner]}>
        <View
          style={[
            styles.initialCircle,
            p1Won ? styles.initialCircleWinner : styles.initialCircleNeutral,
          ]}
        >
          <Text
            style={[styles.initialText, p1Won ? styles.initialTextWinner : styles.initialTextNeutral]}
          >
            {initialFor(p1Name)}
          </Text>
        </View>
        <Text style={[styles.playerName, p1Won && styles.playerNameWinner]} numberOfLines={1}>
          {p1Name}
        </Text>
        <View style={[styles.scoreBox, p1Won && styles.scoreBoxWinner]}>
          <Text style={[styles.setScore, p1Won && styles.setScoreWinner]}>
            {match.player1SetsWon ?? 0}
          </Text>
        </View>
      </View>

      {/* Small connector arrow between the two teams */}
      <View style={styles.rowArrow}>
        <View style={styles.rowArrowGlyph} />
      </View>

      {/* Team 2 — loser shade */}
      <View style={[styles.playerRow, p2Won && styles.playerRowWinner]}>
        <View
          style={[
            styles.initialCircle,
            p2Won ? styles.initialCircleWinner : styles.initialCircleNeutral,
          ]}
        >
          <Text
            style={[styles.initialText, p2Won ? styles.initialTextWinner : styles.initialTextNeutral]}
          >
            {isBye ? 'B' : initialFor(p2Name)}
          </Text>
        </View>
        <Text style={[styles.playerName, p2Won && styles.playerNameWinner]} numberOfLines={1}>
          {isBye ? 'BYE (Advanced)' : p2Name}
        </Text>
        <View style={[styles.scoreBox, p2Won && styles.scoreBoxWinner]}>
          <Text style={[styles.setScore, p2Won && styles.setScoreWinner]}>
            {isBye ? '-' : match.player2SetsWon ?? 0}
          </Text>
        </View>
      </View>

      {isFinal && !match.isCompleted && (
        <View style={styles.finalBanner}>
          <Trophy size={11} color={Colors.gold} />
          <Text style={styles.finalBannerText}>Championship Match</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  matchCard: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.sm + 2,
    padding: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  matchCardFinal: {
    borderColor: 'rgba(251, 191, 36, 0.4)',
  },
  matchCardLive: {
    borderColor: Colors.green,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  cardTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  courtText: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodySemibold,
  },
  livePill: {
    backgroundColor: 'rgba(57, 255, 136, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  liveText: {
    color: Colors.green,
    fontSize: Typography.micro - 1,
    fontFamily: Fonts.heading,
    letterSpacing: 0.5,
  },
  byeTag: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: 6,
  },
  playerRowWinner: {
    backgroundColor: 'rgba(57, 255, 136, 0.1)',
  },
  initialCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  initialCircleWinner: {
    backgroundColor: Colors.green,
  },
  initialCircleNeutral: {
    backgroundColor: Colors.surface2,
  },
  initialText: {
    fontSize: 11,
    fontFamily: Fonts.headingSemibold,
  },
  initialTextWinner: {
    color: Colors.textInverse,
  },
  initialTextNeutral: {
    color: Colors.textTertiary,
  },
  playerName: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
    flex: 1,
    marginRight: 6,
  },
  playerNameWinner: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bodyBold,
  },
  scoreBox: {
    width: 26,
    height: 22,
    borderRadius: 5,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBoxWinner: {
    backgroundColor: 'rgba(57, 255, 136, 0.22)',
  },
  setScore: {
    color: Colors.textTertiary,
    fontSize: Typography.subhead,
    fontFamily: Fonts.bodyBold,
    fontVariant: ['tabular-nums'],
  },
  setScoreWinner: {
    color: Colors.green,
    fontFamily: Fonts.heading,
  },
  rowArrow: {
    alignItems: 'flex-end',
    paddingRight: 2,
    marginVertical: 1,
  },
  rowArrowGlyph: {
    width: 10,
    height: 10,
    borderLeftWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderBottomLeftRadius: 3,
  },
  finalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: BorderRadius.xs,
    paddingVertical: 3,
    marginTop: 4,
  },
  finalBannerText: {
    color: Colors.gold,
    fontSize: Typography.micro - 1,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.4,
  },
});
