import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '../../theme';
import { SportType } from '../../types';
import { SportIcon, getSportLabel } from '../common/Badge';
import { Chip } from '../common/Chip';

const SPORTS: SportType[] = [
  'badminton',
  'cricket-turf',
  'box-cricket',
  'pickleball',
  'football',
  'swimming',
  'gym',
];

interface SportCategoriesProps {
  selectedSport?: string;
  onSelectSport: (sport: string) => void;
}

export const SportCategories: React.FC<SportCategoriesProps> = ({
  selectedSport = 'all',
  onSelectSport,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Chip
          label="All Sports"
          selected={selectedSport === 'all'}
          onPress={() => onSelectSport('all')}
        />
        {SPORTS.map((sport) => {
          const isSelected = selectedSport === sport;
          return (
            <Chip
              key={sport}
              label={getSportLabel(sport)}
              selected={isSelected}
              onPress={() => onSelectSport(sport)}
              icon={<SportIcon sport={sport} size={15} color={isSelected ? Colors.green : Colors.textTertiary} />}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
  },
});
