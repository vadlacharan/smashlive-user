export function toTitleCase(input?: string | null): string {
  if (!input) return '';
  return input
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatCurrency(amount: number, currency?: 'INR' | 'USD'): string {
  return currency === 'USD' ? `$${amount}` : `₹${amount}`;
}
