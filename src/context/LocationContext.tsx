import React, { createContext, useContext, useEffect, useState } from 'react';
import { GeoLocationCoords } from '../types';
import { calculateDistanceKm, DEFAULT_COORDS, formatDistance, getCurrentUserLocation } from '../utils/location';

interface LocationContextType {
  location: GeoLocationCoords;
  isDetecting: boolean;
  refreshLocation: () => Promise<void>;
  getDistanceFromUser: (venueCoords?: [number, number]) => { distanceKm?: number; formatted: string };
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<GeoLocationCoords>(DEFAULT_COORDS);
  const [isDetecting, setIsDetecting] = useState(false);

  const refreshLocation = async () => {
    setIsDetecting(true);
    try {
      const coords = await getCurrentUserLocation();
      setLocation(coords);
    } catch {
      setLocation(DEFAULT_COORDS);
    } finally {
      setIsDetecting(false);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  const getDistanceFromUser = (venueCoords?: [number, number]) => {
    if (!venueCoords || venueCoords.length !== 2) {
      return { formatted: '' };
    }
    // venueCoords is [longitude, latitude]
    const [venueLng, venueLat] = venueCoords;
    const distanceKm = calculateDistanceKm(
      location.latitude,
      location.longitude,
      venueLat,
      venueLng
    );
    return {
      distanceKm,
      formatted: formatDistance(distanceKm),
    };
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        isDetecting,
        refreshLocation,
        getDistanceFromUser,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
