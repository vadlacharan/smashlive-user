import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CornerDownRight, Trophy } from 'lucide-react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { Match } from '../../types';
import { formatDateShort } from '../../utils/calendar';

interface BracketTreeProps {
  matches: Match[];
}

export const BracketTree: React.FC<BracketTreeProps> = ({ matches }) => {
  const router = useRouter();

  // Group matches by round (1 = R1, 2 = QF, 3 = SF, 4 = Final)
  const rounds = React.useMemo(() => {
    const map = new Map<number, Match[]>();
    matches.forEach((m) => {
      const list = map.get(m.round) || [];
      list.push(m);
      map.set(m.round, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [matches]);

  if (!matches || matches.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Bracket fixtures will be generated once registration closes.</Text>
      </View>
    );
  }

  const totalRounds = rounds.length;

  const getRoundName = (roundNum: number, totalRounds: number) => {
    if (roundNum === totalRounds) return 'Final';
    return `Round ${roundNum}`;
  };

  const roundDate = (list: Match[]) => {
    const d = list.find((m) => m.matchDate)?.matchDate;
    return d ? formatDateShort(d) : '';
  };

  // Active round — where a match is currently in progress, else the Final
  const activeRound = React.useMemo(() => {
    const liveRound = rounds.find(([, list]) => list.some((m) => m.inProgress && !m.isCompleted));
    return liveRound ? liveRound[0] : totalRounds;
  }, [rounds, totalRounds]);

  const initialFor = (name?: string | null) => {
    return (name || '?').trim().charAt(0).toUpperCase() || '?';
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {rounds.map(([roundNum, roundMatches], colIdx) => {
        const isActive = roundNum === activeRound;
        const isFinal = roundNum === totalRounds;

        return (
          <View key={roundNum} style={styles.roundGroup}>
            {/* Round header card — same level across all rounds */}
            <View style={[styles.roundHeader, isActive && styles.roundHeaderActive]}>
              <Text style={[styles.roundTitle, isActive && styles.roundTitleActive]}>
                {getRoundName(roundNum, totalRounds)}
              </Text>
              <Text style={[styles.roundSub, isActive && styles.roundSubActive]} numberOfLines={1}>
                {roundDate(roundMatches) || `${roundMatches.length} matches`}
              </Text>
              {isFinal && (
                <View style={[styles.roundFinalDot, isActive && styles.roundFinalDotActive]}>
                  <Trophy size={10} color={isActive ? Colors.textInverse : Colors.gold} />
                </View>
              )}
            </View>

            {/* Chips column */}
            <View style={styles.matchesList}>
              <View style={styles.matchItem}>
                {roundMatches.map((m, idx) => {
                  const p1Name = typeof m.player1 === 'object' ? m.player1?.fullname : 'TBD';
                  const p2Name = typeof m.player2 === 'object' ? m.player2?.fullname : 'TBD';
                  const p1Won = Boolean(m.isCompleted && m.winner && typeof m.winner === 'object' && m.winner.id === (typeof m.player1 === 'object' ? m.player1?.id : m.player1));
                  const p2Won = Boolean(m.isCompleted && m.winner && typeof m.winner === 'object' && m.winner.id === (typeof m.player2 === 'object' ? m.player2?.id : m.player2));

                  const isBye = !m.player2 && m.isCompleted;
                  const isLive = m.inProgress;

                  return (
                    <View key={m.id}>
                      {idx > 0 && <View style={styles.connectorStub} />}
                      <TouchableOpacity
                        onPress={() => router.push(`/match/${m.id}`)}
                        style={[
                          styles.matchCard,
                          isFinal && styles.matchCardFinal,
                          isLive && styles.matchCardLive,
                        ]}
                        activeOpacity={0.85}
                      >
                        {/* Team 1 — highlighted (winner / top seed colour) */}
                        <View style={[styles.playerRow, p1Won && styles.playerRowWinner]}>
                          <View
                            style={[
                              styles.initialCircle,
                              p1Won ? styles.initialCircleWinner : styles.initialCircleNeutral,
                            ]}
                          >
                            <Text
                              style={[
                                styles.initialText,
                                p1Won ? styles.initialTextWinner : styles.initialTextNeutral,
                              ]}
                            >
                              {initialFor(p1Name)}
                            </Text>
                          </View>
                          <Text
                            style={[styles.playerName, p1Won && styles.playerNameWinner]}
                            numberOfLines={1}
                          >
                            {p1Name}
                          </Text>
                          <View style={[styles.scoreBox, p1Won && styles.scoreBoxWinner]}>
                            <Text style={[styles.setScore, p1Won && styles.setScoreWinner]}>
                              {m.player1SetsWon}
                            </Text>
                          </View>
                        </View>

                        {/* Small connector arrow between the two teams */}
                        <View style={styles.rowArrow}>
                          <CornerDownRight size={11} color="rgba(255, 255, 255, 0.25)" strokeWidth={2.2} />
                        </View>

                        {/* Team 2 —
  loser shade */}
                        <View style={[styles.playerRow, p2Won && styles.playerRowWinner]}>
                          <View
                            style={[
                              styles.initialCircle,
                              p2Won ? styles.initialCircleWinner : styles.initialCircleNeutral,
                            ]}
                          >
                            <Text
                              style={[
                                styles.initialText,
                                p2Won ? styles.initialTextWinner : styles.initialTextNeutral,
                              ]}
                            >
                              {isBye ? 'B' : initialFor(p2Name)}
                            </Text>
                          </View>
                          <Text
                            style={[styles.playerName, p2Won && styles.playerNameWinner]}
                            numberOfLines={1}
                          >
                            {isBye ? 'BYE (Advanced)' : p2Name}
                          </Text>
                          <View style={[styles.scoreBox, p2Won && styles.scoreBoxWinner]}>
                            <Text style={[styles.setScore, p2Won && styles.setScoreWinner]}>
                              {isBye ? '-' : m.player2SetsWon}
                            </Text>
                          </View>
                        </View>

                        {isLive && (
                          <View style={styles.liveTag}>
                            <Text style={styles.liveText}>LIVE</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    alignItems: 'flex-start',
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    textAlign: 'center',
  },
  roundGroup: {
    width: 216,
    marginRight: Spacing.xl,
  },
  roundHeader: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: Spacing.md,
  },
  roundHeaderActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  roundTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.heading,
    letterSpacing: 0.4,
  },
  roundTitleActive: {
    color: Colors.textInverse,
  },
  roundSub: {
    color: Colors.textTertiary,
    fontSize: Typography.micro - 1,
    fontFamily: Fonts.body,
    marginTop: 1,
  },
  roundSubActive: {
    color: 'rgba(11, 15, 13, 0.6)',
  },
  roundFinalDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundFinalDotActive: {
    backgroundColor: 'rgba(11, 15, 13, 0.2)',
  },
  matchesList: {
    gap: Spacing.md,
  },
  matchItem: {
    gap: 0,
  },
  connectorStub: {
    width: 16,
    height: 2,
    backgroundColor: Colors.divider,
    marginLeft: 8,
    marginBottom: Spacing.xs,
  },
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
  liveTag: {
    position: 'absolute',
    top: 5,
    right: 5,
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
});
