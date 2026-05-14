import { KANA, buildSettingsGrid } from './data.js';
import * as Store from './store.js';
import { mount as mountFlashcard } from './mode-flashcard.js';
import { mount as mountChoice } from './mode-choice.js';
import { mount as mountTyping } from './mode-typing.js';
import { mount as mountDrawing } from './mode-drawing.js';
import { toast } from './ui.js';

const views = {
  home: document.getElementById('view-home'),
  settings: document.getElementById('view-settings'),
  mode: document.getElementById('view-mode'),
};
const titleEl = document.getElementById('title');
const backBtn = document.getElementById('back-btn');
const settingsBtn = document.getElementById('settings-btn');

let currentView = 'home';
let currentScript = 'hiragana';

function show(view, title) {
  for (const v of Object.values(views)) v.classList.remove('active');
  views[view].classList.add('active');
  currentView = view;
  titleEl.textContent = title;
  backBtn.hidden = view === 'home';
  settingsBtn.style.visibility = view === 'mode' ? 'hidden' : 'visible';
  if (view === 'home') refreshHome();
}

function refreshHome() {
  const s = Store.getStats();
  document.getElementById('stat-active').textContent = s.active;
  document.getElementById('stat-due').textContent = s.due;
  document.getElementById('stat-learned').textContent = s.learned;

  const noActive = s.active === 0;
  document.querySelectorAll('.mode-card').forEach(b => {
    b.disabled = noActive;
  });
}

// --- Mode launching ---
document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    if (card.disabled) {
      toast('Activa kana en ajustes primero');
      return;
    }
    const mode = card.dataset.mode;
    const container = document.getElementById('mode-container');
    container.innerHTML = '';
    const titles = {
      flashcard: 'Flashcards',
      choice: 'Opción múltiple',
      typing: 'Escribir',
      drawing: 'Trazado',
    };
    show('mode', titles[mode]);
    const fns = { flashcard: mountFlashcard, choice: mountChoice, typing: mountTyping, drawing: mountDrawing };
    fns[mode](container);
  });
});

// --- Top bar ---
settingsBtn.addEventListener('click', () => {
  show('settings', 'Ajustes');
  renderSettings();
});

backBtn.addEventListener('click', () => {
  if (currentView === 'mode' || currentView === 'settings') show('home', 'Kana');
});

// --- Settings ---
function renderSettings() {
  const grid = document.getElementById('kana-grid');
  document.querySelectorAll('.tab').forEach(t => {
    t.classList.toggle('active', t.dataset.script === currentScript);
  });
  const groups = buildSettingsGrid(currentScript);
  grid.innerHTML = groups.map(g => {
    const allIds = g.cells.filter(Boolean).map(c => c.id);
    const allActive = allIds.length > 0 && allIds.every(id => Store.isActive(id));
    return `
      <div class="kana-row-group">
        <h3>
          <span>${g.label}</span>
          <button data-group="${g.key}" data-on="${allActive ? '0' : '1'}">${allActive ? 'Quitar fila' : 'Añadir fila'}</button>
        </h3>
        <div class="kana-row">
          ${g.cells.map(c => c
            ? `<div class="kana-cell ${Store.isActive(c.id) ? 'active' : ''}" data-id="${c.id}">
                 <div class="kc-char">${c.char}</div>
                 <div class="kc-romaji">${c.canonical}</div>
               </div>`
            : `<div class="kana-cell empty"></div>`).join('')}
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.kana-cell:not(.empty)').forEach(cell => {
    cell.onclick = () => {
      const id = cell.dataset.id;
      const willBeActive = !Store.isActive(id);
      Store.setActive(id, willBeActive);
      cell.classList.toggle('active', willBeActive);
      // Refresh row toggle button label
      const rowBtn = cell.closest('.kana-row-group').querySelector('h3 button');
      const ids = [...cell.closest('.kana-row').querySelectorAll('.kana-cell:not(.empty)')].map(c => c.dataset.id);
      const allActive = ids.every(i => Store.isActive(i));
      rowBtn.textContent = allActive ? 'Quitar fila' : 'Añadir fila';
      rowBtn.dataset.on = allActive ? '0' : '1';
    };
  });

  grid.querySelectorAll('h3 button').forEach(btn => {
    btn.onclick = () => {
      const groupKey = btn.dataset.group;
      const on = btn.dataset.on === '1';
      const ids = groups.find(g => g.key === groupKey).cells.filter(Boolean).map(c => c.id);
      Store.setActiveMany(ids, on);
      renderSettings();
    };
  });
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    currentScript = tab.dataset.script;
    renderSettings();
  });
});

document.getElementById('select-all').addEventListener('click', () => {
  const ids = KANA.filter(k => k.script === currentScript).map(k => k.id);
  Store.setActiveMany(ids, true);
  renderSettings();
});

document.getElementById('select-none').addEventListener('click', () => {
  const ids = KANA.filter(k => k.script === currentScript).map(k => k.id);
  Store.setActiveMany(ids, false);
  renderSettings();
});

document.getElementById('reset-progress').addEventListener('click', () => {
  if (confirm('¿Reiniciar todo el progreso de repasos? Los kana activos se mantienen.')) {
    Store.resetProgress();
    toast('Progreso reiniciado');
  }
});

// --- Init ---
show('home', 'Kana');

// --- Register SW ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
