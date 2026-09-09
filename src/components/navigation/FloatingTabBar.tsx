import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Compass, Home, Radio, User, Zap } from 'lucide-react-native';
import { Colors, Fonts, Spacing } from '../../theme';

export const FloatingTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const iconScale = useRef(new Animated.Value(1)).current;
  const slideX = useRef(new Animated.Value(0)).current;
  const [barWidth, setBarWidth] = useState(0);

  const routeCount = state.routes.length;

  useEffect(() => {
    if (barWidth <= 0) return;
    const tabWidth = (barWidth - Spacing.sm * 2) / routeCount;
    Animated.spring(slideX, {
      toValue: Spacing.sm + tabWidth * state.index + 3,
      bounciness: 14,
      speed: 16,
      useNativeDriver: true,
    }).start();
  }, [state.index, barWidth, routeCount, slideX]);

  const handleIconPressIn = () => {
    Animated.spring(iconScale, {
      toValue: 0.85,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const handleIconPressOut = () => {
    Animated.spring(iconScale, {
      toValue: 1.0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const tabIcons: Record<string, (color: string) => React.ReactNode> = {
    index: (c) => <Home size={22} color={c} strokeWidth={2} />,
    tournaments: (c) => <Compass size={22} color={c} strokeWidth={2} />,
    book: (c) => <Zap size={22} color={c} strokeWidth={2} />,
    live: (c) => <Radio size={22} color={c} strokeWidth={2} />,
    profile: (c) => <User size={22} color={c} strokeWidth={2} />,
  };

  const tabLabels: Record<string, string> = {
    index: 'Home',
    tournaments: 'Explore',
    book: 'Book',
    live: 'Live',
    profile: 'Profile',
  };

  const tabWidth = barWidth > 0 ? (barWidth - Spacing.sm * 2) / routeCount : 0;
  const pillWidth = Math.max(0, tabWidth - 6);

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.barShadow}>
        <View style={styles.barClip}>
          <BlurView
            intensity={80}
            tint="dark"
            style={styles.tabBar}
            onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
          >
            {/* Sliding white active pill — bouncy spring */}
            {barWidth > 0 && (
              <Animated.View
                style={[
                  styles.slidePill,
                  { width: pillWidth, transform: [{ translateX: slideX }] },
                ]}
                pointerEvents="none"
              />
            )}

            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              const { options } = descriptors[route.key];

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  Haptics.selectionAsync().catch(() => {});
                  navigation.navigate(route.name);
                }
              };

              const iconColor = isFocused ? '#FFFFFF' : Colors.textTertiary;
              const label = tabLabels[route.name] || options.title || route.name;

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  onPressIn={handleIconPressIn}
                  onPressOut={handleIconPressOut}
                  style={styles.tabItem}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Animated.View
                    style={[styles.iconWrapper, { transform: [{ scale: iconScale }] }]}
                  >
                    {tabIcons[route.name] ? (
                      tabIcons[route.name](iconColor)
                    ) : (
                      <Compass size={22} color={iconColor} />
                    )}
                  </Animated.View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.tabLabel,
                      isFocused ? styles.labelActive : styles.labelInactive,
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </BlurView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  barShadow: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 12,
  },
  barClip: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    backgroundColor: 'rgba(13, 17, 15, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 32,
    paddingHorizontal: Spacing.sm,
    position: 'relative',
  },
  slidePill: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    left: 0,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: Fonts.bodySemibold,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: '#FFFFFF',
  },
  labelInactive: {
    color: '#7A847E',
  },
});