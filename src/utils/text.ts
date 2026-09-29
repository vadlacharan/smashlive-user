export function toTitleCase(input?: string | null): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatCurrency(amount: number, currency?: string): string {
  return (currency || '').toUpperCase() === 'USD' ? `$${amount}` : `₹${amount}`;
}
