const STORAGE_KEY = 'discovery-engine-state-v1';

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { saved: {}, behavior: {} };
    const parsed = JSON.parse(raw);
    return { saved: parsed.saved || {}, behavior: parsed.behavior || {} };
  } catch {
    return { saved: {}, behavior: {} };
  }
}

let state = load();
const listeners = new Set();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  listeners.forEach((fn) => fn(state));
}

export function onStoreChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isSaved(trackId) {
  return Boolean(state.saved[trackId]);
}

export function toggleSave(trackId) {
  if (state.saved[trackId]) {
    delete state.saved[trackId];
  } else {
    state.saved[trackId] = { savedAt: Date.now() };
  }
  persist();
  return isSaved(trackId);
}

export function getSavedIds() {
  return Object.keys(state.saved);
}

export function recordProgress(trackId, completionFraction) {
  const entry = state.behavior[trackId] || { maxCompletion: 0, plays: 0 };
  entry.plays += 1;
  entry.maxCompletion = Math.max(entry.maxCompletion, completionFraction);
  state.behavior[trackId] = entry;
  persist();
}

export function getLiveStats(trackId) {
  const behavior = state.behavior[trackId] || { maxCompletion: 0 };
  return {
    saved: isSaved(trackId),
    completionRate: behavior.maxCompletion,
    predictions: 0,
  };
}
