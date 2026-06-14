const KEY = 'kana_pwa_state_v1';

const DEFAULT_STATE = {
  active: {},               // { kanaId: true } - activated kana for kana exercises
  progress: {},             // { kanaId: { ease, interval, reps, due, lapses, correct, total } }
  activePokemon: {},        // { pokemonId: true } - activated Pokémon for Pokémon mode
  pokemonProgress: {},      // { pokemonId: { correct, total, lastSeen } }
  vocabSeen: {},            // { vocabId: { firstSeen, lastSeen, correct, total, level } }
  vocabActiveThemes: {},    // { themeKey: true }
  vocabDaily: {},           // { 'YYYY-MM-DD': { introducedIds: [vocabId] } }
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

// === Kana selection ===
export function isActive(id) { return !!state.active[id]; }

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

export function activeIds() { return Object.keys(state.active); }
export function activeIdSet() { return new Set(Object.keys(state.active)); }

// === Kana progress (SRS) ===
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

export function getStats() {
  const active = Object.keys(state.active);
  let totalAttempts = 0;
  let totalCorrect = 0;
  for (const id of active) {
    const p = state.progress[id];
    if (!p) continue;
    totalAttempts += p.total || 0;
    totalCorrect += p.correct || 0;
  }
  const accuracy = totalAttempts > 0 ? Math.round(totalCorrect / totalAttempts * 100) : 0;
  return {
    active: active.length,
    attempts: totalAttempts,
    accuracy,
  };
}

// === Pokémon selection ===
export function isPokemonActive(id) { return !!state.activePokemon[id]; }

export function setPokemonActive(id, on) {
  if (on) state.activePokemon[id] = true;
  else delete state.activePokemon[id];
  persist();
}

export function setPokemonActiveMany(ids, on) {
  for (const id of ids) {
    if (on) state.activePokemon[id] = true;
    else delete state.activePokemon[id];
  }
  persist();
}

export function activePokemonIds() {
  return Object.keys(state.activePokemon).map(Number);
}

// === Pokémon progress ===
export function recordPokemonAttempt(id, correct) {
  const p = state.pokemonProgress[id] || { correct: 0, total: 0, lastSeen: 0 };
  p.total++;
  if (correct) p.correct++;
  p.lastSeen = Date.now();
  state.pokemonProgress[id] = p;
  persist();
}

export function getPokemonProgress(id) {
  return state.pokemonProgress[id] || { correct: 0, total: 0, lastSeen: 0 };
}

export function getPokedexStats() {
  return { active: Object.keys(state.activePokemon).length };
}

export function resetPokemonProgress() {
  state.pokemonProgress = {};
  persist();
}

// === Vocab ===
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function getVocabProgress(id) {
  return state.vocabSeen[id] || { firstSeen: 0, lastSeen: 0, correct: 0, total: 0, level: 0 };
}

export function recordVocabAttempt(id, correct) {
  const p = { ...getVocabProgress(id) };
  if (!p.firstSeen) p.firstSeen = Date.now();
  p.lastSeen = Date.now();
  p.total++;
  if (correct) {
    p.correct++;
    p.level = Math.min(5, (p.level || 0) + 1);
  } else {
    p.level = Math.max(0, (p.level || 0) - 1);
  }
  state.vocabSeen[id] = p;
  persist();
}

export function isVocabThemeActive(theme) {
  return !!state.vocabActiveThemes[theme];
}

export function setVocabThemeActive(theme, on) {
  if (on) state.vocabActiveThemes[theme] = true;
  else delete state.vocabActiveThemes[theme];
  persist();
}

export function getActiveVocabThemes() {
  return Object.keys(state.vocabActiveThemes);
}

export function getTodayKey() { return todayKey(); }

export function getDailyIntroduced() {
  const k = todayKey();
  return (state.vocabDaily[k] && state.vocabDaily[k].introducedIds) || [];
}

export function recordDailyIntroduced(id) {
  const k = todayKey();
  const day = state.vocabDaily[k] || { introducedIds: [] };
  if (!day.introducedIds.includes(id)) {
    day.introducedIds.push(id);
    state.vocabDaily[k] = day;
    persist();
  }
}

export function getVocabStats() {
  const seenIds = Object.keys(state.vocabSeen);
  let learned = 0;
  for (const id of seenIds) {
    const p = state.vocabSeen[id];
    if ((p.level || 0) >= 3) learned++;
  }
  return {
    seen: seenIds.length,
    learned,
    todayIntroduced: getDailyIntroduced().length,
  };
}

export function resetVocabProgress() {
  state.vocabSeen = {};
  state.vocabDaily = {};
  persist();
}
