import { API_BASE_URL } from '../api/client';

/**
 * PayloadCMS media URLs are often relative (e.g. /api/media/file/xyz).
 * Resolve them against the API base so <Image> can load them.
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}