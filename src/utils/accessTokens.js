/**
 * Admin-issued assessment access tokens.
 *
 * Tokens are self-contained (signed payload) so candidates can validate them
 * on any device without sharing localStorage with the admin machine.
 * Validity: 4 hours from generation.
 *
 * Admin UI also keeps a local history of tokens it has created.
 */

import { TOKEN_SIGNING_SECRET } from '../config/auth';

export const TOKEN_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours
const HISTORY_KEY = 'bughunt_access_tokens_v1';

function toBase64Url(str) {
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(b64url) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return decodeURIComponent(escape(atob(b64)));
}

/** Lightweight deterministic signature (client-side gate, not military-grade) */
function sign(body) {
  const data = `${body}::${TOKEN_SIGNING_SECRET}`;
  let h = 2166136261;
  for (let i = 0; i < data.length; i++) {
    h ^= data.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  // Expand to longer hex-ish token segment
  let h2 = 5381;
  for (let i = 0; i < data.length; i++) {
    h2 = ((h2 << 5) + h2) ^ data.charCodeAt(i);
  }
  const a = (h >>> 0).toString(16).padStart(8, '0');
  const b = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${a}${b}`;
}

function randomId() {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(9);
    crypto.getRandomValues(arr);
    return Array.from(arr, (x) => x.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(16).slice(2, 14) + Date.now().toString(16);
}

/**
 * Generate a new access token (admin only).
 * @param {{ note?: string }} opts
 * @returns {{ token: string, record: object }}
 */
export function generateAccessToken({ note = '' } = {}) {
  const iat = Date.now();
  const exp = iat + TOKEN_TTL_MS;
  const jti = randomId();
  const payload = { v: 1, iat, exp, jti, note: String(note || '').slice(0, 80) };
  const body = toBase64Url(JSON.stringify(payload));
  const sig = sign(body);
  const token = `BHQ.${body}.${sig}`;

  const record = {
    id: jti,
    token,
    note: payload.note,
    createdAt: new Date(iat).toISOString(),
    expiresAt: new Date(exp).toISOString(),
    iat,
    exp,
    revoked: false,
    redemptions: []
  };

  const history = loadTokenHistory();
  history.unshift(record);
  // Keep last 100
  saveTokenHistory(history.slice(0, 100));

  return { token, record };
}

/**
 * Validate a candidate-entered token.
 * @returns {{ ok: true, payload: object, secondsRemaining: number } | { ok: false, error: string }}
 */
export function validateAccessToken(rawToken, now = Date.now()) {
  const token = String(rawToken || '').trim();
  if (!token) {
    return { ok: false, error: 'Please enter the access token provided by your interviewer.' };
  }

  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'BHQ') {
    return { ok: false, error: 'Invalid token format. Copy the full token exactly as shared.' };
  }

  const [, body, sig] = parts;
  if (sign(body) !== sig) {
    return { ok: false, error: 'Invalid or forged token. Ask your interviewer for a fresh token.' };
  }

  let payload;
  try {
    payload = JSON.parse(fromBase64Url(body));
  } catch {
    return { ok: false, error: 'Token could not be decoded. Request a new token from your interviewer.' };
  }

  if (!payload?.exp || !payload?.iat || !payload?.jti) {
    return { ok: false, error: 'Token payload is incomplete. Request a new token.' };
  }

  // Check local revoke list (works when same browser as admin, or after import)
  const history = loadTokenHistory();
  const match = history.find((t) => t.id === payload.jti || t.token === token);
  if (match?.revoked) {
    return { ok: false, error: 'This token has been revoked by the interviewer.' };
  }

  if (now >= payload.exp) {
    return {
      ok: false,
      error: 'This token has expired (valid for 4 hours from generation). Ask for a new token.'
    };
  }

  const secondsRemaining = Math.max(0, Math.floor((payload.exp - now) / 1000));

  return { ok: true, payload, secondsRemaining };
}

/** Record that a candidate redeemed a token (best-effort local history) */
export function recordTokenRedemption(token, { email, name }) {
  const history = loadTokenHistory();
  const idx = history.findIndex((t) => t.token === token);
  if (idx === -1) return;
  const entry = {
    email,
    name,
    at: new Date().toISOString()
  };
  history[idx].redemptions = [entry, ...(history[idx].redemptions || [])].slice(0, 20);
  saveTokenHistory(history);
}

export function revokeToken(id) {
  const history = loadTokenHistory();
  const next = history.map((t) => (t.id === id ? { ...t, revoked: true } : t));
  saveTokenHistory(next);
  return next;
}

export function deleteTokenFromHistory(id) {
  const next = loadTokenHistory().filter((t) => t.id !== id);
  saveTokenHistory(next);
  return next;
}

export function loadTokenHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTokenHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

export function getTokenStatus(record, now = Date.now()) {
  if (record.revoked) return 'revoked';
  if (now >= record.exp) return 'expired';
  return 'active';
}

export function formatExpiry(isoOrMs) {
  const d = typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function secondsUntil(expMs, now = Date.now()) {
  return Math.max(0, Math.floor((expMs - now) / 1000));
}
