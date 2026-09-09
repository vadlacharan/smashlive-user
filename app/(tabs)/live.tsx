import React from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { EmptyState } from '../../src/components/common/EmptyState';
import { RefreshButton } from '../../src/components/common/RefreshButton';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { LiveScoreBoard } from '../../src/components/match/LiveScoreBoard';
import { useLiveMatches } from '../../src/hooks/useLiveMatches';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function LiveMatchesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: liveMatches = [], isLoading, refetch, isRefetching } = useLiveMatches();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenWash />
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Live Scores</Text>
          <RefreshButton onPress={refetch} isRefreshing={isRefetching} />
        </View>

        <Text style={styles.subtitle}>
          Real-time tournament match feeds updated live from the umpire scoresheet.
        </Text>
      </View>

      {/* Live Match List */}
      <FlatList
        data={liveMatches}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/match/${item.id}`)}
            activeOpacity={0.9}
          >
            <LiveScoreBoard match={item} sets={item.sets || []} />
          </TouchableOpacity>
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: 110 }]}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.green}
            colors={[Colors.green]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="award"
            title="No Matches Live Right Now"
            description="There are currently no active tournament matches in progress. Check back during match schedules."
            actionTitle="Explore Tournaments"
            onAction={() => router.push('/(tabs)/tournaments')}
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
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    marginTop: 4,
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
});
