const EMOTIONS = ['CALM', 'NORMAL', 'EXCITED', 'STRESSED'];
const EMOTION_CLASS = ['', 'normal', 'excited', 'stressed'];
const MEMBERS = { j:'JIN', s:'SUGA', r:'RM', jh:'J-HOPE', jm:'JIMIN', v:'V', jk:'JUNGKOOK' };

let widget = null;
let member = 'jk';
let emotion = 0;
let customs = {};
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let uploadedImgs = [null, null, null, null];

async function init() {
  const data = await chrome.storage.local.get(['selectedMember', 'emotion', 'visible', 'position', 'customCharacters']);
  member = data.selectedMember || 'jk';
  emotion = data.emotion || 0;
  customs = data.customCharacters || {};
  
  createWidget();
  
  if (data.visible === false) {
    widget.classList.add('hidden');
  }
  
  if (data.position) {
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
    widget.style.left = data.position.x + 'px';
    widget.style.top = data.position.y + 'px';
  }
  
  updateWidget();
}

function createWidget() {
  widget = document.createElement('div');
  widget.id = 'withfave-widget';
  widget.style.right = '20px';
  widget.style.bottom = '20px';
  
  widget.innerHTML = `
    <div class="wf-container">
      <div class="wf-nav">
        <button class="wf-btn-settings" title="Settings">⚙️</button>
        <button class="wf-btn-info" title="Info">ℹ️</button>
      </div>
      <button class="wf-close" title="Hide">×</button>
      <img class="wf-char" src="${chrome.runtime.getURL('images/jk0.png')}" draggable="false">
      <span class="wf-emotion">CALM</span>
    </div>
    <div class="wf-panel wf-settings-panel">
      <div class="wf-grid"></div>
      <button class="wf-add-btn">+ Add</button>
    </div>
    <div class="wf-panel wf-info-panel">
      <div class="wf-info">
        <p>Tabs: <b id="wf-tabs">0</b></p>
        <p>😌≤5 🙂≤15 😄≤30 😤30+</p>
        <a href="https://ko-fi.com/H2H61W7DT8" target="_blank">☕ Support</a>
      </div>
    </div>
    <div class="wf-modal wf-hidden">
      <div class="wf-modal-box">
        <input type="text" class="wf-input" placeholder="Character name">
        <div class="wf-img-grid">
          <label data-i="0"><input type="file" accept="image/*" hidden>😌<img class="wf-pv"></label>
          <label data-i="1"><input type="file" accept="image/*" hidden>🙂<img class="wf-pv"></label>
          <label data-i="2"><input type="file" accept="image/*" hidden>😄<img class="wf-pv"></label>
          <label data-i="3"><input type="file" accept="image/*" hidden>😤<img class="wf-pv"></label>
        </div>
        <div class="wf-modal-btns">
          <button class="wf-modal-cancel">✕</button>
          <button class="wf-modal-save">✓</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(widget);
  
  setupDrag();
  setupEvents();
  renderGrid();
}

function setupDrag() {
  const container = widget.querySelector('.wf-container');
  
  container.addEventListener('mousedown', (e) => {
    if (e.target.tagName === 'BUTTON') return;
    isDragging = true;
    const rect = widget.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    widget.style.right = 'auto';
    widget.style.bottom = 'auto';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    widget.style.left = x + 'px';
    widget.style.top = y + 'px';
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      const rect = widget.getBoundingClientRect();
      chrome.storage.local.set({ position: { x: rect.left, y: rect.top } });
    }
  });
}

function setupEvents() {
  widget.querySelector('.wf-close').addEventListener('click', () => {
    widget.classList.add('hidden');
    chrome.storage.local.set({ visible: false });
  });
  
  widget.querySelector('.wf-char').addEventListener('click', () => {
    emotion = (emotion + 1) % 4;
    chrome.storage.local.set({ emotion });
    updateWidget();
  });
  
  widget.querySelector('.wf-btn-settings').addEventListener('click', (e) => {
    e.stopPropagation();
    togglePanel('settings');
  });
  
  widget.querySelector('.wf-btn-info').addEventListener('click', (e) => {
    e.stopPropagation();
    togglePanel('info');
  });
  
  widget.querySelector('.wf-add-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openModal();
  });
  
  widget.querySelector('.wf-modal-cancel').addEventListener('click', closeModal);
  widget.querySelector('.wf-modal-save').addEventListener('click', saveCustomChar);
  
  widget.querySelectorAll('.wf-img-grid label').forEach((label, i) => {
    const input = label.querySelector('input');
    input.addEventListener('change', (e) => handleImgUpload(e, i));
  });
  
  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) {
      closeAllPanels();
    }
  });
}

function openModal() {
  uploadedImgs = [null, null, null, null];
  widget.querySelector('.wf-input').value = '';
  widget.querySelectorAll('.wf-img-grid label').forEach(l => {
    l.classList.remove('has');
    l.querySelector('.wf-pv').style.display = 'none';
  });
  widget.querySelector('.wf-modal').classList.remove('wf-hidden');
}

function closeModal() {
  widget.querySelector('.wf-modal').classList.add('wf-hidden');
}

function handleImgUpload(e, i) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    uploadedImgs[i] = ev.target.result;
    const label = widget.querySelector(`.wf-img-grid label[data-i="${i}"]`);
    const pv = label.querySelector('.wf-pv');
    pv.src = ev.target.result;
    pv.style.display = 'block';
    label.classList.add('has');
  };
  reader.readAsDataURL(file);
}

function saveCustomChar() {
  const name = widget.querySelector('.wf-input').value.trim();
  if (!name) return alert('Enter name');
  if (uploadedImgs.some(x => !x)) return alert('Upload all 4 images');
  
  const key = 'c_' + Date.now();
  customs[key] = { name, images: uploadedImgs };
  chrome.storage.local.set({ customCharacters: customs });
  
  member = key;
  chrome.storage.local.set({ selectedMember: key });
  
  closeModal();
  renderGrid();
  updateWidget();
}

function togglePanel(type) {
  const panel = widget.querySelector(`.wf-${type}-panel`);
  const isOpen = panel.classList.contains('show');
  
  closeAllPanels();
  
  if (!isOpen) {
    panel.classList.add('show');
    if (type === 'info') updateTabCount();
  }
}

function closeAllPanels() {
  widget.querySelectorAll('.wf-panel').forEach(p => p.classList.remove('show'));
}

async function updateTabCount() {
  const tabs = await chrome.tabs.query({});
  const el = widget.querySelector('#wf-tabs');
  if (el) el.textContent = tabs.length;
}

function renderGrid() {
  const grid = widget.querySelector('.wf-grid');
  grid.innerHTML = '';
  
  Object.keys(MEMBERS).forEach(k => {
    const card = document.createElement('div');
    card.className = `wf-card${k === member ? ' sel' : ''}`;
    card.innerHTML = `<img src="${chrome.runtime.getURL(`images/${k}1.png`)}">`;
    card.addEventListener('click', () => selectMember(k));
    grid.appendChild(card);
  });
  
  Object.keys(customs).forEach(k => {
    const card = document.createElement('div');
    card.className = `wf-card${k === member ? ' sel' : ''}`;
    card.innerHTML = `<button class="wf-del">×</button><img src="${customs[k].images[1]}">`;
    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('wf-del')) selectMember(k);
    });
    card.querySelector('.wf-del').addEventListener('click', (e) => {
      e.stopPropagation();
      delete customs[k];
      chrome.storage.local.set({ customCharacters: customs });
      if (member === k) { member = 'jk'; chrome.storage.local.set({ selectedMember: 'jk' }); }
      renderGrid();
      updateWidget();
    });
    grid.appendChild(card);
  });
}

function selectMember(k) {
  member = k;
  chrome.storage.local.set({ selectedMember: k });
  renderGrid();
  updateWidget();
}

function updateWidget() {
  const img = widget.querySelector('.wf-char');
  if (customs[member]) {
    img.src = customs[member].images[emotion];
  } else {
    img.src = chrome.runtime.getURL(`images/${member}${emotion}.png`);
  }
  
  const label = widget.querySelector('.wf-emotion');
  label.textContent = EMOTIONS[emotion];
  label.className = 'wf-emotion ' + EMOTION_CLASS[emotion];
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'toggle') {
    widget.classList.toggle('hidden');
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.emotion) {
    emotion = changes.emotion.newValue;
    updateWidget();
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
