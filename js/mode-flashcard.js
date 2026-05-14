import { activeIds } from './store.js';
import { KANA_BY_ID } from './data.js';
import { emptyState } from './ui.js';

export function mount(container) {
  const ids = activeIds();
  if (!ids.length) return emptyState(container, 'No has activado ningún kana', 'Selecciona kana en ajustes para empezar.');

  let deck = [];
  let currentId = null;
  let revealed = false;

  next();

  function next() {
    const currentIds = activeIds();
    if (!currentIds.length) return emptyState(container, 'No has activado ningún kana', '');
    // Refresh deck if empty or stale
    if (deck.length === 0) {
      deck = shuffle(currentIds);
      // Avoid immediate repeat of last shown
      if (deck.length > 1 && deck[deck.length - 1] === currentId) {
        [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
      }
    }
    currentId = deck.pop();
    revealed = false;
    render();
  }

  function render() {
    const k = KANA_BY_ID[currentId];
    container.innerHTML = `
      <div class="fc-card">
        <div class="fc-tap-area" id="tap">
          <div class="fc-kana-big">${k.char}</div>
          <div class="fc-answer-line">${revealed ? k.canonical : '<span class="fc-hint">Toca para ver lectura</span>'}</div>
        </div>
        <button class="fc-next" id="next">Siguiente →</button>
      </div>
    `;
    container.querySelector('#tap').onclick = () => { revealed = !revealed; render(); };
    container.querySelector('#next').onclick = next;
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
