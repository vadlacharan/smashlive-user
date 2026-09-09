import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ShuttlecockIcon } from './SportsIcons';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';

interface EmptyStateProps {
  icon?: 'search' | 'calendar' | 'trophy' | 'award';
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
}

const ICON_COLORS: Record<string, string> = {
  search: '#4DA6FF',
  calendar: '#FFB84D',
  trophy: '#FFD873',
  award: '#39FF88',
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search',
  title,
  description,
  actionTitle,
  onAction,
}) => {
  const tint = ICON_COLORS[icon];

  return (
    <View style={styles.container}>
      <View style={styles.visual}>
        {/* Photo-simulation gradient behind the icon (design.md §2) */}
        <LinearGradient
          colors={['#1B3340', '#14201A', '#0F1512']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          colors={['rgba(57,255,136,0.14)', 'transparent']}
          style={styles.accentBloom}
        />
        <View style={styles.iconChip}>
          <ShuttlecockIcon size={30} color={tint} />
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <View style={styles.actionButton}>
          <Text style={styles.actionText} onPress={onAction}>
            {actionTitle}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
    marginVertical: Spacing.xl,
  },
  visual: {
    width: 132,
    height: 132,
    borderRadius: 66,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  accentBloom: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  iconChip: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(11, 15, 13, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: Fonts.heading,
    fontSize: Typography.title3,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    color: Colors.textSecondary,
    fontFamily: Fonts.body,
    fontSize: Typography.body,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  actionButton: {
    marginTop: Spacing.lg,
    paddingVertical: 10,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.greenMuted,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 136, 0.3)',
  },
  actionText: {
    color: Colors.green,
    fontFamily: Fonts.headingSemibold,
    fontSize: 15,
  },
});