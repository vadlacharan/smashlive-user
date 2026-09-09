import React, { useRef, useState } from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Eye, EyeOff, XCircle } from 'lucide-react-native';
import { BorderRadius, Colors, Fonts, Spacing, Typography } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  clearable?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  icon,
  containerStyle,
  clearable = false,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const isSecure = secureTextEntry && !isPasswordVisible;

  const animateBorder = (focused: boolean) => {
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.border, Colors.green],
  });

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View
        style={[
          styles.inputWrapper,
          { borderColor },
          !!error && styles.inputWrapperError,
        ]}
      >
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry={isSecure}
          onFocus={() => {
            setIsFocused(true);
            animateBorder(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            animateBorder(false);
          }}
          style={styles.textInput}
          {...rest}
        />
        {clearable && !!value && (
          <TouchableOpacity
            onPress={() => onChangeText && onChangeText('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.actionIcon}
          >
            <XCircle size={18} color={Colors.textTertiary} />
          </TouchableOpacity>
        )}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.actionIcon}
          >
            {isPasswordVisible ? (
              <EyeOff size={18} color={Colors.textSecondary} />
            ) : (
              <Eye size={18} color={Colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </Animated.View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: Typography.footnote,
    marginBottom: Spacing.xs,
    fontFamily: Fonts.bodyMedium,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface2,
    borderWidth: 1,
    borderRadius: BorderRadius.sm + 2,
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  inputWrapperError: {
    borderColor: Colors.danger,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  textInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    fontFamily: Fonts.body,
    height: '100%',
  },
  actionIcon: {
    marginLeft: Spacing.sm,
    padding: 4,
  },
  errorText: {
    color: Colors.danger,
    fontSize: Typography.footnote,
    marginTop: Spacing.xs,
  },
});