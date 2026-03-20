// withFave Content Script
(function() {
  'use strict';
  
  console.log('[withFave] Content script running...');
  
  if (document.getElementById('wf-widget')) {
    console.log('[withFave] Widget already exists');
    return;
  }
  
  console.log('[withFave] Creating widget...');
  
  const LABELS = ['CALM', 'NORMAL', 'EXCITED', 'STRESSED'];
  const CLASSES = ['', 'normal', 'excited', 'stressed'];
  const MEMBERS = ['jk', 'v', 'jm', 'jh', 'r', 's', 'j'];
  const MEMBER_NAMES = ['정국', '뷔', '지민', '제이홉', 'RM', '슈가', '진'];
  
  let emotion = 1, memberIdx = 0;
  let customs = {};
  let currentCustomKey = null;
  let uploadedImgs = [null, null, null, null];
  
  // 저장된 커스텀 캐릭터 불러오기
  chrome.storage.local.get(['customCharacters', 'selectedMember'], (data) => {
    customs = data.customCharacters || {};
    if (data.selectedMember && data.selectedMember.startsWith('c_')) {
      currentCustomKey = data.selectedMember;
    }
  });
  
  const widget = document.createElement('div');
  widget.id = 'wf-widget';
  widget.innerHTML = `
    <div id="wf-nav">
      <button id="wf-btn-settings" title="Settings">⚙️</button>
      <button id="wf-btn-info" title="Info">ℹ️</button>
    </div>
    <button id="wf-close">×</button>
    <img id="wf-img" src="${chrome.runtime.getURL('images/jk1.png')}" draggable="false">
    <span id="wf-label" class="normal">NORMAL</span>
    
    <div id="wf-panel-settings" class="wf-panel">
      <div id="wf-grid"></div>
      <button id="wf-add-btn">+ 캐릭터 추가</button>
    </div>
    
    <div id="wf-panel-info" class="wf-panel">
      <p>클릭: 감정 변경</p>
      <p>더블클릭: 멤버 변경</p>
      <p style="margin-top:8px;font-size:9px;opacity:0.7">Made with 💜 by ARMY</p>
      <a href="https://ko-fi.com/H2H61W7DT8" target="_blank" id="wf-kofi">☕ Ko-fi</a>
    </div>
    
    <div id="wf-modal" class="wf-modal">
      <div class="wf-modal-box">
        <input type="text" id="wf-char-name" placeholder="캐릭터 이름">
        <div id="wf-img-grid">
          <label data-i="0"><input type="file" accept="image/*" hidden>😌<img class="wf-pv"></label>
          <label data-i="1"><input type="file" accept="image/*" hidden>🙂<img class="wf-pv"></label>
          <label data-i="2"><input type="file" accept="image/*" hidden>😄<img class="wf-pv"></label>
          <label data-i="3"><input type="file" accept="image/*" hidden>😤<img class="wf-pv"></label>
        </div>
        <div class="wf-modal-btns">
          <button id="wf-modal-cancel">취소</button>
          <button id="wf-modal-save">추가</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(widget);
  console.log('[withFave] Widget added to page!');
  
  const img = document.getElementById('wf-img');
  const label = document.getElementById('wf-label');
  const grid = document.getElementById('wf-grid');
  const panelSettings = document.getElementById('wf-panel-settings');
  const panelInfo = document.getElementById('wf-panel-info');
  const modal = document.getElementById('wf-modal');
  
  // 그리드 렌더링
  function renderGrid() {
    grid.innerHTML = '';
    
    // 기본 멤버
    MEMBERS.forEach((m, i) => {
      const card = document.createElement('div');
      card.className = 'wf-card' + (!currentCustomKey && i === memberIdx ? ' sel' : '');
      card.innerHTML = `<img src="${chrome.runtime.getURL(`images/${m}1.png`)}">`;
      card.title = MEMBER_NAMES[i];
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        memberIdx = i;
        currentCustomKey = null;
        chrome.storage.local.set({ selectedMember: m });
        updateWidget();
        renderGrid();
      });
      grid.appendChild(card);
    });
    
    // 커스텀 캐릭터
    Object.keys(customs).forEach(key => {
      const c = customs[key];
      const card = document.createElement('div');
      card.className = 'wf-card' + (currentCustomKey === key ? ' sel' : '');
      card.innerHTML = `<button class="wf-del">×</button><img src="${c.images[1]}">`;
      card.title = c.name;
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('wf-del')) return;
        e.stopPropagation();
        currentCustomKey = key;
        chrome.storage.local.set({ selectedMember: key });
        updateWidget();
        renderGrid();
      });
      card.querySelector('.wf-del').addEventListener('click', (e) => {
        e.stopPropagation();
        delete customs[key];
        chrome.storage.local.set({ customCharacters: customs });
        if (currentCustomKey === key) {
          currentCustomKey = null;
          memberIdx = 0;
        }
        updateWidget();
        renderGrid();
      });
      grid.appendChild(card);
    });
  }
  
  // 패널 토글
  document.getElementById('wf-btn-settings').addEventListener('click', (e) => {
    e.stopPropagation();
    panelInfo.classList.remove('show');
    panelSettings.classList.toggle('show');
    if (panelSettings.classList.contains('show')) renderGrid();
  });
  
  document.getElementById('wf-btn-info').addEventListener('click', (e) => {
    e.stopPropagation();
    panelSettings.classList.remove('show');
    panelInfo.classList.toggle('show');
  });
  
  // 캐릭터 추가 모달
  document.getElementById('wf-add-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openModal();
  });
  
  document.getElementById('wf-modal-cancel').addEventListener('click', closeModal);
  document.getElementById('wf-modal-save').addEventListener('click', saveCustom);
  
  document.querySelectorAll('#wf-img-grid label').forEach((lbl, i) => {
    lbl.querySelector('input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 150;
        canvas.getContext('2d').drawImage(img, 0, 0, 150, 150);
        const data = canvas.toDataURL('image/jpeg', 0.7);
        uploadedImgs[i] = data;
        
        const pv = lbl.querySelector('.wf-pv');
        pv.src = data;
        pv.style.display = 'block';
        lbl.classList.add('has');
      };
      img.src = URL.createObjectURL(file);
    });
  });
  
  function openModal() {
    uploadedImgs = [null, null, null, null];
    document.getElementById('wf-char-name').value = '';
    document.querySelectorAll('#wf-img-grid label').forEach(l => {
      l.classList.remove('has');
      l.querySelector('.wf-pv').style.display = 'none';
    });
    modal.classList.add('show');
  }
  
  function closeModal() {
    modal.classList.remove('show');
  }
  
  function saveCustom() {
    const name = document.getElementById('wf-char-name').value.trim();
    if (!name) return alert('이름을 입력하세요');
    if (uploadedImgs.some(x => !x)) return alert('4개 이미지를 모두 업로드하세요');
    
    const key = 'c_' + Date.now();
    customs[key] = { name, images: [...uploadedImgs] };
    
    chrome.storage.local.set({ customCharacters: customs }, () => {
      currentCustomKey = key;
      chrome.storage.local.set({ selectedMember: key });
      closeModal();
      updateWidget();
      renderGrid();
    });
  }
  
  // 드래그
  let dragging = false, startX = 0, startY = 0;
  widget.addEventListener('mousedown', e => {
    if (e.target.closest('#wf-nav') || e.target.id === 'wf-close' || e.target.closest('.wf-panel') || e.target.closest('.wf-modal')) return;
    dragging = true;
    const rect = widget.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
  });
  
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    widget.classList.add('dragged');
    widget.style.left = (e.clientX - startX) + 'px';
    widget.style.top = (e.clientY - startY) + 'px';
  });
  
  document.addEventListener('mouseup', () => { dragging = false; });
  
  // 패널 외부 클릭시 닫기
  document.addEventListener('click', (e) => {
    if (!widget.contains(e.target)) {
      panelSettings.classList.remove('show');
      panelInfo.classList.remove('show');
    }
  });
  
  // 닫기
  document.getElementById('wf-close').addEventListener('click', () => {
    widget.style.display = 'none';
  });
  
  // 클릭 → 감정 변경
  img.addEventListener('click', () => {
    emotion = (emotion + 1) % 4;
    updateWidget();
  });
  
  // 더블클릭 → 멤버 변경
  img.addEventListener('dblclick', () => {
    if (currentCustomKey) {
      const keys = Object.keys(customs);
      const idx = keys.indexOf(currentCustomKey);
      if (idx === keys.length - 1) {
        currentCustomKey = null;
        memberIdx = 0;
      } else {
        currentCustomKey = keys[idx + 1];
      }
    } else {
      memberIdx = (memberIdx + 1) % MEMBERS.length;
      if (memberIdx === 0 && Object.keys(customs).length > 0) {
        currentCustomKey = Object.keys(customs)[0];
      }
    }
    updateWidget();
    if (panelSettings.classList.contains('show')) renderGrid();
  });
  
  function updateWidget() {
    if (currentCustomKey && customs[currentCustomKey]) {
      img.src = customs[currentCustomKey].images[emotion];
    } else {
      img.src = chrome.runtime.getURL(`images/${MEMBERS[memberIdx]}${emotion}.png`);
    }
    label.textContent = LABELS[emotion];
    label.className = CLASSES[emotion];
  }
})();
