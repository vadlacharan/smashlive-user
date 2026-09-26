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
import { Trophy } from 'lucide-react-native';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Header } from '../../src/components/common/Header';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { Skeleton } from '../../src/components/common/Skeleton';
import { useMyRegistrations } from '../../src/hooks/useBookings';
import { useMyMatches } from '../../src/hooks/useLiveMatches';
import { useAuth } from '../../src/context/AuthContext';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../src/theme';
import { formatDateShort } from '../../src/utils/calendar';
import { formatCurrency } from '../../src/utils/text';
import { Match } from '../../src/types';

const idOf = (v: unknown): number | undefined => {
  if (typeof v === 'number') return v;
  if (v && typeof v === 'object' && 'id' in v) return (v as { id: number }).id;
  return undefined;
};

const nameOf = (v: unknown): string => {
  if (v && typeof v === 'object' && 'fullname' in v) {
    return (v as { fullname?: string }).fullname || 'TBD';
  }
  return 'TBD';
};

function EntrySkeleton() {
  return (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <Skeleton width={130} height={20} borderRadius={BorderRadius.xs} />
        <Skeleton width={70} height={14} />
      </View>
      <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
      <Skeleton width="45%" height={13} style={{ marginBottom: Spacing.md }} />
      <View style={styles.entryFooter}>
        <Skeleton width={120} height={13} />
        <Skeleton width={70} height={13} />
      </View>
    </View>
  );
}

function MatchSkeleton() {
  return (
    <View style={styles.matchHistoryCard}>
      <View style={styles.matchTop}>
        <Skeleton width="55%" height={15} />
        <Skeleton width={60} height={13} />
      </View>
      <View style={styles.matchScoreRow}>
        <Skeleton width="30%" height={15} />
        <Skeleton width={54} height={22} />
        <Skeleton width="30%" height={15} />
      </View>
    </View>
  );
}

export default function MyMatchesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'entries' | 'matches'>('entries');

  const {
    data: registrations = [],
    isLoading: entriesLoading,
    refetch: refetchEntries,
    isRefetching: refetchingEntries,
  } = useMyRegistrations();

  const {
    data: myMatches = [],
    isLoading: matchesLoading,
    refetch: refetchMatches,
    isRefetching: refetchingMatches,
  } = useMyMatches(user?.id);

  const renderMatch = (match: Match) => {
    const p1 = nameOf(match.player1);
    const p2 = nameOf(match.player2);
    const p1Partner = match.player1Partner ? nameOf(match.player1Partner) : '';
    const p2Partner = match.player2Partner ? nameOf(match.player2Partner) : '';

    const winnerId = idOf(match.winner);
    const p1Id = idOf(match.player1);
    const p1Won = Boolean(match.isCompleted && winnerId && winnerId === p1Id);
    const p2Won = Boolean(match.isCompleted && winnerId && winnerId === idOf(match.player2));

    const eventName =
      match.event && typeof match.event === 'object'
        ? (match.event as { title?: string }).title || 'Tournament Match'
        : 'Tournament Match';

    const statusLabel = match.isCompleted
      ? 'FINAL'
      : match.inProgress
      ? 'LIVE'
      : 'UPCOMING';

    return (
      <TouchableOpacity
        onPress={() => router.push(`/match/${match.id}`)}
        style={styles.matchHistoryCard}
        activeOpacity={0.88}
      >
        <View style={styles.matchTop}>
          <Text style={styles.matchEventName} numberOfLines={1}>
            {eventName}
          </Text>
          <View
            style={[
              styles.matchStatusPill,
              match.inProgress && styles.matchStatusPillLive,
              match.isCompleted && styles.matchStatusPillFinal,
            ]}
          >
            <Text
              style={[
                styles.matchStatusText,
                match.inProgress && styles.matchStatusTextLive,
                match.isCompleted && styles.matchStatusTextFinal,
              ]}
            >
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.matchCourt} numberOfLines={1}>
          {match.court || 'Court TBD'}
          {match.matchDate ? ` • ${formatDateShort(match.matchDate)}` : ''}
          {` • Round ${match.round || 1}`}
        </Text>

        <View style={styles.matchScoreRow}>
          <Text
            style={[styles.matchPlayer, p1Won && styles.matchPlayerWinner]}
            numberOfLines={1}
          >
            {p1}
            {p1Partner ? ` + ${p1Partner}` : ''}
          </Text>
          <Text style={styles.matchScore}>
            {match.player1SetsWon ?? 0} - {match.player2SetsWon ?? 0}
          </Text>
          <Text
            style={[styles.matchPlayer, styles.matchPlayerRight, p2Won && styles.matchPlayerWinner]}
            numberOfLines={1}
          >
            {p2}
            {p2Partner ? ` + ${p2Partner}` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

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
            style={[styles.tabText, activeTab === 'entries' && styles.tabTextActive]}
          >
            {entriesLoading ? 'Tournament Entries' : `Tournament Entries (${registrations.length})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('matches')}
          style={[styles.tabButton, activeTab === 'matches' && styles.tabButtonActive]}
          activeOpacity={0.8}
        >
          <Text
            style={[styles.tabText, activeTab === 'matches' && styles.tabTextActive]}
          >
            {matchesLoading ? 'Match History' : `Match History (${myMatches.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'entries' ? (
        entriesLoading ? (
          <View style={styles.listContent}>
            {Array.from({ length: 4 }).map((_, i) => (
              <EntrySkeleton key={i} />
            ))}
          </View>
        ) : (
          <FlatList
            data={registrations}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => {
              const event = typeof item.event === 'object' ? item.event : null;
              const partner = typeof item.partner === 'object' ? item.partner : null;
              const tournamentRef = event ? (event as any).tournament : null;
              const tournamentId = idOf(tournamentRef) || 1;

              return (
                <TouchableOpacity
                  onPress={() => router.push(`/tournament/${tournamentId}`)}
                  style={styles.entryCard}
                  activeOpacity={0.88}
                >
                  <View style={styles.entryHeader}>
                    <View style={styles.trophyPill}>
                      <Trophy size={13} color={Colors.gold} />
                      <Text style={styles.trophyText}>
                        {partner ? 'REGISTERED TEAM' : 'REGISTERED PLAYER'}
                      </Text>
                    </View>
                    <Text style={styles.paidText}>
                      {item.isPaid ? 'PAID' : 'PENDING'} •{' '}
                      {formatCurrency(item.amount || 0, item.currency)}
                    </Text>
                  </View>

                  <Text style={styles.entryTitle}>
                    {event?.title || 'Tournament Event'}
                  </Text>
                  <Text style={styles.entryPartner}>
                    {partner ? `Teammate: ${partner.fullname || partner.email}` : 'Singles Entry'}
                  </Text>

                  <View style={styles.entryFooter}>
                    <Text style={styles.entryDate}>
                      {event?.startdate
                        ? `Window: ${formatDateShort(event.startdate)} – ${formatDateShort(
                            event.enddate
                          )}`
                        : 'Schedule to be announced'}
                    </Text>
                    <Text style={styles.viewDrawLink}>View Draw →</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refetchingEntries}
                onRefresh={refetchEntries}
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
        )
      ) : matchesLoading ? (
        <View style={styles.listContent}>
          {Array.from({ length: 4 }).map((_, i) => (
            <MatchSkeleton key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={myMatches}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => renderMatch(item)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refetchingMatches}
              onRefresh={refetchMatches}
              tintColor={Colors.green}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="award"
              title="No Match History"
              description="Your tournament fixtures and match scores will appear here once the draw is generated."
              actionTitle="Explore Tournaments"
              onAction={() => router.push('/(tabs)/tournaments')}
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
    fontVariant: ['tabular-nums'],
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
    gap: Spacing.sm,
  },
  entryDate: {
    color: Colors.textTertiary,
    fontSize: Typography.footnote,
    flexShrink: 1,
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
    marginBottom: 4,
    gap: Spacing.sm,
  },
  matchEventName: {
    color: Colors.textPrimary,
    fontSize: Typography.subhead,
    fontFamily: Fonts.bodyBold,
    flex: 1,
  },
  matchStatusPill: {
    backgroundColor: Colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  matchStatusPillLive: {
    backgroundColor: 'rgba(57, 255, 136, 0.15)',
  },
  matchStatusPillFinal: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
  },
  matchStatusText: {
    color: Colors.textTertiary,
    fontSize: Typography.micro - 1,
    fontFamily: Fonts.heading,
    letterSpacing: 0.5,
  },
  matchStatusTextLive: {
    color: Colors.green,
  },
  matchStatusTextFinal: {
    color: Colors.gold,
  },
  matchCourt: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    marginBottom: Spacing.sm,
  },
  matchScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface2,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  matchPlayer: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
    flex: 1,
  },
  matchPlayerRight: {
    textAlign: 'right',
  },
  matchPlayerWinner: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bodyBold,
  },
  matchScore: {
    color: Colors.textPrimary,
    fontSize: Typography.title3,
    fontFamily: Fonts.heading,
    marginHorizontal: Spacing.sm,
    fontVariant: ['tabular-nums'],
  },
});