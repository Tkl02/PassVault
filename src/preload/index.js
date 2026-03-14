import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  setupMasterPassword: (password) => ipcRenderer.invoke('setup-master-password', password),
  checkSetup: () => ipcRenderer.invoke('check-master-password'),
  verifyMasterPassword: (password) => ipcRenderer.invoke('verify-master-password', password),
  getPasswords: (masterPassword) => ipcRenderer.invoke('get-passwords', masterPassword),
  savePasswords: (data) => ipcRenderer.invoke('save-passwords', data),
  exportData: (data) => ipcRenderer.invoke('export-data', data),
  importData: (data) => ipcRenderer.invoke('import-data', data),
  resetSystem: () => ipcRenderer.invoke('reset-system'),
});