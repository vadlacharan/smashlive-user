import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Lock, Mail, Phone, User, Zap } from 'lucide-react-native';
import { Button } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { Input } from '../../src/components/common/Input';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { useAuth } from '../../src/context/AuthContext';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../src/theme';

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();

  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1998-04-12');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!fullname.trim() || !email.trim() || !phoneNumber.trim() || !password.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signup({
        fullname: fullname.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        dateOfBirth: new Date(dateOfBirth).toISOString(),
        password,
      });

      // No email verification — account is active immediately.
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <Text style={styles.title}>Join SmashLive</Text>
          <Text style={styles.subtitle}>
            Create your player profile to register for tournaments and book arena courts.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            value={fullname}
            onChangeText={setFullname}
            placeholder="Your full name"
            icon={<User size={18} color={Colors.textTertiary} />}
          />

          <Input
            label="Email address"
            value={email}
            onChangeText={setEmail}
            placeholder="rahul@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            icon={<Mail size={18} color={Colors.textTertiary} />}
          />

          <Input
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+91 98765 43210"
            keyboardType="phone-pad"
            icon={<Phone size={18} color={Colors.textTertiary} />}
          />

          <Input
            label="Date of Birth (YYYY-MM-DD)"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="1998-04-12"
            icon={<Calendar size={18} color={Colors.textTertiary} />}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            icon={<Lock size={18} color={Colors.textTertiary} />}
            error={error}
          />

          <Button
            title="Create Account"
            onPress={handleSignup}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.createButton}
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    marginBottom: Spacing.xl,
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
  },
  formContainer: {
    width: '100%',
  },
  createButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
  },
  signInLink: {
    color: Colors.green,
    fontSize: Typography.body,
    fontFamily: Fonts.bodyBold,
  },
});
