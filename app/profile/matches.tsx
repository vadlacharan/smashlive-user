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
import { Calendar, ChevronRight, Trophy, Users } from 'lucide-react-native';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Header } from '../../src/components/common/Header';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { useMyRegistrations } from '../../src/hooks/useBookings';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../src/theme';
import { formatDateShort } from '../../src/utils/calendar';

export default function MyMatchesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'entries' | 'matches'>('entries');

  const { data: registrations = [], refetch, isRefetching } = useMyRegistrations();

  return (
    <View style={styles.container}>
      <ScreenWash />
      <Header title="My Matches & Entries" showBack />

      {/* Tab Switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          onPress={() => setActiveTab('entries')}
          style={[styles.tabButton, activeTab === 'entries' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'entries' && styles.tabTextActive,
            ]}
          >
            Tournament Entries ({registrations.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('matches')}
          style={[styles.tabButton, activeTab === 'matches' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'matches' && styles.tabTextActive,
            ]}
          >
            Match History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'entries' ? (
        <FlatList
          data={registrations}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => {
            const event = typeof item.event === 'object' ? item.event : null;
            const partner = typeof item.partner === 'object' ? item.partner : null;

            return (
              <TouchableOpacity
                onPress={() => event && router.push(`/tournament/${event.tournament as any || 1}`)}
                style={styles.entryCard}
                activeOpacity={0.88}
              >
                <View style={styles.entryHeader}>
                  <View style={styles.trophyPill}>
                    <Trophy size={13} color={Colors.gold} />
                    <Text style={styles.trophyText}>REGISTERED TEAM</Text>
                  </View>
                  <Text style={styles.paidText}>PAID • ₹{item.amount}</Text>
                </View>

                <Text style={styles.entryTitle}>{event?.title || "Tournament Event"}</Text>
                <Text style={styles.entryPartner}>
                  Teammate: {partner?.fullname || 'Vikram Verma'}
                </Text>

                <View style={styles.entryFooter}>
                  <Text style={styles.entryDate}>
                    Window: {event ? formatDateShort(event.startdate) : '29 Aug'}
                  </Text>
                  <Text style={styles.viewDrawLink}>View Draw →</Text>
                </View>
              </TouchableOpacity>
            );
          }}
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
              icon="trophy"
              title="No Tournament Entries"
              description="You have not registered for any tournament events yet."
              actionTitle="Explore Tournaments"
              onAction={() => router.push('/(tabs)/tournaments')}
            />
          }
        />
      ) : (
        <EmptyState
          icon="award"
          title="No Match History"
          description="Your completed tournament matches and fixture scores will appear here after you compete."
          actionTitle="Explore Tournaments"
          onAction={() => router.push('/(tabs)/tournaments')}
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
  entryCard: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  trophyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },
  trophyText: {
    color: Colors.gold,
    fontSize: Typography.micro,
    fontFamily: Fonts.heading,
  },
  paidText: {
    color: Colors.green,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodyBold,
  },
  entryTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.headline,
    fontFamily: Fonts.bodyBold,
    marginBottom: 4,
  },
  entryPartner: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    marginBottom: Spacing.md,
  },
  entryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.sm,
  },
  entryDate: {
    color: Colors.textTertiary,
    fontSize: Typography.footnote,
  },
  viewDrawLink: {
    color: Colors.green,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyBold,
  },
  matchHistoryCard: {
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  matchTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  matchEventName: {
    color: Colors.textPrimary,
    fontSize: Typography.subhead,
    fontFamily: Fonts.bodyBold,
  },
  matchCourt: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
  },
  matchScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface2,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  matchPlayer: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    fontFamily: Fonts.bodySemibold,
    flex: 1,
  },
  matchScore: {
    color: Colors.green,
    fontSize: Typography.title3,
    fontFamily: Fonts.heading,
    marginHorizontal: Spacing.md,
    fontVariant: ['tabular-nums'],
  },
});
