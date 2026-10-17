import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LogIn } from 'lucide-react-native';
import { Button } from './Button';
import { Colors, Fonts, Spacing, Typography } from '../../theme';

interface AuthGateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
}

/**
 * Guest-mode gate: shown instead of account-only content (My Bookings,
 * checkout, …) when there is no signed-in user. Always offers Sign In /
 * Create Account — never a dead "Sign Out".
 */
export const AuthGate: React.FC<AuthGateProps> = ({
  title = 'Sign in to continue',
  description = 'Create a free SmashLive account or sign in to access this.',
  actionLabel = 'this feature',
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <LogIn size={30} color={Colors.green} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>
        {description.replace('this feature', actionLabel)}
      </Text>
      <Button
        title="Sign In"
        onPress={() => router.push('/(auth)/login')}
        fullWidth
        size="lg"
        style={styles.primaryButton}
      />
      <Button
        title="Create Account"
        onPress={() => router.push('/(auth)/signup')}
        fullWidth
        size="lg"
        variant="outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.huge,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.surface1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.green,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.title2,
    fontFamily: Fonts.heading,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    marginBottom: Spacing.md,
  },
});
