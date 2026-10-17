import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { Match } from '../../types';
import { formatDateShort } from '../../utils/calendar';
import { MatchChip } from './MatchChip';

interface BracketTreeProps {
  matches: Match[];
}

export const BracketTree: React.FC<BracketTreeProps> = ({ matches }) => {
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

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {rounds.map(([roundNum, roundMatches]) => {
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
            </View>

            {/* Chips column */}
            <View style={styles.matchesList}>
              {roundMatches.map((m) => (
                <MatchChip key={m.id} match={m} isFinal={isFinal} />
              ))}
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
  matchesList: {
    gap: Spacing.lg,
  },
});
