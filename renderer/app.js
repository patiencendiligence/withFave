const DEFAULT_CHARACTERS = {
  default: {
    name: 'Default',
    emotions: {
      calm: '😌',
      normal: '🙂',
      excited: '😄',
      stressed: '😤'
    }
  },
  cat: {
    name: 'Cat',
    emotions: {
      calm: '😺',
      normal: '😸',
      excited: '😻',
      stressed: '🙀'
    }
  },
  JIN: {
    name: 'JIN',
    emotions: {
      calm: '../assets/images/j0.png',
      normal: '../assets/images/j1.png',
      excited: '../assets/images/j2.png',
      stressed: '../assets/images/j3.png'
    }
  },
  SUGA: {
    name: 'SUGA',
    emotions: {
      calm: '../assets/images/s0.png',
      normal: '../assets/images/s1.png',
      excited: '../assets/images/s2.png',
      stressed: '../assets/images/s3.png'
    }
  },
  RM: {
    name: 'RM',
    emotions: {
      calm: '../assets/images/r0.png',
      normal: '../assets/images/r1.png',
      excited: '../assets/images/r2.png',
      stressed: '../assets/images/r3.png'
    }
  },
  JHOPE: {
    name: 'JHOPE',
    emotions: {
      calm: '../assets/images/jh0.png',
      normal: '../assets/images/jh1.png',
      excited: '../assets/images/jh2.png',
      stressed: '../assets/images/jh3.png'
    }
  },
  JIMIN: {
    name: 'JIMIN',
    emotions: {
      calm: '../assets/images/jm0.png',
      normal: '../assets/images/jm1.png',
      excited: '../assets/images/jm2.png',
      stressed: '../assets/images/jm3.png'
    }
  },
  V: {
    name: 'V',
    emotions: {
      calm: '../assets/images/v0.png',
      normal: '../assets/images/v1.png',
      excited: '../assets/images/v2.png',
      stressed: '../assets/images/v3.png'
    }
  },
  JUNGKOOK: {
    name: 'JUNGKOOK',
    emotions: {
      calm: '../assets/images/jk0.png',
      normal: '../assets/images/jk1.png',
      excited: '../assets/images/jk2.png',
      stressed: '../assets/images/jk3.png'
    }
  }
};

function loadAllCharacters() {
  let characters = { ...DEFAULT_CHARACTERS };
  
  const customChars = localStorage.getItem('withfave-custom-characters');
  if (customChars) {
    try {
      const parsed = JSON.parse(customChars);
      characters = { ...characters, ...parsed };
    } catch (e) {
      console.error('Failed to parse custom characters:', e);
    }
  }
  
  return characters;
}

let CHARACTERS = loadAllCharacters();

class WithFaveApp {
  constructor() {
    this.elements = {
      character: document.getElementById('character'),
      characterBadge: document.getElementById('character-badge'),
      cpuBar: document.getElementById('cpu-bar'),
      cpuValue: document.getElementById('cpu-value'),
      emotionLabel: document.getElementById('emotion-label')
    };

    this.currentCharacter = 'default';
    this.currentEmotion = 'calm';
    
    this.init();
  }

  async init() {
    await this.loadCharacter();
    this.setupEventListeners();
    this.startCPUMonitoring();
  }

  async loadCharacter() {
    try {
      const savedCharacter = localStorage.getItem('withfave-character');
      if (savedCharacter && CHARACTERS[savedCharacter]) {
        this.currentCharacter = savedCharacter;
      }
      
      const serverCharacter = await window.withFave.getCharacter();
      if (serverCharacter && CHARACTERS[serverCharacter]) {
        this.currentCharacter = serverCharacter;
      }
    } catch (error) {
      console.error('Failed to load character:', error);
    }
  }

  setupEventListeners() {
    window.withFave.onCPUUpdate((data) => {
      this.updateDisplay(data);
    });

    window.withFave.onCharacterChanged((characterName) => {
      console.log('Character changed to:', characterName);
      if (CHARACTERS[characterName]) {
        this.currentCharacter = characterName;
        localStorage.setItem('withfave-character', characterName);
        this.updateCharacterDisplay(this.currentEmotion);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.reloadCharacter();
      }
    });

    window.addEventListener('focus', () => {
      this.reloadCharacter();
    });
  }

  async reloadCharacter() {
    try {
      CHARACTERS = loadAllCharacters();
      
      const character = await window.withFave.getCharacter();
      if (character && CHARACTERS[character]) {
        if (character !== this.currentCharacter) {
          this.currentCharacter = character;
          localStorage.setItem('withfave-character', character);
        }
        this.updateCharacterDisplay(this.currentEmotion);
      }
    } catch (error) {
      console.error('Failed to reload character:', error);
    }
  }

  startCPUMonitoring() {
    window.withFave.getCPU().then((data) => {
      if (data) {
        this.updateDisplay(data);
      }
    });
  }

  updateDisplay(data) {
    const { smoothed, emotion } = data;
    
    this.elements.cpuBar.style.width = `${Math.min(smoothed, 100)}%`;
    this.elements.cpuValue.textContent = `${Math.round(smoothed)}%`;
    this.elements.emotionLabel.textContent = emotion;
    
    this.updateCharacterDisplay(emotion);
    this.updateCharacterAnimation(emotion, smoothed);
  }

  isImagePath(value) {
    if (!value || typeof value !== 'string') return false;
    return value.startsWith('data:image') ||
           value.endsWith('.png') || value.endsWith('.jpg') || 
           value.endsWith('.jpeg') || value.endsWith('.gif') || 
           value.endsWith('.webp');
  }

  updateCharacterDisplay(emotion) {
    this.currentEmotion = emotion;
    const character = CHARACTERS[this.currentCharacter];
    
    if (character && character.emotions[emotion]) {
      const emotionValue = character.emotions[emotion];
      
      if (this.isImagePath(emotionValue)) {
        this.elements.character.innerHTML = `<img src="${emotionValue}" class="character-img" alt="${emotion}" />`;
      } else {
        this.elements.character.textContent = emotionValue;
      }
      
      this.elements.characterBadge.textContent = emotion;
    }
  }

  updateCharacterAnimation(emotion, cpuUsage) {
    // Animation removed for compact layout
  }

  getCharacters() {
    return CHARACTERS;
  }
}

window.CHARACTERS = CHARACTERS;

document.addEventListener('DOMContentLoaded', () => {
  window.app = new WithFaveApp();
});
