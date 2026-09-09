import React, { useCallback, useState } from 'react';
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
import { Award, Trophy } from 'lucide-react-native';
import { Chip } from '../../../src/components/common/Chip';
import { Header } from '../../../src/components/common/Header';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { RefreshButton } from '../../../src/components/common/RefreshButton';
import { ScreenWash } from '../../../src/components/common/ScreenWash';
import { BracketTree } from '../../../src/components/tournament/BracketTree';
import { StandingsTable } from '../../../src/components/tournament/StandingsTable';
import { useMatches } from '../../../src/hooks/useLiveMatches';
import { useEvents, useTournament } from '../../../src/hooks/useTournaments';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../../src/theme';

export default function TournamentDrawScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tournamentId = Number(id) || 1;

  const { data: tournament, refetch: refetchTournament } = useTournament(tournamentId);
  const { data: events = [], refetch: refetchEvents } = useEvents(tournamentId);

  const [selectedEventId, setSelectedEventId] = useState<number>(0);
  const activeEventId = selectedEventId || events[0]?.id || 0;

  const {
    data: matches = [],
    isLoading: matchesLoading,
    refetch: refetchMatches,
    isRefetching: isMatchesRefetching,
  } = useMatches(activeEventId);

  const [activeTab, setActiveTab] = useState<'bracket' | 'standings'>('bracket');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchTournament(), refetchEvents(), refetchMatches()]);
    setRefreshing(false);
  }, [refetchTournament, refetchEvents, refetchMatches]);

  const isRefetchingAll = isMatchesRefetching || refreshing;

  return (
    <View style={styles.container}>
      <ScreenWash />
      <Header
        title="Tournament Draw"
        subtitle={tournament?.title || 'Draws & Standings'}
        showBack
        rightAction={
          <RefreshButton
            onPress={handleRefresh}
            isRefreshing={isRefetchingAll}
          />
        }
      />

      {/* Event Selection Chips */}
      {events.length > 0 && (
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

      {/* Tab Switcher: Bracket vs Standings */}
      <View style={styles.tabSwitcherRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('bracket')}
          style={[styles.tabButton, activeTab === 'bracket' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'bracket' && styles.tabButtonTextActive,
            ]}
          >
            Bracket
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('standings')}
          style={[styles.tabButton, activeTab === 'standings' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'standings' && styles.tabButtonTextActive,
            ]}
          >
            Points Table
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
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
        {matchesLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.green} />
            <Text style={styles.loadingText}>Loading tournament fixtures...</Text>
          </View>
        ) : matches.length === 0 ? (
          <EmptyState
            icon="trophy"
            title="Draws Not Generated Yet"
            description="The tournament organizers will publish the elimination bracket once player registrations conclude."
            actionTitle="Refresh Draw"
            onAction={handleRefresh}
          />
        ) : activeTab === 'bracket' ? (
          <BracketTree matches={matches} />
        ) : (
          <StandingsTable matches={matches} />
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
});
