import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pressed = useRef(false);

  const handlePressIn = () => {
    if (disabled || loading || pressed.current) return;
    pressed.current = true;
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
    if (variant === 'primary') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handlePressOut = () => {
    pressed.current = false;
    Animated.spring(scaleAnim, {
      toValue: 1.0,
      useNativeDriver: true,
      speed: 25,
      bounciness: 4,
    }).start();
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return styles.sizeSm;
      case 'lg':
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  const textStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      case 'ghost':
        return styles.ghostText;
    }
  };

  const isDisabled = disabled || loading;

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' && !isDisabled ? Colors.textInverse : Colors.green}
          style={styles.contentLayer}
        />
      );
    }
    return (
      <View style={[styles.contentRow, styles.contentLayer]}>
        {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
        <Text style={[styles.baseText, textStyle()]} numberOfLines={1}>
          {title}
        </Text>
        {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
      </View>
    );
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && styles.fullWidth]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={({ pressed: p }) => [
          styles.base,
          getSizeStyle(),
          fullWidth && styles.fullWidth,
          variant === 'primary' && (isDisabled ? styles.primaryDisabled : styles.primary),
          variant === 'primary' && p && !isDisabled && styles.primaryPressed,
          variant === 'secondary' && styles.secondary,
          variant === 'outline' && styles.outline,
          variant === 'danger' && styles.danger,
          variant === 'ghost' && styles.ghost,
          isDisabled && variant !== 'primary' && styles.disabled,
          style,
        ]}
      >
        {variant === 'primary' && !isDisabled ? (
          <LinearGradient
            colors={Colors.ctaGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill, styles.fillLayer]}
            pointerEvents="none"
          />
        ) : null}
        {renderContent()}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  baseText: {
    fontFamily: Fonts.headingSemibold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.2,
    textAlign: 'center',
    flexShrink: 1,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
  // Sizes — 44px min tap target
  sizeSm: {
    height: 44,
    paddingHorizontal: Spacing.lg,
  },
  sizeMd: {
    height: 52,
    paddingHorizontal: Spacing.xxl,
  },
  sizeLg: {
    height: 56,
    paddingHorizontal: Spacing.xxl,
  },
  // The Pressable is the self-sizing surface; the gradient fills it as a
  // background layer, so the button works as a shrink-to-fit flex child too.
  fillLayer: {
    zIndex: 0,
  },
  contentLayer: {
    zIndex: 1,
    elevation: 1,
  },
  primary: {
    backgroundColor: '#2BDD75',
  },
  primaryPressed: {
    backgroundColor: '#39FF88',
  },
  primaryDisabled: {
    backgroundColor: Colors.surface2,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryText: {
    color: Colors.textInverse,
  },
  // Secondary — outline
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  secondaryText: {
    color: Colors.textPrimary,
  },
  // Outline — green-tinted border on press
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  outlineText: {
    color: Colors.textPrimary,
  },
  danger: {
    backgroundColor: Colors.dangerMuted,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 92, 92, 0.4)',
  },
  dangerText: {
    color: Colors.danger,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: Colors.green,
    fontFamily: Fonts.bodySemibold,
    fontSize: Typography.body,
    letterSpacing: 0,
  },
  disabled: {
    backgroundColor: Colors.surface2,
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
});