import React from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowUpCircle, Wrench } from 'lucide-react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';

interface UpdateModalProps {
  visible: boolean;
  /** force = no dismiss affordance at all (blocking full-screen) */
  mode: 'soft' | 'force' | 'maintenance';
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  primaryLoading?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

/**
 * Full-screen update / maintenance modal. `force` and `maintenance`
 * render without any close affordance — the user must update (or wait).
 */
export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  mode,
  title,
  message,
  primaryLabel,
  onPrimary,
  primaryLoading = false,
  secondaryLabel,
  onSecondary,
}) => {
  const Icon = mode === 'maintenance' ? Wrench : ArrowUpCircle;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      // Blocking modes: ignore the Android back button.
      onRequestClose={mode === 'soft' ? onSecondary : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Icon size={32} color={Colors.green} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={[styles.primaryButton, primaryLoading && styles.primaryButtonDisabled]}
            onPress={onPrimary}
            disabled={primaryLoading}
            activeOpacity={0.85}
          >
            {primaryLoading ? (
              <ActivityIndicator size="small" color={Colors.textInverse} />
            ) : (
              <Text style={styles.primaryText}>{primaryLabel}</Text>
            )}
          </TouchableOpacity>

          {mode === 'soft' && secondaryLabel && onSecondary && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onSecondary}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryText}>{secondaryLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 7, 6, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.screenPadding,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: Colors.surface1,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(57, 255, 136, 0.1)',
    borderWidth: 1.5,
    borderColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.title2,
    fontFamily: Fonts.heading,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  message: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    fontFamily: Fonts.body,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: Colors.green,
    borderRadius: BorderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontFamily: Fonts.bodyBold,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: Colors.textSecondary,
    fontSize: Typography.body,
    fontFamily: Fonts.bodySemibold,
  },
});
