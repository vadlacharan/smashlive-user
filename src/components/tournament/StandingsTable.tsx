import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { Match } from '../../types';

interface StandingsTableProps {
  matches: Match[];
}

interface TeamStanding {
  id: number;
  name: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
  setsWon: number;
  setsLost: number;
  setDiff: number;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ matches }) => {
  const standings = React.useMemo(() => {
    const map = new Map<number, TeamStanding>();

    matches.forEach((m) => {
      if (!m.player1 || !m.player2) return;

      const p1Id = typeof m.player1 === 'object' ? m.player1.id : m.player1;
      const p1Name = typeof m.player1 === 'object' ? m.player1.fullname : `Player ${p1Id}`;

      const p2Id = typeof m.player2 === 'object' ? m.player2.id : m.player2;
      const p2Name = typeof m.player2 === 'object' ? m.player2.fullname : `Player ${p2Id}`;

      if (!map.has(p1Id)) {
        map.set(p1Id, {
          id: p1Id,
          name: p1Name,
          played: 0,
          wins: 0,
          losses: 0,
          points: 0,
          setsWon: 0,
          setsLost: 0,
          setDiff: 0,
        });
      }

      if (!map.has(p2Id)) {
        map.set(p2Id, {
          id: p2Id,
          name: p2Name,
          played: 0,
          wins: 0,
          losses: 0,
          points: 0,
          setsWon: 0,
          setsLost: 0,
          setDiff: 0,
        });
      }

      if (m.isCompleted && m.winner) {
        const winnerId = typeof m.winner === 'object' ? m.winner.id : m.winner;
        const p1 = map.get(p1Id)!;
        const p2 = map.get(p2Id)!;

        p1.played += 1;
        p2.played += 1;
        p1.setsWon += m.player1SetsWon;
        p1.setsLost += m.player2SetsWon;
        p2.setsWon += m.player2SetsWon;
        p2.setsLost += m.player1SetsWon;

        if (winnerId === p1Id) {
          p1.wins += 1;
          p1.points += 3;
          p2.losses += 1;
        } else {
          p2.wins += 1;
          p2.points += 3;
          p1.losses += 1;
        }

        p1.setDiff = p1.setsWon - p1.setsLost;
        p2.setDiff = p2.setsWon - p2.setsLost;
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.setDiff - a.setDiff;
    });
  }, [matches]);

  if (standings.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Standings will update as matches are completed.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Table Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.rankCol]}>#</Text>
        <Text style={[styles.headerCell, styles.nameCol]}>PLAYER / TEAM</Text>
        <Text style={[styles.headerCell, styles.statCol]}>P</Text>
        <Text style={[styles.headerCell, styles.statCol]}>W</Text>
        <Text style={[styles.headerCell, styles.statCol]}>L</Text>
        <Text style={[styles.headerCell, styles.statCol]}>PTS</Text>
        <Text style={[styles.headerCell, styles.statCol]}>DIFF</Text>
      </View>

      {/* Rows */}
      {standings.map((team, idx) => (
        <View key={team.id} style={[styles.dataRow, idx === 0 && styles.leaderRow]}>
          <Text style={[styles.rankText, idx === 0 && styles.leaderText]}>{idx + 1}</Text>
          <Text style={[styles.nameText, idx === 0 && styles.leaderText]} numberOfLines={1}>
            {team.name}
          </Text>
          <Text style={styles.statText}>{team.played}</Text>
          <Text style={styles.statText}>{team.wins}</Text>
          <Text style={styles.statText}>{team.losses}</Text>
          <Text style={[styles.statText, styles.pointsText, idx === 0 && styles.leaderText]}>
            {team.points}
          </Text>
          <Text style={[styles.statText, team.setDiff > 0 && styles.positiveDiff]}>
            {team.setDiff > 0 ? `+${team.setDiff}` : team.setDiff}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginHorizontal: Spacing.screenPadding,
    marginVertical: Spacing.md,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerCell: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    fontFamily: Fonts.heading,
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  leaderRow: {
    backgroundColor: 'rgba(57, 255, 136, 0.06)',
  },
  rankCol: {
    width: 28,
  },
  nameCol: {
    flex: 1,
  },
  statCol: {
    width: 34,
    textAlign: 'center',
  },
  rankText: {
    width: 28,
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyBold,
  },
  nameText: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.subhead,
    fontFamily: Fonts.bodySemibold,
  },
  leaderText: {
    color: Colors.green,
    fontFamily: Fonts.bodyBold,
  },
  statText: {
    width: 34,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    fontVariant: ['tabular-nums'],
  },
  pointsText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.heading,
  },
  positiveDiff: {
    color: Colors.green,
    fontFamily: Fonts.bodyBold,
  },
});
