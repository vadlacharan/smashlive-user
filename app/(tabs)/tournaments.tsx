import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Trophy } from 'lucide-react-native';
import { Chip } from '../../src/components/common/Chip';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Input } from '../../src/components/common/Input';
import { ArenaCardSkeleton } from '../../src/components/common/Skeleton';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { TournamentCard } from '../../src/components/tournament/TournamentCard';
import { useTournaments } from '../../src/hooks/useTournaments';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../src/theme';
import { Tournament } from '../../src/types';

const STATUS_FILTERS = ['All', 'Upcoming', 'Live', 'Completed'];

export default function TournamentsExploreScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const { data: tournaments = [], isLoading, refetch, isRefetching } = useTournaments();

  const filteredTournaments = useMemo(() => {
    const now = Date.now();

    return tournaments.filter((t) => {
      // Search
      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.venue && t.venue.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!matchesSearch) return false;

      // Registration deadline & dates calculation
      const deadline = t.tournamentRegistrationEndDate
        ? new Date(t.tournamentRegistrationEndDate).getTime()
        : t.registrationDeadline
          ? new Date(t.registrationDeadline).getTime()
          : null;

      const startDate = t.startDate ? new Date(t.startDate).getTime() : null;
      const endDate = t.endDate ? new Date(t.endDate).getTime() : null;

      const isUpcoming = deadline ? deadline >= now : startDate ? startDate >= now : !t.isLive;
      const isLive = t.isLive || (startDate && endDate && startDate <= now && endDate >= now);
      const isCompleted = (endDate && endDate < now) || (deadline && deadline < now && !t.isLive);

      // Status Filter
      if (selectedStatus === 'Upcoming' && !isUpcoming) return false;
      if (selectedStatus === 'Live' && !isLive) return false;
      if (selectedStatus === 'Completed' && !isCompleted) return false;

      return true;
    });
  }, [tournaments, searchQuery, selectedStatus]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenWash />
      {/* Title Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Tournaments</Text>
        <Text style={styles.subtitle}>
          Discover events, view draws, and register your team.
        </Text>

        {/* Search */}
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tournaments or venues..."
          clearable
          icon={<Search size={18} color={Colors.textTertiary} />}
          containerStyle={styles.searchContainer}
        />

        {/* Status Segment Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {STATUS_FILTERS.map((s) => (
            <Chip
              key={s}
              label={s}
              selected={selectedStatus === s}
              onPress={() => setSelectedStatus(s)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Tournament List */}
      {isLoading ? (
        <View style={styles.listPadding}>
          <ArenaCardSkeleton />
          <ArenaCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredTournaments}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <TournamentCard tournament={item} />}
          contentContainerStyle={[styles.listContent, { paddingBottom: 110 }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.green}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="trophy"
              title="No Tournaments Found"
              description="No tournaments match your current filters. Tap below to reset."
              actionTitle="Reset Filters"
              onAction={() => {
                setSearchQuery('');
                setSelectedStatus('All');
              }}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: Fonts.heading,
    fontSize: Typography.title1,
    letterSpacing: -0.3,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  searchContainer: {
    marginBottom: Spacing.sm,
  },
  filterRow: {
    paddingVertical: 4,
    gap: Spacing.xs,
  },
  cityRow: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  listContent: {
    padding: Spacing.screenPadding,
  },
  listPadding: {
    padding: Spacing.screenPadding,
  },
});
