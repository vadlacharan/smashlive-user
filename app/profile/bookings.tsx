import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BookingCard } from '../../src/components/booking/BookingCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Header } from '../../src/components/common/Header';
import { splitBookings, useMyBookings } from '../../src/hooks/useBookings';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function MyBookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const { data: bookings = [], refetch, isRefetching } = useMyBookings();
  const { upcoming, past } = splitBookings(bookings);

  const displayedBookings = activeTab === 'upcoming' ? upcoming : past;

  return (
    <View style={styles.container}>
      <Header title="My Court Bookings" showBack />

      {/* Segment Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          onPress={() => setActiveTab('upcoming')}
          style={[styles.tabButton, activeTab === 'upcoming' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming' && styles.tabTextActive,
            ]}
          >
            Upcoming ({upcoming.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('past')}
          style={[styles.tabButton, activeTab === 'past' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'past' && styles.tabTextActive,
            ]}
          >
            Past Bookings ({past.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={displayedBookings}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onPress={() => {
              if (typeof item.arena === 'object') {
                router.push(`/arena/${item.arena.id}`);
              }
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.green}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar"
            title={activeTab === 'upcoming' ? 'No Upcoming Bookings' : 'No Past Bookings'}
            description={
              activeTab === 'upcoming'
                ? 'You have no active court reservations. Explore nearby arenas to book a slot.'
                : 'Your past completed court sessions will appear here.'
            }
            actionTitle={activeTab === 'upcoming' ? 'Book a Court' : undefined}
            onAction={() => router.push('/(tabs)/book')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  tabSwitcher: {
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
    backgroundColor: Colors.greenMuted,
  },
  tabText: {
    color: Colors.textSecondary,
    fontSize: Typography.subhead,
    fontFamily: Fonts.bodyBold,
  },
  tabTextActive: {
    color: Colors.green,
  },
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.huge,
  },
});
