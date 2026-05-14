// Pokédex mode: build the katakana name from shuffled syllables (Duolingo-style).

import { activePokemonIds, recordPokemonAttempt } from './store.js';
import { getById, fetchOne } from './pokemon.js';
import { tokenize } from './data.js';
import { KANA } from './data.js';
import { emptyState } from './ui.js';

const DISTRACTOR_COUNT = 5;

export function mount(container) {
  if (!activePokemonIds().length) {
    return emptyState(
      container,
      'No has activado Pokémon',
      'Abre la Pokédex en ajustes y activa los que quieras estudiar.'
    );
  }

  let deck = [];
  let currentId = null;
  let state = null; // { pokemon, answer, pool, built }
  let phase = 'building'; // 'building' | 'correct' | 'wrong' | 'revealed'

  next();

  function next() {
    const cur = activePokemonIds();
    if (!cur.length) return emptyState(container, 'No has activado Pokémon', '');
    if (deck.length === 0) {
      deck = shuffle(cur);
      if (deck.length > 1 && deck[deck.length - 1] === currentId) {
        [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
      }
    }
    currentId = deck.pop();
    setupExercise();
  }

  async function setupExercise() {
    let p = getById(currentId);
    if (!p) {
      container.innerHTML = `<div class="pk-loading">Cargando #${currentId}…</div>`;
      try { p = await fetchOne(currentId); }
      catch {
        container.innerHTML = `<div class="pk-loading">Error al cargar. <button id="retry">Reintentar</button></div>`;
        container.querySelector('#retry').onclick = setupExercise;
        return;
      }
    }

    const answerTokens = tokenize(p.jp || '');
    const distractors = generateDistractors(answerTokens, DISTRACTOR_COUNT);
    const pool = shuffle([...answerTokens, ...distractors]).map((t, i) => ({
      rid: 'r' + i,
      char: t.char,
    }));

    state = {
      pokemon: p,
      answer: answerTokens.map(t => t.char),
      pool,             // [{rid, char}]
      built: [],        // ordered list of rids
    };
    phase = 'building';
    render();
  }

  function render() {
    const p = state.pokemon;
    const slotsHtml = state.answer.map((_, i) => {
      const rid = state.built[i];
      if (rid) {
        const tok = state.pool.find(t => t.rid === rid);
        const cls = phase === 'correct' ? 'pkb-slot filled correct'
                  : phase === 'wrong' ? 'pkb-slot filled wrong'
                  : phase === 'revealed' ? 'pkb-slot filled correct'
                  : 'pkb-slot filled';
        return `<button class="${cls}" data-action="unplace" data-idx="${i}">${tok.char}</button>`;
      }
      return `<div class="pkb-slot empty"></div>`;
    }).join('');

    const usedRids = new Set(state.built);
    const tokensHtml = state.pool.map(t => {
      const used = usedRids.has(t.rid);
      return `<button class="pkb-tok ${used ? 'used' : ''}" data-action="place" data-rid="${t.rid}" ${used ? 'disabled' : ''}>${t.char}</button>`;
    }).join('');

    const feedback = phase === 'correct'
      ? `<div class="pkb-feedback ok">✓ ¡Correcto!</div>`
      : phase === 'wrong'
        ? `<div class="pkb-feedback bad">No es correcto. Inténtalo de nuevo.</div>`
        : phase === 'revealed'
          ? `<div class="pkb-feedback hint">${p.romaji || ''} · ${p.en}</div>`
          : `<div class="pkb-feedback hint">${p.en}</div>`;

    const actionsHtml = (phase === 'correct' || phase === 'revealed')
      ? `<button class="pkb-btn primary" data-action="next">Siguiente →</button>`
      : `<button class="pkb-btn secondary" data-action="reset">Reset</button>
         <button class="pkb-btn secondary" data-action="reveal">Mostrar</button>`;

    container.innerHTML = `
      <div class="pkb-stage">
        <div class="pkb-header">
          <div class="pk-num">#${String(p.id).padStart(3, '0')}</div>
          <img class="pkb-sprite" src="${p.sprite}" alt="" loading="lazy"/>
        </div>
        ${feedback}
        <div class="pkb-slots">${slotsHtml}</div>
        <div class="pkb-pool">${tokensHtml}</div>
        <div class="pkb-actions">${actionsHtml}</div>
      </div>
    `;

    container.querySelectorAll('[data-action]').forEach(el => {
      el.onclick = () => handleAction(el.dataset.action, el.dataset);
    });
  }

  function handleAction(action, data) {
    if (action === 'place') {
      if (phase !== 'building') return;
      // Find next empty slot
      const nextIdx = state.built.length;
      if (nextIdx >= state.answer.length) return;
      state.built.push(data.rid);
      // Check if all slots filled
      if (state.built.length === state.answer.length) {
        checkAnswer();
        return;
      }
      render();
    } else if (action === 'unplace') {
      if (phase !== 'building') return;
      const idx = parseInt(data.idx, 10);
      // Remove this slot and everything after (Duolingo behavior is to remove just one — let's keep just one)
      state.built.splice(idx, 1);
      render();
    } else if (action === 'reset') {
      if (phase !== 'building') return;
      state.built = [];
      render();
    } else if (action === 'reveal') {
      // Fill slots with correct answer
      revealAnswer();
    } else if (action === 'next') {
      next();
    }
  }

  function checkAnswer() {
    const builtChars = state.built.map(rid => state.pool.find(t => t.rid === rid).char);
    const correct = builtChars.length === state.answer.length
      && builtChars.every((c, i) => c === state.answer[i]);

    recordPokemonAttempt(currentId, correct);

    if (correct) {
      phase = 'correct';
      render();
    } else {
      phase = 'wrong';
      render();
      // Auto revert to building after 1.2s
      setTimeout(() => {
        state.built = [];
        phase = 'building';
        render();
      }, 1200);
    }
  }

  function revealAnswer() {
    // Find rids matching each answer char in order, ideally pulling from unused first
    const used = new Set(state.built);
    const newBuilt = [];
    for (const ch of state.answer) {
      // Find pool token matching this char that isn't yet placed
      const candidate = state.pool.find(t => t.char === ch && !newBuilt.includes(t.rid));
      if (candidate) newBuilt.push(candidate.rid);
      else newBuilt.push(null);
    }
    state.built = newBuilt.filter(Boolean);
    phase = 'revealed';
    render();
  }
}

function generateDistractors(answerTokens, count) {
  const answerChars = new Set(answerTokens.map(t => t.char));
  // Pool of candidates: all katakana from KANA database
  const candidates = KANA
    .filter(k => k.script === 'katakana')
    .filter(k => !answerChars.has(k.char));
  const shuffled = shuffle(candidates);
  return shuffled.slice(0, count).map(k => ({
    char: k.char,
    kana: k,
    special: null,
  }));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
