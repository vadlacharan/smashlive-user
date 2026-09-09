import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { BadmintonLoader } from '../src/components/common/BadmintonLoader';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { isLoading } = useAuth();
  const [minSplashDone, setMinSplashDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinSplashDone(true), 900);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || !minSplashDone) {
    return (
      <BadmintonLoader
        fullscreen
        message="Connecting to sports arenas & live tournaments..."
      />
    );
  }

  return <Redirect href="/(tabs)" />;
}
