import React, { useState } from 'react';
import {
  KeyRound, Plus, Copy, Check, Trash2, Ban, RefreshCw, Clock, User
} from 'lucide-react';
import {
  generateAccessToken,
  loadTokenHistory,
  revokeToken,
  deleteTokenFromHistory,
  getTokenStatus,
  formatExpiry,
  TOKEN_TTL_MS
} from '../utils/accessTokens';

export default function AdminTokenManager() {
  const [tokens, setTokens] = useState(() => loadTokenHistory());
  const [note, setNote] = useState('');
  const [lastCreated, setLastCreated] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const refresh = () => setTokens(loadTokenHistory());

  const handleGenerate = () => {
    const { token, record } = generateAccessToken({ note });
    setLastCreated({ token, record });
    setNote('');
    setTokens(loadTokenHistory());
  };

  const handleCopy = async (token, id) => {
    try {
      await navigator.clipboard.writeText(token);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = token;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleRevoke = (id) => {
    if (!confirm('Revoke this token? Candidates will not be able to use it (on browsers that share revoke history, and after you re-share only new tokens).')) return;
    setTokens(revokeToken(id));
  };

  const handleDelete = (id) => {
    if (!confirm('Remove this token from your local history?')) return;
    setTokens(deleteTokenFromHistory(id));
    if (lastCreated?.record?.id === id) setLastCreated(null);
  };

  const hours = TOKEN_TTL_MS / (60 * 60 * 1000);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-violet-400" />
            Candidate Access Tokens
          </h3>
          <p className="text-xs text-secondary mt-0.5 max-w-xl leading-relaxed">
            Generate a token, share it with any candidate. They enter it after email login.
            Each token is valid for <strong className="text-primary">{hours} hours</strong> from generation and works on any device.
          </p>
        </div>
        <button type="button" onClick={refresh} className="btn btn-ghost">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Generator */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">
              Optional note (candidate name / batch)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Yuyutsu — morning slot"
              className="glass-input"
              maxLength={80}
            />
          </div>
          <button type="button" onClick={handleGenerate} className="btn btn-violet py-2.5 px-5">
            <Plus className="w-4 h-4" /> Generate Token
          </button>
        </div>

        {lastCreated && (
          <div className="surface-muted rounded-xl p-4 space-y-3 border border-emerald-500/25">
            <div className="flex items-center justify-between gap-2">
              <span className="badge badge-low">New token ready</span>
              <span className="text-[10px] text-muted font-mono">
                Expires {formatExpiry(lastCreated.record.expiresAt)}
              </span>
            </div>
            <code className="block text-xs sm:text-sm font-mono text-primary break-all bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--border)]">
              {lastCreated.token}
            </code>
            <button
              type="button"
              onClick={() => handleCopy(lastCreated.token, lastCreated.record.id)}
              className="btn btn-success"
            >
              {copiedId === lastCreated.record.id ? (
                <><Check className="w-4 h-4" /> Copied</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy token to share</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* History */}
      <div className="space-y-3">
        <h4 className="section-label">Token history ({tokens.length})</h4>
        {tokens.length === 0 ? (
          <div className="glass-panel rounded-2xl p-10 text-center text-xs text-muted">
            No tokens generated yet on this browser. Click <strong className="text-primary">Generate Token</strong> to create one.
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {tokens.map((t) => {
              const status = getTokenStatus(t);
              const statusBadge =
                status === 'active' ? 'badge-low' :
                status === 'expired' ? 'badge-high' : 'badge-critical';
              return (
                <div key={t.id} className="glass-panel rounded-xl p-4 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`badge ${statusBadge}`}>{status}</span>
                      {t.note && (
                        <span className="text-xs text-primary font-semibold truncate">{t.note}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(t.token, t.id)}
                        className="btn btn-ghost py-1 px-2 text-[11px]"
                        disabled={status !== 'active'}
                      >
                        {copiedId === t.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        Copy
                      </button>
                      {status === 'active' && (
                        <button type="button" onClick={() => handleRevoke(t.id)} className="btn btn-ghost py-1 px-2 text-[11px] text-amber-400">
                          <Ban className="w-3.5 h-3.5" /> Revoke
                        </button>
                      )}
                      <button type="button" onClick={() => handleDelete(t.id)} className="btn btn-ghost py-1 px-2 text-[11px] text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <code className="block text-[10px] font-mono text-muted break-all">{t.token}</code>
                  <div className="flex flex-wrap gap-3 text-[10px] text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Created {formatExpiry(t.createdAt)}
                    </span>
                    <span>Expires {formatExpiry(t.expiresAt)}</span>
                    {(t.redemptions || []).length > 0 && (
                      <span className="flex items-center gap-1 text-indigo-300">
                        <User className="w-3 h-3" />
                        Last used by {t.redemptions[0].email}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
