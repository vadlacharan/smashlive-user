import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { Colors, Fonts, Spacing, Typography } from '../../theme';
import { Arena } from '../../types';
import { ArenaCard } from '../arena/ArenaCard';
import { HorizontalRailSkeleton } from '../common/Skeleton';

interface NearbyArenasRailProps {
  arenas: Arena[];
  isLoading?: boolean;
}

export const NearbyArenasRail: React.FC<NearbyArenasRailProps> = ({ arenas, isLoading }) => {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleRow}>
            <View style={styles.titleIconBox}>
              <MapPin size={16} color={Colors.green} />
            </View>
            <Text style={styles.sectionTitle}>NEARBY ARENAS & TURFS</Text>
          </View>
        </View>
        <HorizontalRailSkeleton count={3} />
      </View>
    );
  }

  if (!arenas || arenas.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <View style={styles.titleIconBox}>
            <MapPin size={16} color={Colors.green} />
          </View>
          <Text style={styles.sectionTitle}>NEARBY ARENAS & TURFS</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/book')}
          style={styles.seeAllButton}
        >
          <Text style={styles.seeAllText}>See all</Text>
          <ChevronRight size={14} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={arenas}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ArenaCard arena={item} layout="horizontal" />}
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
