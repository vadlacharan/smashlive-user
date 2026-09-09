import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, CreditCard, Receipt, Trophy, Zap } from 'lucide-react-native';
import { SportIcon, StatusBadge } from '../../src/components/common/Badge';
import { Chip } from '../../src/components/common/Chip';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Header } from '../../src/components/common/Header';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { useTransactions } from '../../src/hooks/useTransactions';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../src/theme';
import { formatDateShort } from '../../src/utils/calendar';
import { Transaction } from '../../src/types';

const FILTERS = ['All', 'Bookings', 'Entries'];

export default function TransactionsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('All');

  const { data: transactions = [], refetch, isRefetching } = useTransactions();

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedFilter === 'Bookings') return t.type === 'booking';
      if (selectedFilter === 'Entries') return t.type === 'tournament_entry';
      return true;
    });
  }, [transactions, selectedFilter]);

  const totalSpent = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (t.status === 'PAID' ? t.amount : 0), 0);
  }, [filteredTransactions]);

  return (
    <View style={styles.container}>
      <ScreenWash />
      <Header title="Transactions & Receipts" showBack />

      {/* Spend Summary Card */}
      <View style={styles.spendCard}>
        <Text style={styles.spendLabel}>TOTAL SPENT</Text>
        <Text style={styles.spendAmount}>₹{totalSpent.toLocaleString('en-IN')}</Text>
        <Text style={styles.spendSub}>Unified ledger for court slots & tournament entries</Text>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Chip
            key={f}
            label={f}
            selected={selectedFilter === f}
            onPress={() => setSelectedFilter(f)}
          />
        ))}
      </View>

      {/* Transaction List */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (item.type === 'booking' && item.arenaId) {
                router.push(`/arena/${item.arenaId}`);
              } else if (item.type === 'tournament_entry' && item.tournamentId) {
                router.push(`/tournament/${item.tournamentId}`);
              }
            }}
            style={styles.txCard}
            activeOpacity={0.88}
          >
            <View style={styles.txIconBox}>
              {item.type === 'booking' ? (
                <SportIcon sport={item.sportType || 'badminton'} size={20} />
              ) : (
                <Trophy size={20} color={Colors.gold} />
              )}
            </View>

            <View style={styles.txInfo}>
              <Text style={styles.txTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.txSubtitle} numberOfLines={1}>
                {item.subtitle}
              </Text>
              <Text style={styles.txMeta}>
                {formatDateShort(item.date)} • Ref: {item.referenceId}
              </Text>
            </View>

            <View style={styles.txRight}>
              <Text style={styles.txAmount}>₹{item.amount}</Text>
              <StatusBadge status={item.status} />
            </View>
          </TouchableOpacity>
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
            icon="search"
            title="No Transactions Found"
            description="You have no recorded payments under this filter category."
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
  spendCard: {
    backgroundColor: Colors.surface1,
    marginHorizontal: Spacing.screenPadding,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  spendLabel: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    fontFamily: Fonts.heading,
    letterSpacing: 1.2,
  },
  spendAmount: {
    color: Colors.green,
    fontSize: Typography.hero,
    fontFamily: Fonts.heading,
    fontVariant: ['tabular-nums'],
    marginVertical: 4,
  },
  spendSub: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screenPadding,
    marginVertical: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.huge,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  txIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontFamily: Fonts.bodyBold,
  },
  txSubtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    marginTop: 2,
  },
  txMeta: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txAmount: {
    color: Colors.textPrimary,
    fontSize: Typography.headline,
    fontFamily: Fonts.heading,
    fontVariant: ['tabular-nums'],
  },
});
