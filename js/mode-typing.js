import { activeIds, recordAttempt } from './store.js';
import { KANA_BY_ID } from './data.js';
import { emptyState } from './ui.js';

export function mount(container) {
  const ids = activeIds();
  if (!ids.length) return emptyState(container, 'No has activado ningún kana', 'Selecciona kana en ajustes.');

  let currentId = null;
  let answered = false;

  next();

  function next() {
    answered = false;
    currentId = ids[Math.floor(Math.random() * ids.length)];
    const k = KANA_BY_ID[currentId];
    container.innerHTML = `
      <div class="tp-prompt">
        <div class="tp-kana">${k.char}</div>
      </div>
      <div class="tp-input-wrap">
        <input type="text" class="tp-input" id="tp-in"
          autocomplete="off" autocapitalize="none" autocorrect="off"
          spellcheck="false" inputmode="text" placeholder="romaji"/>
      </div>
      <div class="tp-feedback" id="tp-fb"></div>
    `;
    const input = container.querySelector('#tp-in');
    const fb = container.querySelector('#tp-fb');
    setTimeout(() => input.focus(), 50);

    input.addEventListener('input', () => {
      if (answered) return;
      const val = input.value.trim().toLowerCase();
      if (!val) { input.className = 'tp-input'; return; }
      if (k.romaji.includes(val)) {
        answered = true;
        input.classList.add('correct');
        recordAttempt(k.id, true);
        fb.textContent = '✓';
        fb.classList.add('shown');
        setTimeout(next, 500);
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !answered) {
        const val = input.value.trim().toLowerCase();
        if (!val) return;
        if (!k.romaji.includes(val)) {
          answered = true;
          input.classList.add('wrong');
          recordAttempt(k.id, false);
          fb.textContent = k.canonical;
          fb.classList.add('shown');
          setTimeout(next, 1400);
        }
      }
    });
  }
}
