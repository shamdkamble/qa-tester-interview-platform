/**
 * Restricted candidate access — only one invited candidate may take the test.
 * Admin / interviewer login remains available (not blocked).
 *
 * Candidate access window ends: 29 Jul 2026, 6:00 PM IST (Asia/Kolkata)
 */

export const RESTRICTED_ACCESS = true;

/** Invited candidate (case-insensitive email match) */
export const INVITED_EMAIL = 'yuyutsu02@gmail.com';

/**
 * Access token for the invited candidate.
 * Share privately with the candidate only.
 */
export const ACCESS_TOKEN = 'BH-YUY-zgRcr5vAUSS7-32f3iHEY5UV';

/** Hard deadline: 6:00 PM IST on 29 Jul 2026 */
export const ACCESS_EXPIRES_AT = '2026-07-29T18:00:00+05:30';

export function getAccessExpiryDate() {
  return new Date(ACCESS_EXPIRES_AT);
}

export function isAccessWindowOpen(now = new Date()) {
  return now.getTime() < getAccessExpiryDate().getTime();
}

export function getSecondsUntilAccessExpiry(now = new Date()) {
  return Math.max(0, Math.floor((getAccessExpiryDate().getTime() - now.getTime()) / 1000));
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/**
 * Validate invited candidate credentials (admin is not gated by this).
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function validateInvitedAccess({ email, token, now = new Date() }) {
  if (!RESTRICTED_ACCESS) {
    return { ok: true };
  }

  if (!isAccessWindowOpen(now)) {
    return {
      ok: false,
      error: 'Your access window has closed (deadline was 6:00 PM IST). The assessment is locked for candidates.'
    };
  }

  const em = normalizeEmail(email);
  if (em !== normalizeEmail(INVITED_EMAIL)) {
    return {
      ok: false,
      error: 'This assessment is limited to an invited candidate. Your email is not authorized.'
    };
  }

  if (String(token || '').trim() !== ACCESS_TOKEN) {
    return {
      ok: false,
      error: 'Invalid access token. Use the token shared with you by the interviewer.'
    };
  }

  return { ok: true };
}

export function formatAccessDeadline() {
  return getAccessExpiryDate().toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });
}
