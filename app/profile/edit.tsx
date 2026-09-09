import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Camera, Mail, Phone, User } from 'lucide-react-native';
import { Button } from '../../src/components/common/Button';
import { Header } from '../../src/components/common/Header';
import { Input } from '../../src/components/common/Input';
import { ScreenWash } from '../../src/components/common/ScreenWash';
import { useAuth } from '../../src/context/AuthContext';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/theme';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuth();

  const [fullname, setFullname] = useState(user?.fullname || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '1998-04-12'
  );
  const [avatarUrl, setAvatarUrl] = useState(user?.profilePicture?.url || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!fullname.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      await updateUser({
        fullname: fullname.trim(),
        phoneNumber: phoneNumber.trim(),
        dateOfBirth: new Date(dateOfBirth).toISOString(),
        profilePicture: avatarUrl ? { id: 1, url: avatarUrl } : null,
      });

      Alert.alert('Profile Updated', 'Your profile details have been saved successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenWash />
      <Header title="Edit Profile" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar Photo Picker */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <User size={36} color={Colors.textTertiary} />
              </View>
            )}
            <TouchableOpacity
              onPress={() => {
                Alert.prompt
                  ? Alert.prompt(
                      'Avatar Image URL',
                      'Paste an image URL for your profile picture',
                      (text) => setAvatarUrl(text)
                    )
                  : setAvatarUrl(
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                    );
              }}
              style={styles.cameraBadge}
            >
              <Camera size={14} color={Colors.textInverse} />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>Tap camera to change photo</Text>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Input
            label="Full Name"
            value={fullname}
            onChangeText={setFullname}
            placeholder="Your full name"
            icon={<User size={18} color={Colors.textTertiary} />}
          />

          <Input
            label="Email Address"
            value={user?.email || ''}
            editable={false}
            placeholder="email@example.com"
            icon={<Mail size={18} color={Colors.textTertiary} />}
            containerStyle={{ opacity: 0.7 }}
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
            label="Date of Birth"
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="YYYY-MM-DD"
            icon={<Calendar size={18} color={Colors.textTertiary} />}
          />

          <Button
            title="Save Changes"
            onPress={handleSave}
            loading={loading}
            fullWidth
            size="lg"
            style={styles.saveButton}
          />
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
    padding: Spacing.screenPadding,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: Colors.green,
  },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.surface1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.canvas,
  },
  changePhotoText: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
  },
  formSection: {
    gap: Spacing.xs,
  },
  saveButton: {
    marginTop: Spacing.lg,
  },
});
