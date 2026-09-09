import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin, Navigation, Search } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';

interface HomeHeroProps {
  onSearchPress?: () => void;
}

export const HomeHero: React.FC<HomeHeroProps> = ({ onSearchPress }) => {
  const { user } = useAuth();
  const { location, isDetecting, refreshLocation } = useLocation();
  const router = useRouter();

  const getFirstName = () => {
    if (!user?.fullname) return 'Guest';
    return user.fullname.split(' ')[0];
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.greetingRow}>
          <View style={styles.greetingCol}>
            <Text style={styles.greetingText}>{getGreeting()}</Text>
            <Text style={styles.nameText}>{getFirstName()}</Text>
          </View>
        </View>

        {/* Location Pill */}
        <TouchableOpacity
          onPress={refreshLocation}
          style={styles.locationPill}
          activeOpacity={0.8}
        >
          <MapPin size={13} color={Colors.green} />
          <Text style={styles.locationText} numberOfLines={1}>
            {isDetecting
              ? 'Locating...'
              : location.areaName && location.cityName && location.areaName !== location.cityName
              ? `${location.areaName}, ${location.cityName}`
              : location.cityName || location.areaName || 'Nearby'}
          </Text>
        </TouchableOpacity>

        {/* User Avatar */}
        <TouchableOpacity
          onPress={() => router.push(user ? '/(tabs)/profile' : '/(auth)/login')}
          style={styles.avatarButton}
          activeOpacity={0.8}
        >
          {user?.profilePicture?.url ? (
            <Image source={{ uri: user.profilePicture.url }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>
                {user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'G'}
              </Text>
            </View>
          )}
          {!!user && <View style={styles.presenceDot} />}
        </TouchableOpacity>
      </View>

      {/* Quick Search Action Bar */}
      <TouchableOpacity
        onPress={onSearchPress || (() => router.push('/(tabs)/book'))}
        style={styles.searchBar}
        activeOpacity={0.85}
      >
        <Search size={18} color={Colors.textTertiary} />
        <Text style={styles.searchPlaceholder}>Search arenas, turfs, or tournaments...</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  greetingRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  greetingCol: {
    flex: 1,
  },
  greetingText: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyMedium,
  },
  nameText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.heading,
    fontSize: Typography.title2,
    letterSpacing: -0.3,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.md,
    maxWidth: 140,
    gap: 4,
  },
  locationText: {
    color: Colors.textSecondary,
    fontSize: Typography.micro,
    fontFamily: Fonts.bodySemibold,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    overflow: 'hidden',
    backgroundColor: Colors.surface2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: Colors.textPrimary,
    fontSize: Typography.headline,
    fontFamily: Fonts.headingSemibold,
  },
  presenceDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: Colors.green,
    borderWidth: 2,
    borderColor: Colors.canvas,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchPlaceholder: {
    color: Colors.textTertiary,
    fontFamily: Fonts.body,
    fontSize: Typography.body,
  },
});
