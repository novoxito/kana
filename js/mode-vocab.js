// Vocab learning mode: daily session + free practice.
// Rotates three exercise types per item: flip, choice, build.
// Romaji is always visible as a reading crutch.

import { VOCAB, VOCAB_BY_ID, vocabInThemes, typeLabel } from './vocab.js';
import { tokenize } from './data.js';
import * as Store from './store.js';
import { emptyState } from './ui.js';

const DAILY_NEW_TARGET = 5;
const REVIEW_PER_SESSION = 8;
const PRACTICE_SIZE = 15;
const EXERCISES = ['flip', 'choice', 'build'];

export function mount(container, opts = {}) {
  const mode = opts.mode || 'daily'; // 'daily' | 'practice'
  const activeThemes = new Set(Store.getActiveVocabThemes());

  if (!activeThemes.size) {
    return emptyState(
      container,
      'Sin temas activos',
      'Abre ⚙ Ajustes → Vocabulario y activa al menos un tema.'
    );
  }

  const pool = vocabInThemes(activeThemes);
  if (!pool.length) {
    return emptyState(container, 'No hay palabras', 'Sin palabras en los temas activos.');
  }

  const queue = (mode === 'daily') ? buildDailyQueue(pool) : buildPracticeQueue(pool);

  if (!queue.length) {
    return emptyState(
      container,
      mode === 'daily' ? '¡Día completado!' : 'No hay palabras',
      mode === 'daily'
        ? 'Ya hiciste tu sesión de hoy. Vuelve mañana o usa Práctica libre.'
        : 'Activa más temas o ve a la sesión diaria para introducir palabras nuevas.'
    );
  }

  let index = 0;
  let lastType = null;
  let sessionStats = { correct: 0, total: 0 };

  showNext();

  function showNext() {
    if (index >= queue.length) return showSummary();
    const item = queue[index];
    // Pick a different exercise from the previous one (variety)
    const choices = EXERCISES.filter(t => t !== lastType);
    const exType = choices[Math.floor(Math.random() * choices.length)];
    lastType = exType;
    if (item.isNew) Store.recordDailyIntroduced(item.word.id);

    renderProgress();
    renderExercise(item.word, exType, (correct) => {
      sessionStats.total++;
      if (correct) sessionStats.correct++;
      Store.recordVocabAttempt(item.word.id, correct);
      index++;
      showNext();
    });
  }

  function renderProgress() {
    let bar = container.querySelector('.vc-progress');
    const pct = Math.round(index / queue.length * 100);
    if (!bar) {
      const wrap = document.createElement('div');
      wrap.className = 'vc-progress-wrap';
      wrap.innerHTML = `<div class="vc-progress"><div></div></div><small class="vc-progress-label"></small>`;
      container.parentNode.insertBefore(wrap, container);
    }
    const wrap = document.querySelector('.vc-progress-wrap');
    wrap.querySelector('.vc-progress > div').style.width = pct + '%';
    wrap.querySelector('.vc-progress-label').textContent = `${index} / ${queue.length}`;
  }

  function renderExercise(word, type, onResult) {
    if (type === 'flip') renderFlip(container, word, onResult);
    else if (type === 'choice') renderChoice(container, word, onResult);
    else renderBuild(container, word, onResult);
  }

  function showSummary() {
    const wrap = document.querySelector('.vc-progress-wrap');
    if (wrap) wrap.remove();
    const acc = sessionStats.total > 0 ? Math.round(sessionStats.correct / sessionStats.total * 100) : 0;
    container.innerHTML = `
      <div class="vc-summary">
        <div class="vc-summary-emoji">🎉</div>
        <h2>¡Sesión completada!</h2>
        <div class="vc-summary-stats">
          <div><span>${queue.length}</span><small>palabras</small></div>
          <div><span>${sessionStats.correct}</span><small>aciertos</small></div>
          <div><span>${acc}%</span><small>tasa</small></div>
        </div>
        <button id="back-home" class="vc-primary">Volver al inicio</button>
      </div>
    `;
    container.querySelector('#back-home').onclick = () => document.getElementById('back-btn').click();
  }
}

// === Queue building ===
function buildDailyQueue(pool) {
  const introducedToday = new Set(Store.getDailyIntroduced());

  // New words: never seen + not in pool of today's introduced
  const newWords = pool.filter(w => {
    const p = Store.getVocabProgress(w.id);
    return p.total === 0 && !introducedToday.has(w.id);
  });
  const slotsLeft = Math.max(0, DAILY_NEW_TARGET - introducedToday.size);
  const newToday = shuffle(newWords).slice(0, slotsLeft);

  // Review words: seen, level < 5, oldest first
  const reviewWords = pool.filter(w => {
    const p = Store.getVocabProgress(w.id);
    return p.total > 0 && p.level < 5;
  }).sort((a, b) => {
    return Store.getVocabProgress(a.id).lastSeen - Store.getVocabProgress(b.id).lastSeen;
  }).slice(0, REVIEW_PER_SESSION);

  const queue = [
    ...newToday.map(w => ({ word: w, isNew: true })),
    ...reviewWords.map(w => ({ word: w, isNew: false })),
  ];
  return shuffle(queue);
}

function buildPracticeQueue(pool) {
  const seen = pool.filter(w => Store.getVocabProgress(w.id).total > 0);
  const base = seen.length ? seen : pool;
  return shuffle(base).slice(0, PRACTICE_SIZE).map(w => ({ word: w, isNew: false }));
}

// === Exercise 1: Flip card ===
function renderFlip(container, word, onResult) {
  let flipped = false;
  render();

  function render() {
    container.innerHTML = `
      <div class="vc-stage">
        <div class="vc-flip-card ${flipped ? 'flipped' : ''}" id="card">
          <div class="vc-face vc-face-front">
            <div class="vc-type-tag">${typeLabel(word.type)}</div>
            <div class="vc-kana-big">${word.jp}</div>
            <div class="vc-romaji">${word.ro}</div>
            <div class="vc-hint-tap">toca para ver el significado</div>
          </div>
          <div class="vc-face vc-face-back">
            <div class="vc-type-tag">${typeLabel(word.type)}</div>
            <div class="vc-jp-small">${word.jp}</div>
            <div class="vc-romaji">${word.ro}</div>
            <div class="vc-meaning">${word.es}</div>
          </div>
        </div>
        <div class="vc-actions-2 ${flipped ? '' : 'hidden'}">
          <button class="vc-btn bad" data-r="0">No lo sabía</button>
          <button class="vc-btn good" data-r="1">Lo sabía</button>
        </div>
        <div class="vc-action-1 ${flipped ? 'hidden' : ''}">
          <button class="vc-btn neutral" data-flip="1">Ver significado</button>
        </div>
      </div>
    `;
    container.querySelector('#card').onclick = doFlip;
    const flipBtn = container.querySelector('[data-flip]');
    if (flipBtn) flipBtn.onclick = doFlip;
    container.querySelectorAll('[data-r]').forEach(b => {
      b.onclick = () => onResult(b.dataset.r === '1');
    });
  }

  function doFlip() {
    flipped = !flipped;
    render();
  }
}

// === Exercise 2: Multiple choice (JP → ES) ===
function renderChoice(container, word, onResult) {
  let locked = false;
  // Pick 3 distractors from same theme if possible, else from any
  const sameTheme = VOCAB.filter(w => w.id !== word.id && w.theme === word.theme);
  const others = VOCAB.filter(w => w.id !== word.id && w.theme !== word.theme);
  const seenEs = new Set([word.es]);
  const distractors = [];
  for (const pool of [shuffle(sameTheme), shuffle(others)]) {
    for (const w of pool) {
      if (seenEs.has(w.es)) continue;
      seenEs.add(w.es);
      distractors.push(w);
      if (distractors.length === 3) break;
    }
    if (distractors.length === 3) break;
  }
  const options = shuffle([word, ...distractors]);

  container.innerHTML = `
    <div class="vc-stage">
      <div class="vc-type-tag">${typeLabel(word.type)}</div>
      <div class="vc-prompt">
        <div class="vc-kana-big">${word.jp}</div>
        <div class="vc-romaji">${word.ro}</div>
      </div>
      <div class="vc-question">¿Qué significa?</div>
      <div class="vc-choice-grid">
        ${options.map((o, i) => `<button class="vc-choice" data-i="${i}">${o.es}</button>`).join('')}
      </div>
    </div>
  `;
  container.querySelectorAll('.vc-choice').forEach(btn => {
    btn.onclick = () => {
      if (locked) return; locked = true;
      const idx = parseInt(btn.dataset.i, 10);
      const picked = options[idx];
      const correct = picked.id === word.id;
      container.querySelectorAll('.vc-choice').forEach((b, j) => {
        b.disabled = true;
        if (options[j].id === word.id) b.classList.add('correct');
        else if (j === idx) b.classList.add('wrong');
      });
      setTimeout(() => onResult(correct), correct ? 700 : 1300);
    };
  });
}

// === Exercise 3: Build the JP from syllables (Duolingo-style) ===
function renderBuild(container, word, onResult) {
  const answerTokens = tokenize(word.jp);
  const distractors = buildDistractors(answerTokens, 4);
  const pool = shuffle([...answerTokens, ...distractors]).map((t, i) => ({
    rid: 'r' + i, char: t.char,
  }));

  let built = []; // array of rids
  let phase = 'building'; // 'building' | 'correct' | 'wrong'

  render();

  function render() {
    const usedRids = new Set(built);
    const slotsHtml = answerTokens.map((_, i) => {
      const rid = built[i];
      if (rid) {
        const tok = pool.find(t => t.rid === rid);
        const cls = phase === 'correct' ? 'vcb-slot filled correct'
                  : phase === 'wrong' ? 'vcb-slot filled wrong'
                  : 'vcb-slot filled';
        return `<button class="${cls}" data-action="unplace" data-idx="${i}">${tok.char}</button>`;
      }
      return `<div class="vcb-slot empty"></div>`;
    }).join('');

    const tokensHtml = pool.map(t => {
      const used = usedRids.has(t.rid);
      return `<button class="vcb-tok ${used ? 'used' : ''}" data-action="place" data-rid="${t.rid}" ${used ? 'disabled' : ''}>${t.char}</button>`;
    }).join('');

    const feedback = phase === 'correct' ? `<div class="vc-feedback ok">✓ ¡Correcto!</div>`
                   : phase === 'wrong' ? `<div class="vc-feedback bad">No es correcto</div>`
                   : ``;

    container.innerHTML = `
      <div class="vc-stage">
        <div class="vc-type-tag">${typeLabel(word.type)}</div>
        <div class="vc-question">Construye la palabra</div>
        <div class="vc-prompt">
          <div class="vc-meaning-big">${word.es}</div>
          <div class="vc-romaji">${word.ro}</div>
        </div>
        ${feedback}
        <div class="vcb-slots">${slotsHtml}</div>
        <div class="vcb-pool">${tokensHtml}</div>
      </div>
    `;

    container.querySelectorAll('[data-action]').forEach(el => {
      el.onclick = () => handleAction(el.dataset.action, el.dataset);
    });
  }

  function handleAction(action, data) {
    if (phase !== 'building') return;
    if (action === 'place') {
      if (built.length >= answerTokens.length) return;
      built.push(data.rid);
      if (built.length === answerTokens.length) return check();
      render();
    } else if (action === 'unplace') {
      const idx = parseInt(data.idx, 10);
      built.splice(idx, 1);
      render();
    }
  }

  function check() {
    const builtChars = built.map(rid => pool.find(t => t.rid === rid).char);
    const ok = builtChars.length === answerTokens.length
      && builtChars.every((c, i) => c === answerTokens[i].char);
    phase = ok ? 'correct' : 'wrong';
    render();
    setTimeout(() => onResult(ok), ok ? 900 : 1500);
  }
}

function buildDistractors(answerTokens, count) {
  // Use same script as answer (hiragana vs katakana inferred by first non-special token)
  const known = answerTokens.find(t => t.kana);
  const script = known ? known.kana.script : 'hiragana';
  const KANA_DATA = window.__KANA_FALLBACK__ || null;
  // We import KANA from data.js indirectly via tokenize, but need full list — fetch from import
  // Instead: hard fallback set of common kana for distractors
  const fallback = script === 'hiragana'
    ? ['あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ','た','ち','つ','て','と','な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ','ま','み','む','め','も','や','ゆ','よ','ら','り','る','れ','ろ','わ','ん']
    : ['ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ','サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト','ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ','マ','ミ','ム','メ','モ','ヤ','ユ','ヨ','ラ','リ','ル','レ','ロ'];
  const used = new Set(answerTokens.map(t => t.char));
  const candidates = fallback.filter(c => !used.has(c));
  const picked = shuffle(candidates).slice(0, count);
  return picked.map(c => ({ char: c, kana: null, special: null }));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
