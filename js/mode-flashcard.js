import { activeIds } from './store.js';
import { KANA_BY_ID } from './data.js';
import { review, nextCard } from './srs.js';
import { emptyState, toast } from './ui.js';

export function mount(container) {
  const ids = activeIds();
  if (!ids.length) return emptyState(container, 'No has activado ningún kana', 'Selecciona kana en ajustes para empezar.');

  let currentId = nextCard(ids);
  let revealed = false;

  render();

  function render() {
    if (!currentId) return emptyState(container, '¡Hecho!', 'Vuelve más tarde para los próximos repasos.');
    const k = KANA_BY_ID[currentId];
    container.innerHTML = `
      <div class="fc-card">
        <div class="fc-kana">${k.char}</div>
        ${revealed
          ? `<div class="fc-answer">${k.canonical}</div>`
          : `<button class="fc-reveal" id="reveal">Mostrar lectura</button>
             <div class="fc-answer"></div>`}
        <div class="fc-actions">
          <button class="fc-btn again" data-q="0">Fallé<small>~10min</small></button>
          <button class="fc-btn hard" data-q="3">Difícil<small>1d</small></button>
          <button class="fc-btn good" data-q="4">Bien<small>3d+</small></button>
          <button class="fc-btn easy" data-q="5">Fácil<small>+más</small></button>
        </div>
      </div>
    `;
    const reveal = container.querySelector('#reveal');
    if (reveal) reveal.onclick = () => { revealed = true; render(); };
    container.querySelectorAll('.fc-btn').forEach(btn => {
      btn.onclick = () => {
        const q = parseInt(btn.dataset.q, 10);
        if (!revealed && q >= 3) {
          // Force reveal before grading correct
          revealed = true;
          render();
          return;
        }
        review(currentId, q);
        revealed = false;
        currentId = nextCard(activeIds());
        render();
      };
    });
  }
}
