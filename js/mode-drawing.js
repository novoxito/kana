import { activeIds } from './store.js';
import { KANA_BY_ID } from './data.js';
import { emptyState } from './ui.js';

export function mount(container) {
  const ids = activeIds();
  if (!ids.length) return emptyState(container, 'No has activado ningún kana', 'Selecciona kana en ajustes.');

  let currentId = null;
  let showGhost = true;
  let revealed = false;

  next();

  function next() {
    revealed = false;
    currentId = ids[Math.floor(Math.random() * ids.length)];
    render();
  }

  function render() {
    const k = KANA_BY_ID[currentId];
    container.innerHTML = `
      <div class="dr-stage">
        <div class="dr-canvas-wrap">
          <div class="dr-ghost ${showGhost ? '' : 'hidden'}">${k.char}</div>
          <canvas class="dr-canvas" id="dr-c"></canvas>
        </div>
        <div class="dr-meta">
          Romaji: <b>${revealed ? k.canonical : '???'}</b>
        </div>
        <div class="dr-controls">
          <button id="dr-clear">Borrar</button>
          <button id="dr-ghost">${showGhost ? 'Ocultar guía' : 'Mostrar guía'}</button>
          <button id="dr-reveal">${revealed ? 'Ocultar' : 'Ver'}</button>
          <button id="dr-next" class="primary">Siguiente</button>
        </div>
      </div>
    `;

    const canvas = container.querySelector('#dr-c');
    setupCanvas(canvas);

    container.querySelector('#dr-clear').onclick = () => setupCanvas(canvas);
    container.querySelector('#dr-ghost').onclick = () => { showGhost = !showGhost; render(); };
    container.querySelector('#dr-reveal').onclick = () => { revealed = !revealed; render(); };
    container.querySelector('#dr-next').onclick = next;
  }
}

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#fff';

  let drawing = false;
  let last = null;

  const getPoint = (e) => {
    const r = canvas.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };

  const start = (e) => {
    e.preventDefault();
    drawing = true;
    last = getPoint(e);
    ctx.beginPath();
    ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  };
  const move = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const p = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last = p;
  };
  const end = () => { drawing = false; last = null; };

  canvas.addEventListener('pointerdown', start);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('pointerleave', end);
}
