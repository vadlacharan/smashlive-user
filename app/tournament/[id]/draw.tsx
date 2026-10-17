import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react-native';
import { api } from '../../../src/api/client';
import { Chip } from '../../../src/components/common/Chip';
import { Header } from '../../../src/components/common/Header';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { RefreshButton } from '../../../src/components/common/RefreshButton';
import { ScreenWash } from '../../../src/components/common/ScreenWash';
import { Skeleton } from '../../../src/components/common/Skeleton';
import { BracketTree } from '../../../src/components/tournament/BracketTree';
import { MatchChip } from '../../../src/components/tournament/MatchChip';
import { StandingsTable } from '../../../src/components/tournament/StandingsTable';
import { useAuth } from '../../../src/context/AuthContext';
import { useMatches } from '../../../src/hooks/useLiveMatches';
import { useEvents, useTournament } from '../../../src/hooks/useTournaments';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../../src/theme';
import { Event, Match } from '../../../src/types';

type TabKey = 'bracket' | 'standings' | 'groups' | 'knockout';

const nameOf = (v: unknown): string => {
  if (v && typeof v === 'object' && 'fullname' in v) {
    return (v as { fullname?: string }).fullname || 'TBD';
  }
  return 'TBD';
};

type GroupData = Awaited<ReturnType<typeof api.getGroupStandings>>;

/** Tab 1 — group brackets: teams + clickable match cards per group */
function GroupBrackets({
  matches,
  groupData,
}: {
  matches: Match[];
  groupData: GroupData | null;
}) {
  const groupMatches = useMemo(() => matches.filter((m) => m.phase === 'group'), [matches]);

  const groupNames = useMemo(() => {
    const set = new Set<string>();
    groupMatches.forEach((m) => {
      if (m.groupName) set.add(m.groupName);
    });
    (groupData?.groups ?? []).forEach((g) => set.add(g.groupName));
    return Array.from(set).sort();
  }, [groupMatches, groupData]);

  const standingsByGroup = useMemo(
    () => new Map((groupData?.groups ?? []).map((g) => [g.groupName, g])),
    [groupData]
  );

  if (!groupNames.length) {
    return (
      <EmptyState
        icon="trophy"
        title="Groups Not Generated Yet"
        description="The organizer hasn't drawn the groups for this event yet."
      />
    );
  }

  return (
    <>
      {groupNames.map((groupName) => {
        const standings = standingsByGroup.get(groupName);
        const fixtures = groupMatches
          .filter((m) => m.groupName === groupName)
          .sort((a, b) => (a.round || 1) - (b.round || 1) || (a.match || 1) - (b.match || 1));

        // Teams in the group — standings order when available, otherwise the
        // draw order from the fixtures.
        const teams: string[] = standings?.standings.length
          ? standings.standings.map((s) => s.playerName)
          : (() => {
              const seen = new Set<string>();
              const list: string[] = [];
              fixtures.forEach((m) => {
                [nameOf(m.player1), nameOf(m.player2)].forEach((n) => {
                  if (n && n !== 'TBD' && !seen.has(n)) {
                    seen.add(n);
                    list.push(n);
                  }
                });
              });
              return list;
            })();

        return (
          <View key={groupName} style={styles.groupCard}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{groupName}</Text>
              <Text style={styles.groupMeta}>
                {fixtures.filter((f) => f.isCompleted).length}/{fixtures.length} played
              </Text>
            </View>

            {teams.length > 0 && (
              <View style={styles.teamsBlock}>
                <Text style={styles.blockLabel}>TEAMS</Text>
                <View style={styles.teamsWrap}>
                  {teams.map((teamName, idx) => (
                    <View key={`${teamName}-${idx}`} style={styles.teamChip}>
                      <Text style={styles.teamChipIndex}>{idx + 1}</Text>
                      <Text style={styles.teamChipName} numberOfLines={1}>
                        {teamName}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {fixtures.length > 0 && (
              <View style={styles.matchesBlock}>
                <Text style={styles.blockLabel}>MATCHES</Text>
                <View style={styles.matchesList}>
                  {fixtures.map((m) => (
                    <MatchChip key={m.id} match={m} />
                  ))}
                </View>
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}

/** Tab 2 — group standings tables with qualifier badges */
function GroupStandingsTables({
  event,
  groupData,
  hasGroupMatches,
}: {
  event?: Event;
  groupData: GroupData | null;
  hasGroupMatches: boolean;
}) {
  const { user } = useAuth();

  const groupSets = event?.groupStageSets ?? event?.numberOfSets ?? 3;
  const groupScore = event?.groupStageMaxScore ?? event?.maxScore ?? 21;

  const groups = groupData?.groups ?? [];

  if (!groups.length) {
    return (
      <EmptyState
        icon="trophy"
        title="Standings Not Available Yet"
        description={
          user
            ? hasGroupMatches
              ? 'Standings appear here as group matches are completed.'
              : 'The organizer has not drawn the groups for this event yet.'
            : 'Sign in to view live standings.'
        }
      />
    );
  }

  return (
    <>
      {/* Qualification status */}
      <View style={styles.qualificationBanner}>
        <Trophy size={14} color={Colors.gold} />
        <Text style={styles.qualificationText}>
          {groupData?.allGroupMatchesDone
            ? 'All group matches complete — knockout bracket seeded with the qualifiers.'
            : `Top ${groupData?.qualifiersPerGroup ?? event?.qualifiersPerGroup ?? 2} from each group qualify for the knockout stages.`}
          {`  •  Best of ${groupSets} sets, first to ${groupScore} points.`}
        </Text>
      </View>

      {groups.map((group) => (
        <View key={group.groupName} style={styles.groupCard}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>{group.groupName}</Text>
            <Text style={styles.groupMeta}>
              {groupData?.pointsPerWin ?? event?.pointsPerWin ?? 3} pts / win
            </Text>
          </View>

          <View style={styles.groupTableHeader}>
            <Text style={[styles.gColRank, styles.groupHeaderCell]}>#</Text>
            <Text style={[styles.gColName, styles.groupHeaderCell]}>PLAYER</Text>
            <Text style={[styles.gColNum, styles.groupHeaderCell]}>P</Text>
            <Text style={[styles.gColNum, styles.groupHeaderCell]}>W</Text>
            <Text style={[styles.gColNum, styles.groupHeaderCell]}>L</Text>
            <Text style={[styles.gColNum, styles.groupHeaderCell]}>DIFF</Text>
            <Text style={[styles.gColNum, styles.groupHeaderCell]}>PTS</Text>
          </View>

          {group.standings.map((row, idx) => {
            const isQualifier = group.qualifiers.includes(row.playerId);
            return (
              <View
                key={row.playerId}
                style={[styles.groupRow, isQualifier && styles.groupRowQualifier]}
              >
                <View style={styles.gColRank}>
                  <Text style={[styles.rankText, isQualifier && styles.qualifierText]}>
                    {idx + 1}
                  </Text>
                </View>
                <View style={styles.gColName}>
                  <Text
                    style={[styles.playerName, isQualifier && styles.qualifierText]}
                    numberOfLines={1}
                  >
                    {row.playerName}
                  </Text>
                </View>
                <Text style={[styles.gColNum, styles.statText]}>{row.played}</Text>
                <Text style={[styles.gColNum, styles.statText]}>{row.wins}</Text>
                <Text style={[styles.gColNum, styles.statText]}>{row.losses}</Text>
                <Text
                  style={[
                    styles.gColNum,
                    styles.statText,
                    row.setDiff > 0 && styles.positiveDiff,
                    row.setDiff < 0 && styles.negativeDiff,
                  ]}
                >
                  {row.setDiff > 0 ? `+${row.setDiff}` : row.setDiff}
                </Text>
                <Text style={[styles.gColNum, styles.pointsText]}>{row.points}</Text>
                {isQualifier && (
                  <View style={styles.qBadge}>
                    <Text style={styles.qBadgeText}>Q</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}
    </>
  );
}

export default function TournamentDrawScreen() {
  const { id, eventId: eventIdParam } = useLocalSearchParams<{ id: string; eventId?: string }>();
  const tournamentId = Number(id) || 1;
  const lockedEventId = Number(eventIdParam) || 0;

  const { data: tournament, refetch: refetchTournament } = useTournament(tournamentId);
  const { data: events = [], refetch: refetchEvents } = useEvents(tournamentId);

  const [selectedEventId, setSelectedEventId] = useState<number>(0);
  const activeEventId = lockedEventId || selectedEventId || events[0]?.id || 0;
  const activeEvent = events.find((e) => e.id === activeEventId);
  const isGroupsKnockout = activeEvent?.['Pairing Type'] === 'groups-knockout';

  const { user } = useAuth();

  const {
    data: matches = [],
    isLoading: matchesLoading,
    refetch: refetchMatches,
    isRefetching: isMatchesRefetching,
  } = useMatches(activeEventId);

  const {
    data: groupData = null,
    isLoading: groupStandingsLoading,
    refetch: refetchGroupStandings,
  } = useQuery({
    queryKey: ['group-standings', activeEventId],
    queryFn: () => api.getGroupStandings(activeEventId),
    enabled: isGroupsKnockout && !!activeEventId && !!user,
    refetchInterval: 20000,
    staleTime: 15_000,
  });

  const [activeTab, setActiveTab] = useState<TabKey>('groups');
  const [refreshing, setRefreshing] = useState(false);

  // Keep the default tab sensible per format/event
  useEffect(() => {
    setActiveTab(isGroupsKnockout ? 'groups' : 'bracket');
  }, [isGroupsKnockout, activeEventId]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refetchTournament(),
      refetchEvents(),
      refetchMatches(),
      isGroupsKnockout ? refetchGroupStandings() : Promise.resolve(),
    ]);
    setRefreshing(false);
  }, [refetchTournament, refetchEvents, refetchMatches, refetchGroupStandings, isGroupsKnockout]);

  const isRefetchingAll = isMatchesRefetching || refreshing;

  const bracketMatches = isGroupsKnockout
    ? matches.filter((m) => m.phase === 'knockout')
    : matches;

  const hasGroupMatches = matches.some((m) => m.phase === 'group');

  const tabs: { key: TabKey; label: string }[] = isGroupsKnockout
    ? [
        { key: 'groups', label: 'Groups' },
        { key: 'standings', label: 'Standings' },
        { key: 'knockout', label: 'Knockout' },
      ]
    : [
        { key: 'bracket', label: 'Bracket' },
        { key: 'standings', label: 'Points Table' },
      ];

  const koFormatBanner = isGroupsKnockout ? (
    <View style={styles.koFormatBanner}>
      <Text style={styles.koFormatText}>
        Knockout stage — Best of {activeEvent?.knockoutStageSets ?? activeEvent?.numberOfSets ?? 3}{' '}
        sets, first to {activeEvent?.knockoutStageMaxScore ?? activeEvent?.maxScore ?? 21} points
      </Text>
    </View>
  ) : null;

  const contentLoading =
    (matchesLoading && !refreshing) ||
    (isGroupsKnockout && activeTab === 'standings' && groupStandingsLoading && !refreshing);

  const renderContent = () => {
    if (activeTab === 'groups') {
      return <GroupBrackets matches={matches} groupData={groupData} />;
    }

    if (activeTab === 'standings') {
      if (isGroupsKnockout) {
        return (
          <GroupStandingsTables
            event={activeEvent}
            groupData={groupData}
            hasGroupMatches={hasGroupMatches}
          />
        );
      }
      return (
        <StandingsTable matches={matches} pointsPerWin={activeEvent?.pointsPerWin ?? undefined} />
      );
    }

    // bracket / knockout tabs
    if (isGroupsKnockout) {
      if (bracketMatches.length === 0) {
        return (
          <EmptyState
            icon="award"
            title="Knockout Bracket Not Ready"
            description="The knockout bracket is generated together with the groups — it will appear here once the draw is published."
          />
        );
      }
      return (
        <>
          {koFormatBanner}
          <BracketTree matches={bracketMatches} />
        </>
      );
    }

    return <BracketTree matches={bracketMatches} />;
  };

  return (
    <View style={styles.container}>
      <ScreenWash />
      <Header
        title={lockedEventId && activeEvent ? 'Event Draw' : 'Tournament Draw'}
        subtitle={
          lockedEventId && activeEvent ? activeEvent.title : tournament?.title || 'Draws & Standings'
        }
        showBack
        rightAction={<RefreshButton onPress={handleRefresh} isRefreshing={isRefetchingAll} />}
      />

      {/* Event Selection Chips — hidden when opened for a specific event */}
      {!lockedEventId && events.length > 0 && (
        <View style={styles.eventsScroll}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {events.map((e) => (
              <Chip
                key={e.id}
                label={e.title}
                selected={activeEventId === e.id}
                onPress={() => setSelectedEventId(e.id)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tab Switcher */}
      <View style={styles.tabSwitcherRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {contentLoading ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.skeletonBox}>
            <Skeleton width="60%" height={18} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={160} borderRadius={BorderRadius.card} />
            <View style={{ height: 16 }} />
            <Skeleton width="100%" height={160} borderRadius={BorderRadius.card} />
          </View>
        </ScrollView>
      ) : matches.length === 0 ? (
        <EmptyState
          icon="trophy"
          title="Draws Not Generated Yet"
          description="The tournament organizers will publish the draw once player registrations conclude."
          actionTitle="Refresh Draw"
          onAction={handleRefresh}
        />
      ) : (
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
          {renderContent()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  eventsScroll: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  tabSwitcherRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface1,
    marginHorizontal: Spacing.screenPadding,
    marginVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  tabButtonActive: {
    backgroundColor: Colors.green,
  },
  tabButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.subhead,
    fontFamily: Fonts.bodyBold,
  },
  tabButtonTextActive: {
    color: Colors.textInverse,
  },
  scrollContent: {
    paddingBottom: Spacing.huge,
  },
  skeletonBox: {
    paddingHorizontal: Spacing.screenPadding,
  },
  qualificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  qualificationText: {
    color: Colors.gold,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
    flex: 1,
    lineHeight: 18,
  },
  groupCard: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface2,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  groupTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.subhead,
    fontFamily: Fonts.heading,
    letterSpacing: 0.4,
  },
  groupMeta: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodySemibold,
  },
  blockLabel: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    fontFamily: Fonts.heading,
    letterSpacing: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  teamsBlock: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  teamsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  teamChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: '100%',
  },
  teamChipIndex: {
    color: Colors.green,
    fontSize: Typography.micro,
    fontFamily: Fonts.heading,
  },
  teamChipName: {
    color: Colors.textPrimary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
    flexShrink: 1,
  },
  groupTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  groupHeaderCell: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    fontFamily: Fonts.heading,
    letterSpacing: 0.6,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  groupRowQualifier: {
    backgroundColor: 'rgba(57, 255, 136, 0.06)',
  },
  gColRank: {
    width: 24,
  },
  gColName: {
    flex: 1,
    paddingRight: 6,
  },
  gColNum: {
    width: 36,
    textAlign: 'center',
  },
  rankText: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyBold,
  },
  playerName: {
    color: Colors.textPrimary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
  },
  qualifierText: {
    color: Colors.green,
    fontFamily: Fonts.bodyBold,
  },
  statText: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    fontVariant: ['tabular-nums'],
  },
  positiveDiff: {
    color: Colors.green,
  },
  negativeDiff: {
    color: Colors.danger,
  },
  pointsText: {
    color: Colors.textPrimary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.heading,
    fontVariant: ['tabular-nums'],
  },
  qBadge: {
    position: 'absolute',
    right: 4,
    top: '50%',
    marginTop: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(57, 255, 136, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qBadgeText: {
    color: Colors.green,
    fontSize: 9,
    fontFamily: Fonts.heading,
  },
  matchesBlock: {},
  matchesList: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  koFormatBanner: {
    marginHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  koFormatText: {
    color: Colors.textSecondary,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodySemibold,
    textAlign: 'center',
  },
});
