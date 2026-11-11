"use strict";
// Ponte segura entre a tela e o banco de dados: a tela só enxerga estas 5 funções.
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("financeStore", {
  load: () => ipcRenderer.invoke("store:load"),
  save: (data) => ipcRenderer.invoke("store:save", data),
  info: () => ipcRenderer.invoke("store:info"),
  openFolder: () => ipcRenderer.invoke("store:openFolder"),
  backupNow: (text, fileName) => ipcRenderer.invoke("store:backupNow", text, fileName),
});
