const KEY = 'kana_pwa_state_v1';

const DEFAULT_STATE = {
  active: {},       // { kanaId: true }
  progress: {},     // { kanaId: { ease, interval, reps, due, lapses, correct, total } }
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STATE), ...parsed };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function persist() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function isActive(id) {
  return !!state.active[id];
}

export function setActive(id, on) {
  if (on) state.active[id] = true;
  else delete state.active[id];
  persist();
}

export function setActiveMany(ids, on) {
  for (const id of ids) {
    if (on) state.active[id] = true;
    else delete state.active[id];
  }
  persist();
}

export function activeIds() {
  return Object.keys(state.active);
}

export function getProgress(id) {
  return state.progress[id] || { ease: 2.5, interval: 0, reps: 0, due: 0, lapses: 0, correct: 0, total: 0 };
}

export function saveProgress(id, p) {
  state.progress[id] = p;
  persist();
}

export function recordAttempt(id, correct) {
  const p = getProgress(id);
  p.total = (p.total || 0) + 1;
  if (correct) p.correct = (p.correct || 0) + 1;
  saveProgress(id, p);
}

export function resetProgress() {
  state.progress = {};
  persist();
}

export function exportState() {
  return JSON.stringify(state, null, 2);
}

export function getStats() {
  const active = Object.keys(state.active);
  const now = Date.now();
  let due = 0, learned = 0;
  for (const id of active) {
    const p = state.progress[id];
    if (!p || p.reps === 0) { due++; continue; }
    if (p.due <= now) due++;
    if (p.reps >= 2 && p.interval >= 3) learned++;
  }
  return { active: active.length, due, learned };
}
