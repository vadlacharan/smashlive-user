import * as Location from 'expo-location';
import { GeoLocationCoords } from '../types';

// Default location when GPS is resolving
export const DEFAULT_COORDS: GeoLocationCoords = {
  latitude: 0,
  longitude: 0,
  cityName: 'Current Location',
  areaName: 'Locating...',
};

/**
 * Calculates distance in kilometers between two GPS coordinates using Haversine formula
 */
export function calculateDistanceKm(
  lat1?: number,
  lon1?: number,
  lat2?: number,
  lon2?: number
): number {
  if (
    lat1 === undefined ||
    lon1 === undefined ||
    lat2 === undefined ||
    lon2 === undefined ||
    (lat1 === 0 && lon1 === 0) ||
    (lat2 === 0 && lon2 === 0)
  ) {
    return 0;
  }

  const R = 6371; // Radius of Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Formats distance into a human-readable badge text (e.g. "850 m", "1.4 km")
 */
export function formatDistance(distanceKm?: number): string {
  if (distanceKm === undefined || isNaN(distanceKm) || distanceKm <= 0) return '';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

function cleanLocationString(str?: string | null): string {
  if (!str) return '';
  const trimmed = str.trim();
  // Filter out Plus codes like HRJM+JG7, 8F8X+X4, or any code containing '+'
  if (trimmed.includes('+') || /^[A-Z0-9]{2,8}\+[A-Z0-9]{2,6}/i.test(trimmed)) {
    return '';
  }
  // Filter out postal codes or pure numeric identifiers
  if (/^\d{3,}$/.test(trimmed)) {
    return '';
  }
  return trimmed;
}

/**
 * Requests location permission and gets current coordinates
 */
export async function getCurrentUserLocation(): Promise<GeoLocationCoords> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        latitude: 0,
        longitude: 0,
        cityName: 'All Locations',
        areaName: 'Nearby',
      };
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const [geocoded] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    const rawCity = cleanLocationString(geocoded?.city);
    const rawDistrict = cleanLocationString(geocoded?.district);
    const rawSubregion = cleanLocationString(geocoded?.subregion);
    const rawRegion = cleanLocationString(geocoded?.region);
    const rawStreet = cleanLocationString(geocoded?.street);
    const rawName = cleanLocationString(geocoded?.name);

    const city = rawCity || rawSubregion || rawRegion || 'Nearby';
    const area = rawDistrict || rawName || rawStreet || rawSubregion || city;

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      cityName: city,
      areaName: area,
    };
  } catch (error) {
    return {
      latitude: 0,
      longitude: 0,
      cityName: 'All Locations',
      areaName: 'Nearby',
    };
  }
}
