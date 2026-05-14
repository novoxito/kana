import { activeIds } from './store.js';
import { KANA_BY_ID } from './data.js';
import { emptyState } from './ui.js';

export function mount(container) {
  if (!activeIds().length) {
    return emptyState(container, 'No has activado ningún kana', 'Selecciona kana en ajustes para empezar.');
  }

  let deck = [];
  let currentId = null;
  let flipped = false;
  let enterFrom = null; // 'left' | 'right' | null

  next();

  function next(swipeDir) {
    const cur = activeIds();
    if (!cur.length) return emptyState(container, 'No has activado ningún kana', '');
    if (deck.length === 0) {
      deck = shuffle(cur);
      if (deck.length > 1 && deck[deck.length - 1] === currentId) {
        [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
      }
    }
    currentId = deck.pop();
    flipped = false;
    // If swiped right, new card enters from left; vice versa
    enterFrom = swipeDir === 'right' ? 'left' : swipeDir === 'left' ? 'right' : null;
    render();
  }

  function render() {
    const k = KANA_BY_ID[currentId];
    const enterClass = enterFrom ? `enter-from-${enterFrom}` : '';
    container.innerHTML = `
      <div class="fc-stage">
        <div class="fc-card-wrap ${enterClass}" id="cardwrap">
          <div class="fc-flip-inner ${flipped ? 'flipped' : ''}" id="flip">
            <div class="fc-face fc-face-front">
              <div class="fc-kana-card">${k.char}</div>
              <div class="fc-face-hint">toca para girar</div>
            </div>
            <div class="fc-face fc-face-back">
              <div class="fc-romaji-card">${k.canonical}</div>
              <div class="fc-kana-small">${k.char}</div>
              <div class="fc-face-hint">desliza →</div>
            </div>
          </div>
        </div>
      </div>
    `;
    setupGestures(container.querySelector('#cardwrap'));
  }

  function setupGestures(wrap) {
    let pointerId = null;
    let startX = 0, startY = 0;
    let dx = 0, dy = 0;
    let dragging = false;
    let moved = false;
    let downTime = 0;
    let animating = false;

    const onDown = (e) => {
      if (animating) return;
      // Clear any enter animation so it doesn't fight with the drag
      wrap.classList.remove('enter-from-left', 'enter-from-right');
      pointerId = e.pointerId;
      startX = e.clientX; startY = e.clientY;
      dx = 0; dy = 0;
      dragging = true; moved = false;
      downTime = Date.now();
      try { wrap.setPointerCapture(pointerId); } catch {}
      wrap.style.transition = 'none';
    };

    const onMove = (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dx = e.clientX - startX;
      dy = e.clientY - startY;
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) moved = true;
      wrap.style.transform = `translateX(${dx}px) rotate(${dx * 0.05}deg)`;
      wrap.style.opacity = String(Math.max(0.35, 1 - Math.abs(dx) / 500));
    };

    const onUp = (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      dragging = false;
      try { wrap.releasePointerCapture(pointerId); } catch {}

      const elapsed = Date.now() - downTime;

      // Tap (no significant movement, short duration) → flip
      if (!moved && elapsed < 400) {
        wrap.style.transition = '';
        wrap.style.transform = '';
        wrap.style.opacity = '';
        flipped = !flipped;
        const flip = wrap.querySelector('.fc-flip-inner');
        if (flip) flip.classList.toggle('flipped', flipped);
        return;
      }

      const threshold = 90;
      wrap.style.transition = 'transform 0.32s ease-out, opacity 0.32s ease-out';

      if (dx > threshold) {
        animating = true;
        const w = window.innerWidth;
        wrap.style.transform = `translateX(${w + 80}px) rotate(20deg)`;
        wrap.style.opacity = '0';
        setTimeout(() => { animating = false; next('right'); }, 280);
      } else if (dx < -threshold) {
        animating = true;
        const w = window.innerWidth;
        wrap.style.transform = `translateX(${-(w + 80)}px) rotate(-20deg)`;
        wrap.style.opacity = '0';
        setTimeout(() => { animating = false; next('left'); }, 280);
      } else {
        // Snap back
        wrap.style.transform = 'translateX(0) rotate(0deg)';
        wrap.style.opacity = '1';
      }
    };

    wrap.addEventListener('pointerdown', onDown);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerup', onUp);
    wrap.addEventListener('pointercancel', onUp);
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
