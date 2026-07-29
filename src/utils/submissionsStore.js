/**
 * Persist candidate assessment submissions for admin review.
 * Uses localStorage (same browser/device). Export/import for cross-device.
 */

const STORAGE_KEY = 'bughunt_qa_submissions_v1';

export function loadSubmissions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSubmissions(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list;
}

/**
 * Save a completed assessment. Returns the stored record.
 */
export function addSubmission(payload) {
  const list = loadSubmissions();
  const record = {
    id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    submittedAt: new Date().toISOString(),
    ...payload
  };
  const next = [record, ...list];
  saveSubmissions(next);
  return record;
}

export function deleteSubmission(id) {
  const next = loadSubmissions().filter((s) => s.id !== id);
  saveSubmissions(next);
  return next;
}

export function clearAllSubmissions() {
  saveSubmissions([]);
  return [];
}

export function exportSubmissionsJson() {
  const data = {
    exportedAt: new Date().toISOString(),
    version: 1,
    submissions: loadSubmissions()
  };
  return JSON.stringify(data, null, 2);
}

export function importSubmissionsJson(jsonText, { merge = true } = {}) {
  const data = JSON.parse(jsonText);
  const incoming = Array.isArray(data) ? data : data.submissions;
  if (!Array.isArray(incoming)) throw new Error('Invalid submissions file');

  if (!merge) {
    saveSubmissions(incoming);
    return incoming;
  }

  const existing = loadSubmissions();
  const ids = new Set(existing.map((s) => s.id));
  const merged = [...existing];
  incoming.forEach((s) => {
    if (s && s.id && !ids.has(s.id)) {
      merged.push(s);
      ids.add(s.id);
    }
  });
  // Newest first
  merged.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  saveSubmissions(merged);
  return merged;
}
