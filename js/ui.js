export function emptyState(container, title, desc) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="big">📭</div>
      <h2>${title}</h2>
      <p>${desc}</p>
      <button id="goto-settings">Abrir ajustes</button>
    </div>
  `;
  const btn = container.querySelector('#goto-settings');
  if (btn) btn.onclick = () => {
    document.getElementById('settings-btn').click();
  };
}

let toastEl = null;
export function toast(msg, ms = 1500) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.add('shown');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toastEl.classList.remove('shown'), ms);
}
