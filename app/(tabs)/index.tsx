import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeaturedTournamentsRail } from '../../src/components/home/FeaturedTournamentsRail';
import { HomeHero } from '../../src/components/home/HomeHero';
import { LiveNowRail } from '../../src/components/home/LiveNowRail';
import { NearbyArenasRail } from '../../src/components/home/NearbyArenasRail';
import { NextUpCard } from '../../src/components/home/NextUpCard';
import { SportCategories } from '../../src/components/home/SportCategories';
import { useLocation } from '../../src/context/LocationContext';
import { useArenas } from '../../src/hooks/useArenas';
import { useMyBookings } from '../../src/hooks/useBookings';
import { useLiveMatches } from '../../src/hooks/useLiveMatches';
import { useTournaments } from '../../src/hooks/useTournaments';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { Colors, Spacing } from '../../src/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { refreshLocation } = useLocation();

  const [selectedSport, setSelectedSport] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: arenas = [], isLoading: arenasLoading, refetch: refetchArenas } = useArenas(
    selectedSport === 'all' ? undefined : selectedSport
  );
  const { data: tournaments = [], isLoading: tournamentsLoading, refetch: refetchTournaments } = useTournaments();
  const { data: liveMatches = [], refetch: refetchLive } = useLiveMatches();
  const { data: myBookings = [], refetch: refetchBookings } = useMyBookings();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshLocation(),
      refetchArenas(),
      refetchTournaments(),
      refetchLive(),
      refetchBookings(),
    ]);
    setRefreshing(false);
  };

  // Find next upcoming paid booking
  const nextBooking = myBookings.find(
    (b) => b.isPaid === true && new Date(b.slotStart).getTime() >= Date.now()
  );

  return (
    <View style={styles.container}>
      <ScreenWash />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top, paddingBottom: 110 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.green}
            colors={[Colors.green]}
          />
        }
      >
        {/* Hero Section */}
        <HomeHero />

        {/* Smart Next Up Card — bookings only; matches live in the rail */}
        {nextBooking ? <NextUpCard booking={nextBooking} /> : null}

        {/* Live Matches Rail */}
        <LiveNowRail matches={liveMatches} />

        {/* Sport Categories Filter */}
        <SportCategories
          selectedSport={selectedSport}
          onSelectSport={setSelectedSport}
        />

        {/* Nearby Arenas Shelf */}
        <NearbyArenasRail arenas={arenas} isLoading={arenasLoading} />

        {/* Featured Tournaments Shelf */}
        <FeaturedTournamentsRail tournaments={tournaments} isLoading={tournamentsLoading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
