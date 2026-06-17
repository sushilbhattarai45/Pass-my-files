export function formatDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDaysUntilExpiry(dateString) {
  if (!dateString) return null;
  const now = new Date();
  const expiry = new Date(dateString);
  if (Number.isNaN(expiry.getTime())) return null;
  return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
}
