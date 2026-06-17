export const EXPIRY_OPTIONS = [
  { value: '7d', label: '7 days', description: 'Default — auto-deletes after 7 days', days: 7 },
  { value: '14d', label: '14 days', description: 'Two-week sharing', days: 14 },
  { value: '21d', label: '21 days', description: 'Three-week sharing', days: 21 },
  { value: '30d', label: '30 days', description: 'Maximum — auto-deletes after 30 days', days: 30 },
];

export const DEFAULT_EXPIRY_DAYS = 7;
export const MAX_EXPIRY_DAYS = 30;
export const MAX_EMAILS = 3;

export function expiryToDays(expiry) {
  const days = EXPIRY_OPTIONS.find((o) => o.value === expiry)?.days ?? DEFAULT_EXPIRY_DAYS;
  return Math.min(days, MAX_EXPIRY_DAYS);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return EMAIL_RE.test(email.trim());
}

export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function parseEmailsInput(input) {
  if (!input?.trim()) return [];

  return input
    .split(/[,;\n]+/)
    .map((email) => normalizeEmail(email))
    .filter(Boolean);
}
