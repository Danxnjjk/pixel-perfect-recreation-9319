"use strict";
// Aplicativo Windows (Electron): abre a janela e guarda os dados em um banco SQLite no computador.
// Funciona 100% offline.
const path = require("node:path");
const { app, BrowserWindow, Menu, ipcMain, shell } = require("electron");
const { openStore } = require("./sqlite-store.cjs");
const { saveBackupFile, newestBackupTime } = require("./backup-files.cjs");

let store = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 960,
    minHeight: 640,
    title: "Patrimônio",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  Menu.setApplicationMenu(null);

  // Em desenvolvimento a tela vem do servidor do Vite; no aplicativo final, dos arquivos já gerados (dist).
  const devUrl = process.env.ELECTRON_START_URL;
  if (devUrl) mainWindow.loadURL(devUrl);
  else mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));

  // Links externos abrem no navegador do computador, nunca dentro do aplicativo.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  mainWindow.webContents.on("will-navigate", (event, url) => {
    const allowed = devUrl ? url.startsWith(devUrl) : url.startsWith("file://");
    if (!allowed) event.preventDefault();
  });
  mainWindow.on("closed", () => { mainWindow = null; });
}

// Só uma janela do aplicativo por vez (duas gravando no mesmo banco seria perigoso).
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    const userData = app.getPath("userData");
    const dbPath = path.join(userData, "financas.db");
    const backupsDir = path.join(userData, "backups");
    store = openStore(dbPath);
    try {
      store.dailyBackup(backupsDir); // uma cópia de segurança por dia
    } catch (error) {
      console.error("Não foi possível fazer a cópia diária:", error);
    }

    ipcMain.handle("store:load", () => store.load());
    ipcMain.handle("store:save", (_event, data) => {
      store.save(data);
    });
    ipcMain.handle("store:info", () => ({ kind: "sqlite", dbPath, backupsDir, lastBackupAt: newestBackupTime(backupsDir) }));
    // Backup manual: grava o arquivo direto na pasta de backups, sem perguntar onde salvar.
    ipcMain.handle("store:backupNow", (_event, text, fileName) => {
      const file = saveBackupFile(backupsDir, fileName, text);
      return { path: file, at: newestBackupTime(backupsDir) };
    });
    ipcMain.handle("store:openFolder", () => shell.openPath(userData));

    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
  app.on("before-quit", () => {
    try { if (store) store.close(); } catch { /* já fechado */ }
  });
}
