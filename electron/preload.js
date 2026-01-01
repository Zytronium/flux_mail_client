const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  login: (config) => ipcRenderer.invoke('mail:login', config),
  fetchEmails: (config, folder) => ipcRenderer.invoke('mail:fetch', config, folder),
  sendEmail: (config, mail) => ipcRenderer.invoke('mail:send', { config, mail }),
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  loadAccounts: () => ipcRenderer.invoke('accounts:load'),
  saveAccounts: (accounts) => ipcRenderer.invoke('accounts:save', accounts),
});
