import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Award, Calendar, Clock, MapPin, Shield, Users, Zap } from 'lucide-react-native';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Header } from '../../src/components/common/Header';
import { RefreshButton } from '../../src/components/common/RefreshButton';
import { LiveScoreBoard } from '../../src/components/match/LiveScoreBoard';
import { useMatch, useMatchSets } from '../../src/hooks/useLiveMatches';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function MatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const matchId = Number(id) || 0;

  const {
    data: match,
    isLoading: matchLoading,
    refetch: refetchMatch,
    isRefetching: isMatchRefetching,
  } = useMatch(matchId);

  const {
    data: sets = [],
    isLoading: setsLoading,
    refetch: refetchSets,
    isRefetching: isSetsRefetching,
  } = useMatchSets(matchId);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchMatch(), refetchSets()]);
    setRefreshing(false);
  }, [refetchMatch, refetchSets]);

  const isRefetchingAll = isMatchRefetching || isSetsRefetching || refreshing;

  if (matchLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={Colors.green} />
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.container}>
        <Header title="Match Not Found" showBack />
        <EmptyState
          icon="award"
          title="Match Not Found"
          description="This match could not be found or has not been scheduled yet."
        />
      </View>
    );
  }

  const eventTitle =
    typeof match.event === 'object' && match.event ? match.event.title : 'Tournament Match';

  const p1Name = typeof match.player1 === 'object' && match.player1 ? match.player1.fullname : 'TBD';
  const p2Name = typeof match.player2 === 'object' && match.player2 ? match.player2.fullname : 'TBD';

  return (
    <View style={styles.container}>
      <Header
        title={eventTitle}
        subtitle={`Match #${match.match || 1} • Round ${match.round || 1}`}
        showBack
        rightAction={
          <RefreshButton
            onPress={handleRefresh}
            isRefreshing={isRefetchingAll}
          />
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetchingAll}
            onRefresh={handleRefresh}
            tintColor={Colors.green}
            colors={[Colors.green]}
          />
        }
      >
        {/* Live Scoreboard */}
        <LiveScoreBoard match={match} sets={sets} />

        {/* Sets Breakdown Card */}
        {sets.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Sets Breakdown</Text>

            <View style={styles.setsTable}>
              <View style={styles.tableHeaderRow}>
                <Text style={[styles.tableColHeader, { flex: 1.2 }]}>SET</Text>
                <Text style={[styles.tableColHeader, { flex: 2 }]}>{p1Name}</Text>
                <Text style={[styles.tableColHeader, { flex: 2, textAlign: 'right' }]}>{p2Name}</Text>
                <Text style={[styles.tableColHeader, { flex: 1.5, textAlign: 'right' }]}>STATUS</Text>
              </View>

              {sets.map((s) => {
                const isSetFinished = s.isCompleted || (s.player1Score > 0 || s.player2Score > 0);
                return (
                  <View key={s.set} style={[styles.tableRow, s.inProgress && styles.tableRowActive]}>
                    <Text style={[styles.setNumberText, { flex: 1.2 }]}>Set {s.set}</Text>
                    <Text
                      style={[
                        styles.setScoreVal,
                        { flex: 2 },
                        s.player1Score > s.player2Score && isSetFinished && styles.scoreWon,
                      ]}
                    >
                      {s.player1Score}
                    </Text>
                    <Text
                      style={[
                        styles.setScoreVal,
                        { flex: 2, textAlign: 'right' },
                        s.player2Score > s.player1Score && isSetFinished && styles.scoreWon,
                      ]}
                    >
                      {s.player2Score}
                    </Text>
                    <View style={[{ flex: 1.5, alignItems: 'flex-end' }]}>
                      {s.inProgress ? (
                        <Text style={styles.statusLiveText}>LIVE</Text>
                      ) : s.isCompleted ? (
                        <Text style={styles.statusDoneText}>FINAL</Text>
                      ) : (
                        <Text style={styles.statusPendingText}>-</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.huge,
  },
  card: {
    backgroundColor: Colors.surface1,
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    color: Colors.textTertiary,
    fontSize: Typography.caption,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.2,
    marginBottom: Spacing.md,
  },
  setsTable: {
    marginTop: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tableColHeader: {
    color: Colors.textTertiary,
    fontSize: Typography.caption,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  tableRowActive: {
    backgroundColor: 'rgba(57, 255, 136, 0.06)',
    borderRadius: BorderRadius.xs,
    paddingHorizontal: 4,
  },
  setNumberText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    fontFamily: Fonts.bodyBold,
  },
  setScoreVal: {
    color: Colors.textPrimary,
    fontSize: Typography.subhead,
    fontFamily: Fonts.heading,
    fontVariant: ['tabular-nums'],
  },
  scoreWon: {
    color: Colors.green,
  },
  statusLiveText: {
    color: Colors.green,
    fontSize: 9,
    fontFamily: Fonts.heading,
  },
  statusDoneText: {
    color: Colors.textTertiary,
    fontSize: 9,
    fontFamily: Fonts.bodyBold,
  },
  statusPendingText: {
    color: Colors.textTertiary,
    fontSize: Typography.caption,
  },
});
