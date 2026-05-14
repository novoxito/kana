import { activeIds, recordAttempt } from './store.js';
import { KANA_BY_ID, KANA } from './data.js';
import { emptyState } from './ui.js';

export function mount(container) {
  const ids = activeIds();
  if (ids.length < 4) return emptyState(container, 'Necesitas al menos 4 kana activos', 'Activa más en ajustes para usar opción múltiple.');

  let direction = 'kana_to_romaji'; // alternates
  let currentId = null;
  let options = [];
  let locked = false;

  next();

  function next() {
    locked = false;
    direction = Math.random() < 0.5 ? 'kana_to_romaji' : 'romaji_to_kana';
    currentId = ids[Math.floor(Math.random() * ids.length)];
    const target = KANA_BY_ID[currentId];

    // Distractors: prefer same group/script, then random
    const sameGroup = KANA.filter(k =>
      k.id !== target.id && k.script === target.script && k.group === target.group);
    const sameScript = KANA.filter(k =>
      k.id !== target.id && k.script === target.script && k.group !== target.group);
    const pool = [...shuffle(sameGroup), ...shuffle(sameScript)];
    const distractors = [];
    const seen = new Set([target.canonical]);
    for (const k of pool) {
      if (seen.has(k.canonical)) continue;
      seen.add(k.canonical);
      distractors.push(k);
      if (distractors.length === 3) break;
    }
    options = shuffle([target, ...distractors]);
    render();
  }

  function render() {
    const target = KANA_BY_ID[currentId];
    const promptHtml = direction === 'kana_to_romaji'
      ? `<div class="ch-direction">¿Qué romaji es?</div><div class="ch-kana">${target.char}</div>`
      : `<div class="ch-direction">¿Qué kana es?</div><div class="ch-romaji-prompt">${target.canonical}</div>`;

    const optsHtml = options.map((k, i) => {
      const label = direction === 'kana_to_romaji' ? k.canonical : k.char;
      return `<button class="ch-opt" data-i="${i}">${label}</button>`;
    }).join('');

    container.innerHTML = `
      <div class="ch-prompt">${promptHtml}</div>
      <div class="ch-options">${optsHtml}</div>
    `;

    container.querySelectorAll('.ch-opt').forEach(btn => {
      btn.onclick = () => {
        if (locked) return;
        locked = true;
        const i = parseInt(btn.dataset.i, 10);
        const picked = options[i];
        const correct = picked.id === target.id;
        recordAttempt(target.id, correct);
        container.querySelectorAll('.ch-opt').forEach((b, j) => {
          b.disabled = true;
          if (options[j].id === target.id) b.classList.add('correct');
          else if (j === i) b.classList.add('wrong');
        });
        setTimeout(next, correct ? 700 : 1400);
      };
    });
  }
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
