import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CheckCircle2, KeyRound, Mail } from 'lucide-react-native';
import { Button } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { Input } from '../../src/components/common/Input';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <ScreenWash />
      <Header transparent />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          {sent ? (
            <CheckCircle2 size={40} color={Colors.green} />
          ) : (
            <KeyRound size={36} color={Colors.green} />
          )}
        </View>

        <Text style={styles.title}>
          {sent ? 'Reset Link Sent' : 'Reset your password'}
        </Text>
        <Text style={styles.subtitle}>
          {sent
            ? `We've sent password reset instructions to ${email}.`
            : 'Enter the email address associated with your SmashLive account.'}
        </Text>

        {!sent ? (
          <View style={styles.form}>
            <Input
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={18} color={Colors.textTertiary} />}
            />

            <Button
              title="Send Instructions"
              onPress={handleReset}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.submitButton}
            />
          </View>
        ) : (
          <Button
            title="Back to Sign In"
            onPress={() => router.replace('/(auth)/login')}
            fullWidth
            size="lg"
            style={styles.backButton}
          />
        )}
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
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  backButton: {
    width: '100%',
  },
});
