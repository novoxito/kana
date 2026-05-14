import { KANA, buildSettingsGrid, TIER_ORDER, TIERS } from './data.js';
import * as Store from './store.js';
import * as Pokemon from './pokemon.js';
import { mount as mountFlashcard } from './mode-flashcard.js';
import { mount as mountChoice } from './mode-choice.js';
import { mount as mountTyping } from './mode-typing.js';
import { mount as mountDrawing } from './mode-drawing.js';
import { mount as mountPokedex } from './mode-pokedex.js';
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
let currentTier = 'basic';
let currentSettingsSection = 'kana';

function show(view, title) {
  for (const v of Object.values(views)) v.classList.remove('active');
  views[view].classList.add('active');
  currentView = view;
  titleEl.textContent = title;
  backBtn.hidden = view === 'home';
  settingsBtn.style.visibility = view === 'mode' ? 'hidden' : 'visible';
  if (view === 'home') refreshHome();
  window.scrollTo(0, 0);
}

function refreshHome() {
  const s = Store.getStats();
  document.getElementById('stat-active').textContent = s.active;
  document.getElementById('stat-attempts').textContent = s.attempts;
  document.getElementById('stat-accuracy').textContent = s.accuracy + '%';

  document.querySelectorAll('.mode-card[data-mode]').forEach(b => {
    const mode = b.dataset.mode;
    if (mode === 'pokedex') {
      b.disabled = Store.activePokemonIds().length === 0;
    } else {
      b.disabled = s.active === 0;
    }
  });

  // Pokédex stats
  const pkStats = Store.getPokedexStats();
  document.getElementById('stat-pk-active').textContent = pkStats.active;
  const activeKanaSet = Store.activeIdSet();
  let readable = 0;
  for (let i = 1; i <= Pokemon.TOTAL; i++) {
    if (Pokemon.getById(i) && Pokemon.isReadable(i, activeKanaSet)) readable++;
  }
  document.getElementById('stat-pk-readable').textContent = readable;
}

// --- Mode launching ---
document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    if (card.disabled) {
      const mode = card.dataset.mode;
      toast(mode === 'pokedex' ? 'Activa Pokémon en ajustes' : 'Activa kana en ajustes');
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
      pokedex: 'Pokédex',
    };
    show('mode', titles[mode]);
    const fns = {
      flashcard: mountFlashcard,
      choice: mountChoice,
      typing: mountTyping,
      drawing: mountDrawing,
      pokedex: mountPokedex,
    };
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

// --- Settings navigation ---
document.querySelectorAll('.settings-tabs:not(.sub) .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    currentSettingsSection = tab.dataset.section;
    renderSettings();
  });
});

function renderSettings() {
  // Activate section tab
  document.querySelectorAll('.settings-tabs:not(.sub) .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.section === currentSettingsSection);
  });
  document.getElementById('settings-kana').classList.toggle('active', currentSettingsSection === 'kana');
  document.getElementById('settings-pokemon').classList.toggle('active', currentSettingsSection === 'pokemon');

  if (currentSettingsSection === 'kana') {
    renderKanaSettings();
  } else {
    renderPokemonSettings();
  }
}

// --- Kana settings ---
function renderKanaSettings() {
  // Activate script + tier tabs
  document.querySelectorAll('#settings-kana .settings-tabs.sub:not(.tier-tabs) .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.script === currentScript);
  });
  document.querySelectorAll('#settings-kana .tier-tabs .tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tier === currentTier);
  });

  const grid = document.getElementById('kana-grid');
  const groups = buildSettingsGrid(currentScript, currentTier);

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
      const target = groups.find(g => g.key === groupKey);
      const ids = target ? target.cells.filter(Boolean).map(c => c.id) : [];
      Store.setActiveMany(ids, on);
      renderKanaSettings();
    };
  });
}

// Tier tabs and script tabs
document.querySelectorAll('#settings-kana .settings-tabs.sub:not(.tier-tabs) .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    currentScript = tab.dataset.script;
    renderKanaSettings();
  });
});
document.querySelectorAll('#settings-kana .tier-tabs .tab').forEach(tab => {
  tab.addEventListener('click', () => {
    currentTier = tab.dataset.tier;
    renderKanaSettings();
  });
});

document.getElementById('select-all').addEventListener('click', () => {
  const ids = KANA.filter(k => k.script === currentScript && k.tier === currentTier).map(k => k.id);
  Store.setActiveMany(ids, true);
  renderKanaSettings();
});

document.getElementById('select-none').addEventListener('click', () => {
  const ids = KANA.filter(k => k.script === currentScript && k.tier === currentTier).map(k => k.id);
  Store.setActiveMany(ids, false);
  renderKanaSettings();
});

document.getElementById('reset-progress').addEventListener('click', () => {
  if (confirm('¿Reiniciar el progreso de repasos? Los kana activos se mantienen.')) {
    Store.resetProgress();
    toast('Progreso reiniciado');
  }
});

// --- Pokémon settings ---
async function renderPokemonSettings() {
  const grid = document.getElementById('pk-grid');
  const activeKana = Store.activeIdSet();

  if (!Pokemon.isCacheComplete()) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: span 3;">
        <div class="big">📡</div>
        <p>Necesitas cargar los datos de Pokémon una vez (con internet). Después funciona offline.</p>
      </div>
    `;
    return;
  }

  const all = Pokemon.getAll();
  grid.innerHTML = all.map(p => {
    const active = Store.isPokemonActive(p.id);
    const readable = Pokemon.isReadable(p.id, activeKana);
    return `
      <div class="pk-cell ${active ? 'active' : ''} ${readable ? '' : 'locked'}" data-id="${p.id}">
        <span class="pk-num-mini">#${String(p.id).padStart(3, '0')}</span>
        <img src="${p.sprite}" alt="" loading="lazy"/>
        <div class="pk-jp-mini">${p.jp}</div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.pk-cell').forEach(cell => {
    cell.onclick = () => {
      const id = parseInt(cell.dataset.id, 10);
      const willBe = !Store.isPokemonActive(id);
      Store.setPokemonActive(id, willBe);
      cell.classList.toggle('active', willBe);
    };
  });
}

document.getElementById('pk-fetch').addEventListener('click', async () => {
  const bar = document.getElementById('pk-progress');
  const fill = document.getElementById('pk-progress-bar');
  const label = document.getElementById('pk-progress-label');
  bar.hidden = false;
  try {
    await Pokemon.fetchAll((done, total) => {
      fill.style.width = (done / total * 100) + '%';
      label.textContent = `Cargando ${done} / ${total}…`;
    });
    label.textContent = 'Listo';
    setTimeout(() => { bar.hidden = true; }, 800);
    renderPokemonSettings();
    toast('Pokédex cargada');
  } catch (e) {
    label.textContent = 'Error al cargar. Verifica tu conexión.';
  }
});

document.getElementById('pk-active-readable').addEventListener('click', () => {
  if (!Pokemon.isCacheComplete()) { toast('Carga la Pokédex primero'); return; }
  const activeKana = Store.activeIdSet();
  const ids = [];
  for (let i = 1; i <= Pokemon.TOTAL; i++) {
    if (Pokemon.isReadable(i, activeKana)) ids.push(i);
  }
  Store.setPokemonActiveMany(ids, true);
  renderPokemonSettings();
  toast(`${ids.length} Pokémon activados`);
});

document.getElementById('pk-active-all').addEventListener('click', () => {
  if (!Pokemon.isCacheComplete()) { toast('Carga la Pokédex primero'); return; }
  const ids = Array.from({ length: Pokemon.TOTAL }, (_, i) => i + 1);
  Store.setPokemonActiveMany(ids, true);
  renderPokemonSettings();
});

document.getElementById('pk-active-none').addEventListener('click', () => {
  const ids = Array.from({ length: Pokemon.TOTAL }, (_, i) => i + 1);
  Store.setPokemonActiveMany(ids, false);
  renderPokemonSettings();
});

document.getElementById('pk-reset').addEventListener('click', () => {
  if (confirm('¿Reiniciar el progreso de la Pokédex?')) {
    Store.resetPokemonProgress();
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
