const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, screen, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const CPUMonitor = require('./system/cpu');

let mainWindow = null;
let settingsWindow = null;
let infoWindow = null;
let tray = null;
let cpuMonitor = null;

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load config:', error);
  }
  return { character: 'default' };
}

function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    return true;
  } catch (error) {
    console.error('Failed to save config:', error);
    return false;
  }
}

const WINDOW_CONFIG = {
  main: {
    width: 160,
    height: 150,
    minWidth: 140,
    minHeight: 130
  },
  settings: {
    width: 400,
    height: 500
  }
};

function createTrayIcon() {
  const size = process.platform === 'darwin' ? 16 : 32;
  
  const iconPath = process.platform === 'darwin' 
    ? path.join(__dirname, 'assets', 'trayIconTemplate.png')
    : path.join(__dirname, 'assets', 'trayIcon.png');
  
  const fs = require('fs');
  if (fs.existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath);
  }
  
  const icon = nativeImage.createEmpty();
  const buffer = Buffer.alloc(size * size * 4);
  
  for (let i = 0; i < size * size; i++) {
    const x = i % size;
    const y = Math.floor(i / size);
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 1;
    const dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
    
    if (dist <= radius) {
      buffer[i * 4] = 233;     // R
      buffer[i * 4 + 1] = 69;  // G
      buffer[i * 4 + 2] = 96;  // B
      buffer[i * 4 + 3] = 255; // A
    }
  }
  
  return nativeImage.createFromBuffer(buffer, { width: size, height: size });
}

function createMainWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: WINDOW_CONFIG.main.width,
    height: WINDOW_CONFIG.main.height,
    x: screenWidth - WINDOW_CONFIG.main.width - 20,
    y: 60,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  
  if (process.platform === 'darwin') {
    mainWindow.setWindowButtonVisibility(false);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

function createSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
    return settingsWindow;
  }

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  settingsWindow = new BrowserWindow({
    width: WINDOW_CONFIG.settings.width,
    height: WINDOW_CONFIG.settings.height,
    x: Math.round((screenWidth - WINDOW_CONFIG.settings.width) / 2),
    y: Math.round((screenHeight - WINDOW_CONFIG.settings.height) / 2),
    frame: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    title: 'withFave Settings',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  settingsWindow.loadFile(path.join(__dirname, 'renderer', 'settings.html'));

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });

  return settingsWindow;
}

function createInfoWindow() {
  if (infoWindow) {
    infoWindow.focus();
    return infoWindow;
  }

  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;

  infoWindow = new BrowserWindow({
    width: 380,
    height: 520,
    x: Math.round((screenWidth - 380) / 2),
    y: Math.round((screenHeight - 520) / 2),
    frame: true,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    title: 'withFave - Info',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  infoWindow.loadFile(path.join(__dirname, 'renderer', 'info.html'));

  infoWindow.on('closed', () => {
    infoWindow = null;
  });

  return infoWindow;
}

function createTray() {
  const icon = createTrayIcon();
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show withFave',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => createSettingsWindow()
    },
    {
      label: 'Info',
      click: () => createInfoWindow()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('withFave - System Pet');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

function setupCPUMonitor() {
  cpuMonitor = new CPUMonitor({
    interval: 500,
    smoothingFactor: 0.3
  });

  cpuMonitor.subscribe((data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('cpu-update', data);
    }
  });

  cpuMonitor.start();
}

function setupIPC() {
  ipcMain.handle('get-cpu', async () => {
    if (cpuMonitor) {
      return await cpuMonitor.getCurrentCPU();
    }
    return null;
  });

  ipcMain.handle('get-character', () => {
    const config = loadConfig();
    return config.character || 'default';
  });

  ipcMain.handle('set-character', (event, characterName) => {
    const config = loadConfig();
    config.character = characterName;
    saveConfig(config);
    
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('character-changed', characterName);
    }
    
    if (settingsWindow && !settingsWindow.isDestroyed()) {
      settingsWindow.webContents.send('character-changed', characterName);
    }
    
    return true;
  });

  ipcMain.on('close-settings', () => {
    if (settingsWindow) {
      settingsWindow.close();
    }
  });
  
  ipcMain.on('refresh-character', () => {
    const config = loadConfig();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('character-changed', config.character || 'default');
    }
  });

  ipcMain.on('close-info', () => {
    if (infoWindow) {
      infoWindow.close();
    }
  });

  ipcMain.on('open-external', (event, url) => {
    shell.openExternal(url);
  });

  ipcMain.on('show-main-window', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  createMainWindow();
  createTray();
  setupCPUMonitor();
  setupIPC();
});

app.on('window-all-closed', () => {
  // Keep running in tray
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

app.on('before-quit', () => {
  if (cpuMonitor) {
    cpuMonitor.stop();
  }
});
