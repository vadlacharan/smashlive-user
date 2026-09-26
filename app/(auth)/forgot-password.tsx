import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react-native';
import { api } from '../../src/api/client';
import { Button } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { Input } from '../../src/components/common/Input';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Could not send the reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScreenWash />
      <Header transparent />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.brandContainer}>
          <View style={styles.brandIconWrapper}>
            <KeyRound size={28} color={Colors.green} />
          </View>
          <Text style={styles.title}>Forgot password?</Text>
          <Text style={styles.subtitle}>
            Enter the email you signed up with and we'll send you a secure reset link.
          </Text>
        </View>

        {sent ? (
          <View style={styles.successCard}>
            <ShieldCheck size={28} color={Colors.green} />
            <Text style={styles.successTitle}>Reset link sent</Text>
            <Text style={styles.successText}>
              If an account exists for {email.trim()}, a reset link is on its way. Check your
              inbox and spam folder, then follow the link to choose a new password.
            </Text>
            <Button
              title="Back to Sign In"
              onPress={() => router.replace('/(auth)/login')}
              fullWidth
              size="lg"
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Input
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Mail size={18} color={Colors.textTertiary} />}
              error={error}
            />

            <Button
              title="Send Reset Link"
              onPress={handleSend}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.actionButton}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Remembered it? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.canvas,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screenPadding,
    justifyContent: 'center',
    paddingBottom: Spacing.huge,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  brandIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surface1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: Fonts.heading,
    fontSize: Typography.title2,
    textAlign: 'center',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    maxWidth: 300,
  },
  formContainer: {
    gap: Spacing.md,
  },
  actionButton: {
    marginTop: Spacing.sm,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  switchText: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
  },
  linkText: {
    color: Colors.green,
    fontSize: Typography.footnote,
    fontFamily: Fonts.bodyBold,
  },
  successCard: {
    backgroundColor: Colors.surface1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  successTitle: {
    color: Colors.textPrimary,
    fontFamily: Fonts.headingSemibold,
    fontSize: Typography.title3,
  },
  successText: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    textAlign: 'center',
    lineHeight: 19,
  },
});