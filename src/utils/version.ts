/**
 * Semantic version helpers for the in-app update flow.
 * Compares dot-separated versions ("1.5.0") numerically per segment.
 */
export function compareVersions(a: string, b: string): number {
  const pa = a
    .trim()
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  const pb = b
    .trim()
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return 0;
}

export function isVersionOlder(current: string, target: string): boolean {
  if (!current || !target) return false;
  return compareVersions(current, target) < 0;
}
