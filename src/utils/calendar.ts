import { Linking, Platform } from 'react-native';

/**
 * Formats an amount with currency symbol
 */
export function formatCurrency(amount: number, currency: 'INR' | 'USD' = 'INR'): string {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `$${amount.toFixed(2)}`;
}

/**
 * Formats a date string into "Mon, 25 Aug"
 */
export function formatDateShort(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Formats date into "25 Aug 2026"
 */
export function formatDateFull(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatHourOnly12(h: number): string {
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:00 ${ampm}`;
}

export function parseOperatingHour(timeStr?: string, defaultHour: number = 6): number {
  if (!timeStr) return defaultHour;
  if (typeof timeStr === 'string' && timeStr.includes(':') && !timeStr.includes('T')) {
    const h = parseInt(timeStr.split(':')[0], 10);
    return isNaN(h) ? defaultHour : h;
  }
  try {
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      if (d.getUTCMinutes() === 30) {
        return (d.getUTCHours() + 5 + 1) % 24;
      }
      return d.getUTCHours();
    }
  } catch {}
  return defaultHour;
}

export function formatOperatingHours(openTime?: string, closeTime?: string): string {
  const openH = parseOperatingHour(openTime, 6);
  const closeH = parseOperatingHour(closeTime, 23);
  return `Open Daily: ${formatHourOnly12(openH)} – ${formatHourOnly12(closeH)}`;
}

/**
 * Formats time range e.g. "7:00 AM – 8:00 AM" matching selected slot hours
 */
export function formatTimeRange(startIso: string, durationHours: number = 1): string {
  if (!startIso) return '6:00 AM – 7:00 AM';

  let startHour = 6;
  if (typeof startIso === 'string' && startIso.includes('T')) {
    const timePart = startIso.split('T')[1];
    const h = parseInt(timePart.split(':')[0], 10);
    if (!isNaN(h)) {
      startHour = h;
    }
  } else {
    const d = new Date(startIso);
    if (!isNaN(d.getTime())) {
      startHour = d.getUTCHours();
    }
  }

  const endHour = (startHour + Math.max(1, durationHours)) % 24;
  return `${formatHourOnly12(startHour)} – ${formatHourOnly12(endHour)}`;
}

/**
 * Opens device map / directions with given longitude and latitude or venue name
 */
export function openMapsDirections(coords?: [number, number], venueLabel?: string) {
  if (!coords && !venueLabel) return;
  
  let url = '';
  if (coords && coords.length === 2) {
    const [lng, lat] = coords;
    if (Platform.OS === 'ios') {
      url = `maps://?daddr=${lat},${lng}&q=${encodeURIComponent(venueLabel || 'Arena')}`;
    } else {
      url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    }
  } else if (venueLabel) {
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueLabel)}`;
  }
  
  if (url) {
    Linking.openURL(url).catch((err) => console.warn('Could not open maps link:', err));
  }
}

/**
 * Simulates or opens calendar event add for booking/match
 */
export function addToCalendar(title: string, startDate: Date, durationHours: number = 1, location?: string) {
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000);
  
  const startStr = startDate.toISOString().replace(/-|:|\.\d+/g, '');
  const endStr = endDate.toISOString().replace(/-|:|\.\d+/g, '');
  
  const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${startStr}/${endStr}&details=${encodeURIComponent(
    'Booked on SmashLive — Sports Court & Tournament Platform'
  )}&location=${encodeURIComponent(location || '')}`;

  Linking.openURL(googleCalendarUrl).catch((err) => console.warn('Could not open calendar link:', err));
}
