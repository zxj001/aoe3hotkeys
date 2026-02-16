// Preload runs in a privileged context and exposes a minimal API to the renderer.
const { contextBridge, ipcRenderer, clipboard } = require('electron')

contextBridge.exposeInMainWorld('api', {
  onXml: (callback) => ipcRenderer.on('xml-data', (event, data) => callback(data)),
  selectNewDirectory: () => ipcRenderer.invoke('select-new-directory'),
  selectNewProfile: () => ipcRenderer.invoke('select-new-profile'),
  writeToClipboard: (text) => clipboard.writeText(text)
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
