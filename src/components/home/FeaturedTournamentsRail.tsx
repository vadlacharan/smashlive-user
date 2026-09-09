import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Trophy } from 'lucide-react-native';
import { Colors, Fonts, Spacing, Typography } from '../../theme';
import { Tournament } from '../../types';
import { TournamentCard } from '../tournament/TournamentCard';
import { HorizontalRailSkeleton } from '../common/Skeleton';

interface FeaturedTournamentsRailProps {
  tournaments: Tournament[];
  isLoading?: boolean;
}

export const FeaturedTournamentsRail: React.FC<FeaturedTournamentsRailProps> = ({
  tournaments,
  isLoading,
}) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <View style={styles.titleIconBox}>
              <Trophy size={16} color={Colors.gold} />
            </View>
            <Text style={styles.sectionTitle}>FEATURED TOURNAMENTS</Text>
          </View>
        </View>
        <HorizontalRailSkeleton count={3} />
      </View>
    );
  }

  if (!tournaments || tournaments.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <Trophy size={16} color={Colors.gold} />
          </View>
          <Text style={styles.sectionTitle}>FEATURED TOURNAMENTS</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/tournaments')}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>Explore</Text>
          <ChevronRight size={14} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={tournaments}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <TournamentCard tournament={item} layout="horizontal" featured={index === 0} />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIconBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bodyBold,
    fontSize: Typography.caption,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    color: Colors.green,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodySemibold,
  },
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
  },
});
