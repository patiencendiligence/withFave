const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('withFave', {
  getCPU: () => ipcRenderer.invoke('get-cpu'),
  
  getCharacter: () => ipcRenderer.invoke('get-character'),
  
  setCharacter: (name) => ipcRenderer.invoke('set-character', name),
  
  refreshCharacter: () => ipcRenderer.send('refresh-character'),
  
  onCPUUpdate: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('cpu-update', handler);
    return () => ipcRenderer.removeListener('cpu-update', handler);
  },
  
  onCharacterChanged: (callback) => {
    const handler = (event, characterName) => callback(characterName);
    ipcRenderer.on('character-changed', handler);
    return () => ipcRenderer.removeListener('character-changed', handler);
  },
  
  closeSettings: () => ipcRenderer.send('close-settings'),
  
  closeInfo: () => ipcRenderer.send('close-info'),
  
  openExternal: (url) => ipcRenderer.send('open-external', url),
  
  showMainWindow: () => ipcRenderer.send('show-main-window')
});
