import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lock, ShieldCheck } from 'lucide-react-native';
import { api } from '../../src/api/client';
import { Button } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { Input } from '../../src/components/common/Input';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleReset = async () => {
    if (!token) {
      setError('This reset link is invalid or has expired.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      setError(err.message || 'Reset link may have expired. Request a new one.');
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
            <ShieldCheck size={28} color={Colors.green} />
          </View>
          <Text style={styles.title}>
            {done ? 'Password updated' : 'Choose a new password'}
          </Text>
          <Text style={styles.subtitle}>
            {done
              ? 'You can now sign in with your new password.'
              : 'Make it at least 8 characters long.'}
          </Text>
        </View>

        {done ? (
          <Button
            title="Go to Sign In"
            onPress={() => router.replace('/(auth)/login')}
            fullWidth
            size="lg"
          />
        ) : (
          <View style={styles.formContainer}>
            <Input
              label="New password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              icon={<Lock size={18} color={Colors.textTertiary} />}
            />
            <Input
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="••••••••"
              secureTextEntry
              icon={<Lock size={18} color={Colors.textTertiary} />}
              error={error}
            />
            <Button
              title="Reset Password"
              onPress={handleReset}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.actionButton}
            />
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
  },
  formContainer: {
    gap: Spacing.md,
  },
  actionButton: {
    marginTop: Spacing.sm,
  },
});