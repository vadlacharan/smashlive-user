import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';

interface PaymentLoaderProps {
  visible: boolean;
  title?: string;
  subtitle?: string;
}

export const PaymentLoader: React.FC<PaymentLoaderProps> = ({
  visible,
  title = 'Processing Payment...',
  subtitle = 'Please do not close or refresh this screen.',
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <LinearGradient
            colors={['#14261C', '#0F1512', Colors.canvas]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.orbRow}>
              <ActivityIndicator size="large" color={Colors.green} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 15, 13, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.screenPadding,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    shadowColor: '#39FF88',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  cardGradient: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(57, 255, 136, 0.25)',
    overflow: 'hidden',
  },
  orbRow: {
    marginTop: -8,
    marginBottom: -4,
  },
  title: {
    color: Colors.textPrimary,
    fontFamily: Fonts.headingSemibold,
    fontSize: Typography.title3,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: Colors.textTertiary,
    fontSize: Typography.footnote,
    fontFamily: Fonts.body,
    textAlign: 'center',
    lineHeight: 18,
  },
});