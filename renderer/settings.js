const DEFAULT_CHARACTERS = {
  default: {
    name: 'Default',
    isDefault: true,
    emotions: {
      calm: '😌',
      normal: '🙂',
      excited: '😄',
      stressed: '😤'
    }
  },
  cat: {
    name: 'army',
    isDefault: true,
    emotions: {
      calm: '😺',
      normal: '😸',
      excited: '😻',
      stressed: '🙀'
    }
  },
  JIN: {
    name: 'JIN',
    isDefault: true,
    emotions: {
      calm: '../assets/images/j0.png',
      normal: '../assets/images/j1.png',
      excited: '../assets/images/j2.png',
      stressed: '../assets/images/j3.png'
    }
  },
  SUGA: {
    name: 'SUGA',
    isDefault: true,
    emotions: {
      calm: '../assets/images/s0.png',
      normal: '../assets/images/s1.png',
      excited: '../assets/images/s2.png',
      stressed: '../assets/images/s3.png'
    }
  },
  RM: {
    name: 'RM',
    isDefault: true,
    emotions: {
      calm: '../assets/images/r0.png',
      normal: '../assets/images/r1.png',
      excited: '../assets/images/r2.png',
      stressed: '../assets/images/r3.png'
    }
  },
  JHOPE: {
    name: 'JHOPE',
    isDefault: true,
    emotions: {
      calm: '../assets/images/jh0.png',
      normal: '../assets/images/jh1.png',
      excited: '../assets/images/jh2.png',
      stressed: '../assets/images/jh3.png'
    }
  },
  JIMIN: {
    name: 'JIMIN',
    isDefault: true,
    emotions: {
      calm: '../assets/images/jm0.png',
      normal: '../assets/images/jm1.png',
      excited: '../assets/images/jm2.png',
      stressed: '../assets/images/jm3.png'
    }
  },
  V: {
    name: 'V',
    isDefault: true,
    emotions: {
      calm: '../assets/images/v0.png',
      normal: '../assets/images/v1.png',
      excited: '../assets/images/v2.png',
      stressed: '../assets/images/v3.png'
    }
  },
  JUNGKOOK: {
    name: 'JUNGKOOK',
    isDefault: true,
    emotions: {
      calm: '../assets/images/jk0.png',
      normal: '../assets/images/jk1.png',
      excited: '../assets/images/jk2.png',
      stressed: '../assets/images/jk3.png'
    }
  }
};

class SettingsApp {
  constructor() {
    this.elements = {
      characterGrid: document.getElementById('character-grid'),
      btnSave: document.getElementById('btn-save'),
      btnCancel: document.getElementById('btn-cancel'),
      btnAdd: document.getElementById('btn-add'),
      modal: document.getElementById('add-modal'),
      modalCancel: document.getElementById('modal-cancel'),
      modalSave: document.getElementById('modal-save'),
      charName: document.getElementById('char-name')
    };

    this.characters = {};
    this.selectedCharacter = 'default';
    this.originalCharacter = 'default';
    this.uploadedImages = { calm: null, normal: null, excited: null, stressed: null };
    
    this.init();
  }

  async init() {
    this.loadCharacters();
    await this.loadCurrentCharacter();
    this.renderCharacterCards();
    this.setupEventListeners();
  }

  loadCharacters() {
    this.characters = { ...DEFAULT_CHARACTERS };
    
    const customChars = localStorage.getItem('withfave-custom-characters');
    if (customChars) {
      try {
        const parsed = JSON.parse(customChars);
        this.characters = { ...this.characters, ...parsed };
      } catch (e) {
        console.error('Failed to parse custom characters:', e);
      }
    }
  }

  saveCustomCharacters() {
    const customChars = {};
    Object.entries(this.characters).forEach(([key, char]) => {
      if (!char.isDefault) {
        customChars[key] = char;
      }
    });
    localStorage.setItem('withfave-custom-characters', JSON.stringify(customChars));
  }

  async loadCurrentCharacter() {
    try {
      const savedCharacter = localStorage.getItem('withfave-character');
      if (savedCharacter && this.characters[savedCharacter]) {
        this.selectedCharacter = savedCharacter;
        this.originalCharacter = savedCharacter;
      }
      
      const serverCharacter = await window.withFave.getCharacter();
      if (serverCharacter && this.characters[serverCharacter]) {
        this.selectedCharacter = serverCharacter;
        this.originalCharacter = serverCharacter;
      }
    } catch (error) {
      console.error('Failed to load character:', error);
    }
  }

  renderCharacterCards() {
    this.elements.characterGrid.innerHTML = '';

    Object.entries(this.characters).forEach(([key, character]) => {
      const card = this.createCharacterCard(key, character);
      this.elements.characterGrid.appendChild(card);
    });
  }

  isImagePath(value) {
    if (!value || typeof value !== 'string') return false;
    return value.startsWith('data:image') || 
           value.endsWith('.png') || value.endsWith('.jpg') || 
           value.endsWith('.jpeg') || value.endsWith('.gif') || 
           value.endsWith('.webp');
  }

  renderEmotionValue(value, size = 'normal') {
    if (this.isImagePath(value)) {
      let sizeClass = 'emotion-img-small';
      if (size === 'large') sizeClass = 'emotion-img-large';
      return `<img src="${value}" class="${sizeClass}" alt="emotion" />`;
    }
    return value;
  }

  createCharacterCard(key, character) {
    const card = document.createElement('div');
    card.className = `character-card ${key === this.selectedCharacter ? 'selected' : ''}`;
    card.dataset.character = key;

    const emotions = character.emotions;
    const previewValue = emotions.normal || emotions.calm;
    const previewHtml = this.renderEmotionValue(previewValue, 'large');

    const deleteBtn = character.isDefault ? '' : `<button class="delete-btn" data-key="${key}">×</button>`;

    card.innerHTML = `
      ${deleteBtn}
      <div class="character-preview-wrapper">
        <div class="character-preview">${previewHtml}</div>
        <div class="status-badge-text">normal</div>
      </div>
      <div class="character-name">${character.name}</div>
    `;

    card.addEventListener('click', (e) => {
      if (!e.target.classList.contains('delete-btn')) {
        this.selectCharacter(key);
      }
    });

    const delBtn = card.querySelector('.delete-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteCharacter(key);
      });
    }

    return card;
  }

  deleteCharacter(key) {
    if (this.characters[key]?.isDefault) return;
    
    if (confirm(`Delete "${this.characters[key].name}"?`)) {
      delete this.characters[key];
      this.saveCustomCharacters();
      
      if (this.selectedCharacter === key) {
        this.selectedCharacter = 'default';
      }
      
      this.renderCharacterCards();
    }
  }

  selectCharacter(characterKey) {
    this.selectedCharacter = characterKey;

    document.querySelectorAll('.character-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.character === characterKey);
    });
  }

  setupEventListeners() {
    this.elements.btnSave.addEventListener('click', () => this.saveAndClose());
    this.elements.btnCancel.addEventListener('click', () => this.cancel());
    this.elements.btnAdd.addEventListener('click', () => this.openModal());
    
    this.elements.modalCancel.addEventListener('click', () => this.closeModal());
    this.elements.modalSave.addEventListener('click', () => this.registerCharacter());

    ['calm', 'normal', 'excited', 'stressed'].forEach(emotion => {
      const input = document.getElementById(`img-${emotion}`);
      input.addEventListener('change', (e) => this.handleImageUpload(e, emotion));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!this.elements.modal.classList.contains('hidden')) {
          this.closeModal();
        } else {
          this.cancel();
        }
      }
    });
  }

  openModal() {
    this.elements.modal.classList.remove('hidden');
    this.elements.charName.value = '';
    this.uploadedImages = { calm: null, normal: null, excited: null, stressed: null };
    
    document.querySelectorAll('.image-upload-item').forEach(item => {
      item.classList.remove('has-image');
      item.querySelector('.preview-img').src = '';
    });
  }

  closeModal() {
    this.elements.modal.classList.add('hidden');
  }

  handleImageUpload(e, emotion) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      this.uploadedImages[emotion] = base64;
      
      const item = document.querySelector(`.image-upload-item[data-emotion="${emotion}"]`);
      const preview = item.querySelector('.preview-img');
      preview.src = base64;
      item.classList.add('has-image');
    };
    reader.readAsDataURL(file);
  }

  registerCharacter() {
    const name = this.elements.charName.value.trim();
    
    if (!name) {
      alert('Please enter a character name.');
      return;
    }

    const { calm, normal, excited, stressed } = this.uploadedImages;
    if (!calm || !normal || !excited || !stressed) {
      alert('Please upload all 4 emotion images.');
      return;
    }

    const key = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    
    this.characters[key] = {
      name: name,
      isDefault: false,
      emotions: {
        calm: calm,
        normal: normal,
        excited: excited,
        stressed: stressed
      }
    };

    this.saveCustomCharacters();
    this.renderCharacterCards();
    this.closeModal();
    this.selectCharacter(key);
  }

  async saveAndClose() {
    try {
      localStorage.setItem('withfave-character', this.selectedCharacter);
      const result = await window.withFave.setCharacter(this.selectedCharacter);
      console.log('Character saved:', this.selectedCharacter, result);
      
      window.withFave.showMainWindow();
      
      setTimeout(() => {
        window.withFave.closeSettings();
      }, 100);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  }

  cancel() {
    window.withFave.closeSettings();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.settingsApp = new SettingsApp();
});
