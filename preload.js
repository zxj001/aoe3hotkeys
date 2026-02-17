// Preload runs in a privileged context and exposes a minimal API to the renderer.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  onXml: (callback) => ipcRenderer.on('xml-data', (event, data) => callback(data)),
  selectNewDirectory: () => ipcRenderer.invoke('select-new-directory'),
  selectNewProfile: () => ipcRenderer.invoke('select-new-profile'),
  selectDefaultKeymap: (index) => ipcRenderer.invoke('select-default-keymap', index),
  writeToClipboard: (text) => ipcRenderer.invoke('write-to-clipboard', text),
  loadDefaultHotkeys: () => ipcRenderer.invoke('load-default-hotkeys'),
  mergeHotkeys: (currentXml) => ipcRenderer.invoke('merge-hotkeys', currentXml),
  saveProfile: (xmlData) => ipcRenderer.invoke('save-profile', xmlData),
  reloadProfile: () => ipcRenderer.invoke('reload-profile')
})

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
