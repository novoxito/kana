// Pokémon data is fetched at runtime from PokeAPI (public API).
// Nothing is hardcoded here — only IDs (1..151) and the API URLs.

import { requiredKanaIds } from './data.js';

const TOTAL = 151;
const SPECIES_URL = (id) => `https://pokeapi.co/api/v2/pokemon-species/${id}`;
const SPRITE_URL = (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

const CACHE_KEY = 'kana_pwa_pokemon_v1';

let cache = null;

function loadCache() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function saveCache() {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch {}
}

export function getSpriteUrl(id) { return SPRITE_URL(id); }

export async function fetchOne(id) {
  const c = loadCache();
  if (c[id]) return c[id];
  const resp = await fetch(SPECIES_URL(id));
  if (!resp.ok) throw new Error('fetch failed for #' + id);
  const data = await resp.json();
  const findName = (lang) => (data.names.find(n => n.language.name === lang) || {}).name || '';
  const entry = {
    id,
    jp: findName('ja-Hrkt'),
    en: findName('en'),
    romaji: findName('roomaji'),
    sprite: SPRITE_URL(id),
  };
  c[id] = entry;
  saveCache();
  return entry;
}

export async function fetchAll(progressCb) {
  const c = loadCache();
  const missing = [];
  for (let i = 1; i <= TOTAL; i++) if (!c[i]) missing.push(i);

  let done = TOTAL - missing.length;
  progressCb?.(done, TOTAL);

  const BATCH = 8;
  for (let i = 0; i < missing.length; i += BATCH) {
    const batch = missing.slice(i, i + BATCH);
    await Promise.all(batch.map(id =>
      fetchOne(id).catch(() => null)
    ));
    done += batch.length;
    progressCb?.(Math.min(done, TOTAL), TOTAL);
  }
  return getAll();
}

export function getAll() {
  const c = loadCache();
  const out = [];
  for (let i = 1; i <= TOTAL; i++) if (c[i]) out.push(c[i]);
  return out;
}

export function getById(id) {
  return loadCache()[id] || null;
}

export function isCacheComplete() {
  const c = loadCache();
  for (let i = 1; i <= TOTAL; i++) if (!c[i]) return false;
  return true;
}

// Compute which kana IDs are needed to fully read a Pokémon's Japanese name.
export function neededKana(pokemonId) {
  const p = getById(pokemonId);
  if (!p || !p.jp) return new Set();
  return requiredKanaIds(p.jp);
}

// Check if a Pokémon is fully readable with given activated kana set.
export function isReadable(pokemonId, activeKanaSet) {
  const needed = neededKana(pokemonId);
  for (const id of needed) if (!activeKanaSet.has(id)) return false;
  return true;
}

export { TOTAL };
