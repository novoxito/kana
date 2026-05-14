// Pokédex reading mode: shows sprite + Japanese name. Tap to reveal lectura, Siguiente to advance.

import { activePokemonIds } from './store.js';
import { getById, fetchOne } from './pokemon.js';
import { tokenize } from './data.js';
import { emptyState } from './ui.js';

export function mount(container) {
  const ids = activePokemonIds();
  if (!ids.length) {
    return emptyState(
      container,
      'No has activado Pokémon',
      'Abre la Pokédex en ajustes y activa los que quieras estudiar.'
    );
  }

  let deck = [];
  let currentId = null;
  let revealed = false;

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
    revealed = false;
    render();
  }

  async function render() {
    let p = getById(currentId);
    if (!p) {
      container.innerHTML = `<div class="pk-loading">Cargando #${currentId}…</div>`;
      try {
        p = await fetchOne(currentId);
      } catch {
        container.innerHTML = `<div class="pk-loading">Error al cargar. <button id="retry">Reintentar</button></div>`;
        container.querySelector('#retry').onclick = render;
        return;
      }
    }

    const tokens = tokenize(p.jp || '');
    const tokensHtml = tokens.map(t => {
      const cls = t.special ? 'pk-tok pk-tok-special' : 'pk-tok';
      return `<span class="${cls}">${t.char}</span>`;
    }).join('');

    container.innerHTML = `
      <div class="pk-card">
        <div class="pk-num">#${String(p.id).padStart(3, '0')}</div>
        <img class="pk-sprite" src="${p.sprite}" alt="" loading="lazy"/>
        <div class="pk-tap-area" id="tap">
          <div class="pk-jp">${tokensHtml}</div>
          <div class="pk-answer-line">
            ${revealed
              ? `<span class="pk-romaji">${p.romaji || ''}</span><span class="pk-en">${p.en}</span>`
              : `<span class="fc-hint">Toca para ver lectura</span>`}
          </div>
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
