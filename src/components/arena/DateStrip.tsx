import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';

interface DateStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  daysCount?: number; // default 14 days
}

export const DateStrip: React.FC<DateStripProps> = ({
  selectedDate,
  onSelectDate,
  daysCount = 14,
}) => {
  const dates = React.useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const iso = `${yyyy}-${mm}-${dd}`;

      const dayName = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = String(d.getDate());
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      list.push({ iso, dayName, dayNum, monthName, isToday: i === 0 });
    }
    return list;
  }, [daysCount]);

  const renderDateItem = ({
    item,
  }: {
    item: { iso: string; dayName: string; dayNum: string; monthName: string; isToday: boolean };
  }) => {
    const isSelected = selectedDate === item.iso;

    const handlePress = () => {
      Haptics.selectionAsync().catch(() => {});
      onSelectDate(item.iso);
    };

    return (
      <Pressable
        onPress={handlePress}
        style={[styles.dateCard, isSelected && styles.dateCardSelected]}
      >
        {isSelected && (
          <LinearGradient
            colors={Colors.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.dateCardFill]}
          />
        )}
        <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
          {item.dayName}
        </Text>
        <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
          {item.dayNum}
        </Text>
        <Text style={[styles.monthName, isSelected && styles.monthNameSelected]}>
          {item.monthName}
        </Text>
        {item.isToday && (
          <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={dates}
        keyExtractor={(item) => item.iso}
        renderItem={renderDateItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.screenPadding,
    gap: Spacing.sm,
  },
  dateCard: {
    width: 56,
    height: 68,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface2,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  dateCardSelected: {
    borderColor: 'transparent',
    shadowColor: '#39FF88',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  dateCardFill: {
    borderRadius: BorderRadius.md,
  },
  dayName: {
    fontSize: Typography.micro,
    color: Colors.textTertiary,
    fontFamily: Fonts.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dayNameSelected: {
    color: Colors.textInverse,
  },
  dayNum: {
    fontSize: Typography.title3,
    color: Colors.textPrimary,
    fontFamily: Fonts.heading,
    fontWeight: Typography.heavy,
    marginVertical: 2,
    fontVariant: ['tabular-nums'],
  },
  dayNumSelected: {
    color: Colors.textInverse,
  },
  monthName: {
    fontSize: Typography.micro,
    color: Colors.textSecondary,
    fontFamily: Fonts.bodyMedium,
  },
  monthNameSelected: {
    color: Colors.textInverse,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.green,
    marginTop: 3,
  },
  todayDotSelected: {
    backgroundColor: Colors.textInverse,
  },
});