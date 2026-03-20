const EMOTIONS = ['CALM', 'NORMAL', 'EXCITED', 'STRESSED'];
const EMOTION_CLASS = ['', 'normal', 'excited', 'stressed'];
const MEMBERS = { j:'JIN', s:'SUGA', r:'RM', jh:'J-HOPE', jm:'JIMIN', v:'V', jk:'JUNGKOOK' };

let member = 'jk', emotion = 0, customs = {};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const d = await chrome.storage.local.get(['selectedMember','emotion','customCharacters']);
  member = d.selectedMember || 'jk';
  emotion = d.emotion || 0;
  customs = d.customCharacters || {};
  
  setupNav();
  setupMain();
  setupSettings();
  update();
}

function setupNav() {
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      document.getElementById(`tab-${b.dataset.tab}`).classList.add('active');
      if (b.dataset.tab === 'settings') renderGrid();
    });
  });
}

function setupMain() {
  const wrap = document.getElementById('charWrap');
  const img = document.getElementById('charImg');
  
  img.addEventListener('click', () => {
    emotion = (emotion + 1) % 4;
    chrome.storage.local.set({ emotion });
    update();
  });
}

function setupSettings() {
  document.getElementById('btnAdd').addEventListener('click', openModal);
  document.getElementById('mCancel').addEventListener('click', closeModal);
  document.getElementById('mSave').addEventListener('click', saveChar);
  [0,1,2,3].forEach(i => {
    document.getElementById(`img-${i}`).addEventListener('change', e => uploadImg(e, i));
  });
}

async function update() {
  const tabs = await chrome.tabs.query({});
  const tc = tabs.length;
  document.getElementById('tabCount').textContent = tc;
  
  const h = new Date().getHours();
  let e = tc <= 5 ? 0 : tc <= 15 ? 1 : tc <= 30 ? 2 : 3;
  if (h >= 22 || h < 6) e = Math.max(0, e - 1);
  else if (h >= 9 && h < 11) e = Math.min(3, e + 1);
  emotion = e;
  chrome.storage.local.set({ emotion });
  
  const img = document.getElementById('charImg');
  img.src = customs[member] ? customs[member].images[emotion] : `images/${member}${emotion}.png`;
  
  const label = document.getElementById('emotionLabel');
  label.textContent = EMOTIONS[emotion];
  label.className = 'emotion-label ' + EMOTION_CLASS[emotion];
}

function renderGrid() {
  const g = document.getElementById('charGrid');
  g.innerHTML = '';
  
  Object.keys(MEMBERS).forEach(k => {
    g.appendChild(makeCard(k, `images/${k}1.png`, false));
  });
  Object.keys(customs).forEach(k => {
    g.appendChild(makeCard(k, customs[k].images[1], true));
  });
}

function makeCard(k, src, custom) {
  const d = document.createElement('div');
  d.className = `card${k === member ? ' sel' : ''}`;
  d.innerHTML = `${custom ? '<button class="del">×</button>' : ''}<img src="${src}">`;
  d.addEventListener('click', e => {
    if (!e.target.classList.contains('del')) {
      member = k;
      chrome.storage.local.set({ selectedMember: k });
      renderGrid();
      update();
    }
  });
  if (custom) {
    d.querySelector('.del').addEventListener('click', e => {
      e.stopPropagation();
      delete customs[k];
      chrome.storage.local.set({ customCharacters: customs });
      if (member === k) { member = 'jk'; chrome.storage.local.set({ selectedMember: 'jk' }); }
      renderGrid();
      update();
    });
  }
  return d;
}

let imgs = [null, null, null, null];

function openModal() {
  document.getElementById('modal').classList.remove('hidden');
  document.getElementById('charName').value = '';
  imgs = [null, null, null, null];
  document.querySelectorAll('.img-grid label').forEach(x => {
    x.classList.remove('has');
    x.querySelector('.pv').style.display = 'none';
  });
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function uploadImg(e, i) {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    imgs[i] = ev.target.result;
    const lbl = document.querySelector(`.img-grid label[data-i="${i}"]`);
    const pv = lbl.querySelector('.pv');
    pv.src = ev.target.result;
    pv.style.display = 'block';
    lbl.classList.add('has');
  };
  r.readAsDataURL(f);
}

function saveChar() {
  const name = document.getElementById('charName').value.trim();
  if (!name) return alert('Enter name');
  if (imgs.some(x => !x)) return alert('Upload all 4 images');
  
  const k = 'c_' + Date.now();
  customs[k] = { name, images: imgs };
  chrome.storage.local.set({ customCharacters: customs });
  
  member = k;
  chrome.storage.local.set({ selectedMember: k });
  
  closeModal();
  renderGrid();
  update();
}
