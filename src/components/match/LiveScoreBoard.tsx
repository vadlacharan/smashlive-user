import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { Match, SetModel } from '../../types';
import { RollingCounter } from '../common/RollingCounter';

interface LiveScoreBoardProps {
  match: Match;
  sets: SetModel[];
}

export const LiveScoreBoard: React.FC<LiveScoreBoardProps> = ({ match, sets = [] }) => {
  const p1Name = typeof match.player1 === 'object' && match.player1 ? match.player1.fullname : 'TBD';
  const p2Name = typeof match.player2 === 'object' && match.player2 ? match.player2.fullname : 'TBD';
  const p1Partner = typeof match.player1Partner === 'object' && match.player1Partner ? match.player1Partner.fullname : '';
  const p2Partner = typeof match.player2Partner === 'object' && match.player2Partner ? match.player2Partner.fullname : '';

  const activeSet =
    sets.find((s) => s.inProgress) ||
    sets.filter((s) => s.isCompleted)[sets.filter((s) => s.isCompleted).length - 1] ||
    sets[0] || {
      set: 1,
      player1Score: 0,
      player2Score: 0,
    };

  const isP1Serving =
    match.currentServer ===
    (typeof match.player1 === 'object' && match.player1 ? match.player1.id : match.player1);

  const winnerId =
    typeof match.winner === 'object' && match.winner !== null ? match.winner.id : match.winner;
  const p1Id =
    typeof match.player1 === 'object' && match.player1 !== null ? match.player1.id : match.player1;
  const p2Id =
    typeof match.player2 === 'object' && match.player2 !== null ? match.player2.id : match.player2;

  const isP1Winner = Boolean(match.isCompleted && winnerId && winnerId === p1Id);
  const isP2Winner = Boolean(match.isCompleted && winnerId && winnerId === p2Id);

  const statusLabel = match.inProgress ? `Set ${activeSet.set} Live` : match.isCompleted ? 'Final' : 'Upcoming';

  return (
    <View style={styles.container}>
      <View style={styles.scoreboard}>
        {/* Top row — court + status, quiet */}
        <View style={styles.topRow}>
          <Text style={styles.courtText}>{match.court || 'Court 1'}</Text>
          <View style={styles.statusRow}>
            {match.inProgress && <View style={styles.liveDot} />}
            <Text style={[styles.statusText, match.isCompleted && styles.statusTextFinal]}>
              {statusLabel}
            </Text>
            {match.isCompleted && <Trophy size={12} color={Colors.gold} />}
          </View>
        </View>

        {/* Score */}
        <View style={styles.scoreGrid}>
          <View style={styles.sideCol}>
            <View style={styles.playerNameRow}>
              <Text
                style={[
                  styles.playerName,
                  isP1Winner && styles.winnerName,
                  match.isCompleted && !isP1Winner && styles.loserName,
                ]}
                numberOfLines={1}
              >
                {p1Name}
              </Text>
              {isP1Serving && match.inProgress && <View style={styles.serverDot} />}
            </View>
            {!!p1Partner && (
              <Text
                style={[styles.partnerName, match.isCompleted && !isP1Winner && styles.loserName]}
                numberOfLines={1}
              >
                + {p1Partner}
              </Text>
            )}
            <Text style={[styles.setsWonText, isP1Winner && styles.setsWonWinner]}>
              {match.player1SetsWon ?? 0} sets
            </Text>
          </View>

          <View style={styles.scoreCenterWrapper}>
            <View style={styles.scoreCenter}>
              <RollingCounter
                value={activeSet.player1Score ?? 0}
                style={[
                  styles.bigScore,
                  activeSet.player1Score > activeSet.player2Score && styles.scoreLead,
                ]}
              />
              <Text style={styles.scoreColon}>:</Text>
              <RollingCounter
                value={activeSet.player2Score ?? 0}
                style={[
                  styles.bigScore,
                  activeSet.player2Score > activeSet.player1Score && styles.scoreLead,
                ]}
              />
            </View>
          </View>

          <View style={[styles.sideCol, { alignItems: 'flex-end' }]}>
            <View style={[styles.playerNameRow, { justifyContent: 'flex-end' }]}>
              {!isP1Serving && match.inProgress && <View style={styles.serverDot} />}
              <Text
                style={[
                  styles.playerName,
                  { textAlign: 'right' },
                  isP2Winner && styles.winnerName,
                  match.isCompleted && !isP2Winner && styles.loserName,
                ]}
                numberOfLines={1}
              >
                {p2Name}
              </Text>
            </View>
            {!!p2Partner && (
              <Text
                style={[
                  styles.partnerName,
                  { textAlign: 'right' },
                  match.isCompleted && !isP2Winner && styles.loserName,
                ]}
                numberOfLines={1}
              >
                + {p2Partner}
              </Text>
            )}
            <Text style={[styles.setsWonText, isP2Winner && styles.setsWonWinner]}>
              {match.player2SetsWon ?? 0} sets
            </Text>
          </View>
        </View>

        {/* Set history — plain, no pills */}
        {sets.length > 0 && (
          <View style={styles.setHistoryRow}>
            {sets.map((s) => (
              <View
                key={s.set}
                style={[styles.setHistoryItem, s.inProgress && styles.setHistoryItemActive]}
              >
                <Text style={styles.setNumLabel}>S{s.set}</Text>
                <Text style={styles.setScoresText}>
                  {s.player1Score}–{s.player2Score}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    marginVertical: Spacing.sm,
  },
  scoreboard: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  courtText: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodySemibold,
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  statusText: {
    color: Colors.textSecondary,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.6,
  },
  statusTextFinal: {
    color: Colors.gold,
  },
  scoreGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginVertical: Spacing.sm,
  },
  sideCol: {
    flex: 1,
    justifyContent: 'center',
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serverDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.green,
  },
  playerName: {
    color: Colors.textPrimary,
    fontFamily: Fonts.headingSemibold,
    fontSize: Typography.headline,
    flexShrink: 1,
  },
  winnerName: {
    color: Colors.textPrimary,
  },
  loserName: {
    color: Colors.textTertiary,
  },
  partnerName: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    marginTop: 1,
  },
  setsWonText: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodySemibold,
    marginTop: 6,
    fontVariant: ['tabular-nums'],
  },
  setsWonWinner: {
    color: Colors.gold,
  },
  scoreCenterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bigScore: {
    fontFamily: Fonts.heading,
    fontSize: Typography.display,
    color: Colors.textSecondary,
    minWidth: 36,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  scoreLead: {
    color: Colors.textPrimary,
  },
  scoreColon: {
    color: Colors.textTertiary,
    fontSize: Typography.title2,
    marginHorizontal: 3,
    fontFamily: Fonts.heading,
  },
  setHistoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  setHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
  },
  setHistoryItemActive: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.green,
  },
  setNumLabel: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    fontFamily: Fonts.heading,
    letterSpacing: 0.5,
  },
  setScoresText: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyBold,
    fontVariant: ['tabular-nums'],
  },
});
