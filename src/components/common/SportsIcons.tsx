import React from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { SportType } from '../../types';

/**
 * Sport icon set — proper glyph icons from MaterialCommunityIcons
 * (badminton, cricket, football, swim, dumbbell, table-tennis).
 */

const MCI_SPORT: Record<SportType, keyof typeof MaterialCommunityIcons.glyphMap> = {
  badminton: 'badminton',
  'cricket-turf': 'cricket',
  'box-cricket': 'cricket',
  pickleball: 'table-tennis',
  football: 'football',
  swimming: 'swim',
  gym: 'dumbbell',
};

export const ShuttlecockIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#39FF88',
}) => <MaterialCommunityIcons name="badminton" size={size} color={color} />;

export const BadmintonRacketIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#39FF88',
}) => <MaterialCommunityIcons name="badminton" size={size} color={color} />;

export const CricketIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#39FF88',
}) => <MaterialCommunityIcons name="cricket" size={size} color={color} />;

export const FootballIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#39FF88',
}) => <MaterialCommunityIcons name="football" size={size} color={color} />;

export const PickleballIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#39FF88',
}) => <MaterialCommunityIcons name="table-tennis" size={size} color={color} />;

export const SwimIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#39FF88',
}) => <MaterialCommunityIcons name="swim" size={size} color={color} />;

export const GymIcon: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = '#39FF88',
}) => <MaterialCommunityIcons name="dumbbell" size={size} color={color} />;

const iconMap: Record<SportType, React.FC<{ size?: number; color?: string }>> = {
  badminton: ShuttlecockIcon,
  'cricket-turf': CricketIcon,
  'box-cricket': CricketIcon,
  pickleball: PickleballIcon,
  football: FootballIcon,
  swimming: SwimIcon,
  gym: GymIcon,
};

export const SportSvgIcon: React.FC<{ sport: SportType; size?: number; color?: string }> = ({
  sport,
  size = 18,
  color = '#39FF88',
}) => {
  const Icon = iconMap[sport] || ShuttlecockIcon;
  return <Icon size={size} color={color} />;
};

const ColorsPhotoSim = {
  badminton: ['#1B4D33', '#14201A', '#0F1512'] as const,
  'cricket-turf': ['#33401F', '#14201A', '#0F1512'] as const,
  'box-cricket': ['#2E3B20', '#14201A', '#0F1512'] as const,
  pickleball: ['#1F3348', '#14201A', '#0F1512'] as const,
  football: ['#1E3B2A', '#14201A', '#0F1512'] as const,
  swimming: ['#1A3340', '#14201A', '#0F1512'] as const,
  gym: ['#33201E', '#14201A', '#0F1512'] as const,
  default: ['#22301F', '#14201A', '#0F1512'] as const,
};

export const photoSimGradient = (sport?: SportType) => {
  if (sport && sport in ColorsPhotoSim) return ColorsPhotoSim[sport as keyof typeof ColorsPhotoSim];
  return ColorsPhotoSim.default;
};