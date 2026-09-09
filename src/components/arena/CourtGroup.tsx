import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Check } from 'lucide-react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';
import { CourtConfig, SportType } from '../../types';
import { SportIcon, getSportLabel } from '../common/Badge';

interface CourtGroupProps {
  courts: CourtConfig[];
  selectedCourt: string;
  onSelectCourt: (courtName: string) => void;
}

export const CourtGroup: React.FC<CourtGroupProps> = ({
  courts,
  selectedCourt,
  onSelectCourt,
}) => {
  // Group courts by sport type
  const grouped = React.useMemo(() => {
    const map = new Map<SportType, CourtConfig[]>();
    courts.forEach((c) => {
      const list = map.get(c.sportType) || [];
      list.push(c);
      map.set(c.sportType, list);
    });
    return Array.from(map.entries());
  }, [courts]);

  return (
    <View style={styles.container}>
      {grouped.map(([sport, courtList]) => (
        <View key={sport} style={styles.sportSection}>
          <View style={styles.sportHeader}>
            <SportIcon sport={sport} size={15} color={Colors.green} />
            <Text style={styles.sportTitle}>{getSportLabel(sport).toUpperCase()}</Text>
          </View>

          <View style={styles.courtsGrid}>
            {courtList.map((c) => {
              const isSelected = selectedCourt === c.CourtIdentifier;

              const handlePress = () => {
                Haptics.selectionAsync().catch(() => {});
                onSelectCourt(c.CourtIdentifier);
              };

              return (
                <TouchableOpacity
                  key={c.CourtIdentifier}
                  onPress={handlePress}
                  style={[styles.courtPill, isSelected && styles.courtPillSelected]}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[styles.courtName, isSelected && styles.courtNameSelected]}
                    numberOfLines={1}
                  >
                    {c.CourtIdentifier}
                  </Text>

                  <View style={styles.courtRight}>
                    <Text
                      style={[styles.courtPrice, isSelected && styles.courtPriceSelected]}
                    >
                      ₹{c.pricePerHour}
                      <Text
                        style={[styles.courtPriceUnit, isSelected && styles.courtPriceUnitSelected]}
                      >
                        /hr
                      </Text>
                    </Text>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Check size={11} color="#FFFFFF" strokeWidth={3.2} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    marginBottom: Spacing.md,
  },
  sportSection: {
    marginBottom: Spacing.md,
  },
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  sportTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.caption,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.2,
  },
  courtsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  // Normal — translucent white pill (like "Directions")
  courtPill: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
  },
  // Active — solid white pill (like "Add to Calendar")
  courtPillSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  courtName: {
    color: '#FFFFFF',
    fontSize: Typography.footnote,
    fontFamily: Fonts.headingSemibold,
    flex: 1,
  },
  courtNameSelected: {
    color: '#0F9A52',
    fontFamily: Fonts.heading,
  },
  courtRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  courtPrice: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: Typography.footnote,
    fontFamily: Fonts.headingSemibold,
    fontVariant: ['tabular-nums'],
  },
  courtPriceSelected: {
    color: Colors.textInverse,
  },
  courtPriceUnit: {
    fontSize: Typography.micro - 2,
    fontFamily: Fonts.body,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  courtPriceUnitSelected: {
    color: 'rgba(11, 15, 13, 0.55)',
  },
  checkCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0F9A52',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
