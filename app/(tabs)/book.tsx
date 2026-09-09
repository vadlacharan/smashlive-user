import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Navigation, Search, SlidersHorizontal } from 'lucide-react-native';
import { ArenaCard } from '../../src/components/arena/ArenaCard';
import { SportIcon, getSportLabel } from '../../src/components/common/Badge';
import { Chip } from '../../src/components/common/Chip';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Input } from '../../src/components/common/Input';
import { ArenaCardSkeleton } from '../../src/components/common/Skeleton';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { useLocation } from '../../src/context/LocationContext';
import { useArenas } from '../../src/hooks/useArenas';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../src/theme';
import { Arena, SportType } from '../../src/types';

const SPORT_OPTIONS: SportType[] = [
  'badminton',
  'cricket-turf',
  'box-cricket',
  'pickleball',
  'football',
  'swimming',
  'gym',
];

export default function BookScreen() {
  const insets = useSafeAreaInsets();
  const { location, getDistanceFromUser, refreshLocation } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [sortByNearest, setSortByNearest] = useState(true);

  const { data: arenas = [], isLoading, refetch, isRefetching } = useArenas(
    selectedSport === 'all' ? undefined : selectedSport
  );

  const processedArenas = useMemo(() => {
    let list = arenas.filter((a) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        (a.venue && a.venue.toLowerCase().includes(q))
      );
    });

    if (sortByNearest) {
      list = [...list].sort((a, b) => {
        const distA = getDistanceFromUser(a.location).distanceKm ?? 999;
        const distB = getDistanceFromUser(b.location).distanceKm ?? 999;
        return distA - distB;
      });
    }

    return list;
  }, [arenas, searchQuery, sortByNearest, location]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenWash />
      {/* Screen Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Book a Court</Text>
            <Text style={styles.subtitle}>
              Browse arenas, turfs, and hourly availability.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => setSortByNearest(!sortByNearest)}
            style={[styles.sortPill, sortByNearest && styles.sortPillActive]}
            activeOpacity={0.8}
          >
            <Navigation size={12} color={sortByNearest ? Colors.textInverse : Colors.green} />
            <Text style={[styles.sortText, sortByNearest && styles.sortTextActive]}>
              {sortByNearest ? 'Nearest' : 'All'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <Input
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search by arena name or location..."
          clearable
          icon={<Search size={18} color={Colors.textTertiary} />}
          containerStyle={styles.searchContainer}
        />

        {/* Sport Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sportChipsRow}
        >
          <Chip
            label="All Sports"
            selected={selectedSport === 'all'}
            onPress={() => setSelectedSport('all')}
          />
          {SPORT_OPTIONS.map((sport) => {
            const isSelected = selectedSport === sport;
            return (
              <Chip
                key={sport}
                label={getSportLabel(sport)}
                selected={isSelected}
                onPress={() => setSelectedSport(sport)}
                icon={
                  <SportIcon
                    sport={sport}
                    size={14}
                    color={isSelected ? Colors.green : Colors.textTertiary}
                  />
                }
              />
            );
          })}
        </ScrollView>
      </View>

      {/* Arena List */}
      {isLoading ? (
        <View style={styles.listPadding}>
          <ArenaCardSkeleton />
          <ArenaCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={processedArenas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ArenaCard arena={item} layout="card" />}
          contentContainerStyle={[styles.listContent, { paddingBottom: 110 }]}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={async () => {
                await refreshLocation();
                await refetch();
              }}
              tintColor={Colors.green}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="No Arenas Found"
              description="No sports arenas match your selected filters. Try choosing a different sport."
              actionTitle="Show All Sports"
              onAction={() => {
                setSearchQuery('');
                setSelectedSport('all');
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
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
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortPillActive: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
  },
  sortText: {
    color: Colors.green,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
  },
  sortTextActive: {
    color: Colors.textInverse,
  },
  searchContainer: {
    marginBottom: Spacing.sm,
  },
  sportChipsRow: {
    paddingVertical: 4,
    gap: Spacing.xs,
  },
  listContent: {
    padding: Spacing.screenPadding,
  },
  listPadding: {
    padding: Spacing.screenPadding,
  },
});
