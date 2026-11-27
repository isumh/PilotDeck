// Keep production chrome in use; fixture-only controls travel over ordinary IPC.
require('../../dist/preload.js');
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('eastyundeskChromeFixture', {
  closeMenu: () => ipcRenderer.invoke('eastyundesk:chrome-close-menu'),
});
