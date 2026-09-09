import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, Mail } from 'lucide-react-native';
import { Button } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <View style={styles.container}>
      <ScreenWash />
      <Header transparent showBack />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Mail size={40} color={Colors.green} />
        </View>

        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>
          We sent an account activation link to{' '}
          <Text style={styles.emailHighlight}>{email || 'your email'}</Text>. Click the link in
          the email to activate your account.
        </Text>

        <Button
          title="Go to Sign In"
          onPress={() => router.replace('/(auth)/login')}
          fullWidth
          size="lg"
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.huge,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    borderColor: Colors.green,
    shadowColor: Colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.title1,
    fontFamily: Fonts.heading,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  emailHighlight: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bodyBold,
  },
  actionButton: {
    width: '100%',
    marginTop: Spacing.md,
  },
});
