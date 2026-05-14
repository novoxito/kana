// Pokédex reading mode: shows sprite + Japanese name. User reveals romaji/english.

import { activePokemonIds, recordPokemonAttempt } from './store.js';
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

  let currentId = null;
  let revealed = false;

  next();

  function next() {
    revealed = false;
    currentId = ids[Math.floor(Math.random() * ids.length)];
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
        <div class="pk-jp">${tokensHtml}</div>
        ${revealed ? `
          <div class="pk-romaji">${p.romaji || ''}</div>
          <div class="pk-en">${p.en}</div>
        ` : `
          <button class="pk-reveal" id="reveal">Mostrar lectura</button>
        `}
        <div class="pk-actions">
          <button class="pk-btn again" data-r="0">Fallé</button>
          <button class="pk-btn good" data-r="1">Bien</button>
        </div>
      </div>
    `;

    const reveal = container.querySelector('#reveal');
    if (reveal) reveal.onclick = () => { revealed = true; render(); };

    container.querySelectorAll('.pk-btn').forEach(btn => {
      btn.onclick = () => {
        if (!revealed) { revealed = true; render(); return; }
        const correct = btn.dataset.r === '1';
        recordPokemonAttempt(currentId, correct);
        next();
      };
    });
  }
}
