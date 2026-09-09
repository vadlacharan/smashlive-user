import React from 'react';
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  CalendarDays,
  ChevronRight,
  CreditCard,
  Edit3,
  FileText,
  LogOut,
  MapPin,
  ShieldCheck,
  Trash2,
  Trophy,
  User,
} from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useLocation } from '../../src/context/LocationContext';
import { useMyBookings } from '../../src/hooks/useBookings';
import { useMyRegistrations } from '../../src/hooks/useTournaments';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { API_BASE_URL, api } from '../../src/api/client';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { location, refreshLocation } = useLocation();
  const { data: myBookings = [] } = useMyBookings();
  const { data: myRegistrations = [] } = useMyRegistrations();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of SmashLive?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This permanently removes your account, bookings, and tournament entries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'All your data will be permanently deleted from SmashLive.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      if (user?.id) {
                        await api.deleteAccount(user.id);
                      }
                      await logout();
                      router.replace('/(auth)/login');
                    } catch (err: any) {
                      Alert.alert(
                        'Delete Failed',
                        err?.message || 'Could not delete your account. Please try again.'
                      );
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenWash />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Title */}
        <View style={styles.topHeader}>
          <Text style={styles.screenTitle}>My Profile</Text>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarWrapper}>
            {user?.profilePicture?.url ? (
              <Image source={{ uri: user.profilePicture.url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {user?.fullname ? user.fullname.charAt(0).toUpperCase() : 'P'}
                </Text>
              </View>
            )}
            <TouchableOpacity
              onPress={() => router.push(user ? '/profile/edit' : '/(auth)/login')}
              style={styles.editAvatarBadge}
            >
              <Edit3 size={12} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullname || 'Player'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Sign in to sync match stats'}</Text>
            {user?.phoneNumber && (
              <Text style={styles.userPhone}>{user.phoneNumber}</Text>
            )}
          </View>
        </View>

        {/* Stats Row (Computed from Live PayloadCMS Database) */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user ? myBookings.length : 0}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user ? myRegistrations.length : 0}</Text>
            <Text style={styles.statLabel}>Tournaments</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user ? myRegistrations.length : 0}</Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
        </View>

        {/* Action Rows */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>MY ACTIVITY</Text>

          <TouchableOpacity
            onPress={() => router.push('/profile/bookings')}
            style={styles.actionRow}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconWrapper}>
              <CalendarDays size={20} color={Colors.green} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>My Court Bookings</Text>
              <Text style={styles.actionDesc}>Upcoming and past hourly arena bookings</Text>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/profile/matches')}
            style={styles.actionRow}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconWrapper}>
              <Trophy size={20} color={Colors.gold} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>My Matches & Entries</Text>
              <Text style={styles.actionDesc}>Tournament registrations, fixtures, and match history</Text>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/profile/transactions')}
            style={styles.actionRow}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconWrapper}>
              <CreditCard size={20} color={Colors.info} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Transactions & Receipts</Text>
              <Text style={styles.actionDesc}>Payment history for bookings and tournament fees</Text>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Settings & Info */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>SETTINGS</Text>

          <TouchableOpacity
            onPress={() => router.push('/profile/edit')}
            style={styles.actionRow}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconWrapper}>
              <User size={20} color={Colors.textSecondary} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Edit Profile</Text>
              <Text style={styles.actionDesc}>Update name, phone number, and birth date</Text>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={refreshLocation}
            style={styles.actionRow}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconWrapper}>
              <MapPin size={20} color={Colors.textSecondary} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Location Services</Text>
              <Text style={styles.actionDesc}>
                {location.areaName}, {location.cityName} • Tap to refresh
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`${API_BASE_URL}/privacy`).catch(() => {})
            }
            style={styles.actionRow}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconWrapper}>
              <ShieldCheck size={20} color={Colors.textSecondary} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Privacy Policy</Text>
              <Text style={styles.actionDesc}>How SmashLive handles your data</Text>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              Linking.openURL(`${API_BASE_URL}/terms`).catch(() => {})
            }
            style={styles.actionRow}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconWrapper}>
              <FileText size={20} color={Colors.textSecondary} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Terms of Service</Text>
              <Text style={styles.actionDesc}>Rules and conditions for using SmashLive</Text>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>

          {user && (
            <TouchableOpacity
              onPress={handleDeleteAccount}
              style={[styles.actionRow, styles.logoutRow]}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconWrapper, styles.logoutIconWrapper]}>
                <Trash2 size={20} color={Colors.danger} />
              </View>
              <View style={styles.actionTextCol}>
                <Text style={[styles.actionTitle, styles.logoutText]}>Delete Account</Text>
                <Text style={styles.actionDesc}>
                  Permanently remove your account and data
                </Text>
              </View>
              <ChevronRight size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.actionRow, styles.logoutRow]}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrapper, styles.logoutIconWrapper]}>
              <LogOut size={20} color={Colors.danger} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={[styles.actionTitle, styles.logoutText]}>Sign Out</Text>
              <Text style={styles.actionDesc}>Log out of your session on this device</Text>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
  },
  topHeader: {
    paddingVertical: Spacing.md,
  },
  screenTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.heading,
    fontSize: Typography.title1,
    letterSpacing: -0.3,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: Colors.green,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.green,
  },
  avatarInitials: {
    color: Colors.green,
    fontSize: Typography.title2,
    fontFamily: Fonts.headingSemibold,
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.canvas,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: Colors.textPrimary,
    fontFamily: Fonts.headingSemibold,
    fontSize: Typography.title3,
  },
  userEmail: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    marginTop: 2,
  },
  userPhone: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(57, 255, 136, 0.07)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 136, 0.2)',
    marginBottom: Spacing.xl,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNum: {
    color: Colors.green,
    fontFamily: Fonts.display,
    fontSize: 28,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: Colors.textTertiary,
    fontSize: Typography.micro,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.divider,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    color: Colors.textTertiary,
    fontSize: Typography.caption,
    fontFamily: Fonts.bodyBold,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  actionIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    color: Colors.textPrimary,
    fontSize: Typography.body,
    fontFamily: Fonts.bodySemibold,
  },
  actionDesc: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    marginTop: 2,
  },
  logoutRow: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  logoutIconWrapper: {
    backgroundColor: Colors.dangerMuted,
  },
  logoutText: {
    color: Colors.danger,
  },
});
