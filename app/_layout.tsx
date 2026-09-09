import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
} from '@expo-google-fonts/sora';
import { useFonts } from 'expo-font';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { View } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { AuthProvider } from '../src/context/AuthContext';
import { LocationProvider } from '../src/context/LocationContext';
import { LiveSync } from '../src/components/common/LiveSync';
import { Colors } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const navDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.canvas,
    card: Colors.canvas,
    text: Colors.textPrimary,
    border: Colors.border,
    primary: Colors.green,
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.canvas }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StripeProvider
            publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
            merchantIdentifier="merchant.com.smashlive.user"
            urlScheme="smashlive"
          >
            <LiveSync />
            <AuthProvider>
            <LocationProvider>
              <ThemeProvider value={navDarkTheme}>
                <StatusBar style="light" backgroundColor={Colors.canvas} />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Colors.canvas },
                    animation: 'slide_from_right',
                  }}
                >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="arena/[id]/index"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="arena/[id]/checkout"
                    options={{ headerShown: false, presentation: 'modal' }}
                  />
                  <Stack.Screen
                    name="tournament/[id]/index"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="tournament/[id]/draw"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="event/[id]/register"
                    options={{ headerShown: false, presentation: 'modal' }}
                  />
                  <Stack.Screen
                    name="match/[id]"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="profile/bookings"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="profile/matches"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="profile/transactions"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="profile/edit"
                    options={{ headerShown: false, presentation: 'modal' }}
                  />
                </Stack>
              </ThemeProvider>
            </LocationProvider>
          </AuthProvider>
          </StripeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </View>
  );
}