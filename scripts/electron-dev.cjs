"use strict";
// Abre o aplicativo Windows em modo de desenvolvimento: liga o servidor do Vite, espera ele responder
// e abre a janela do Electron apontando para ele. Ao fechar a janela, desliga o servidor.
const { spawn } = require("node:child_process");
const http = require("node:http");
const path = require("node:path");

const root = path.join(__dirname, "..");
const PORT = 5173;
const URL = `http://localhost:${PORT}/`;

let electronPath;
try {
  electronPath = require("electron");
} catch {
  console.error("\nO Electron ainda não está instalado. Rode primeiro:\n\n  npm.cmd install --save-dev electron\n");
  process.exit(1);
}

const viteBin = path.join(root, "node_modules", "vite", "bin", "vite.js");
const vite = spawn(process.execPath, [viteBin, "--port", String(PORT), "--strictPort"], { cwd: root, stdio: "inherit" });
vite.on("exit", (code) => {
  if (code) {
    console.error(`\nO servidor do Vite parou (código ${code}). Se a porta ${PORT} está em uso, feche o outro "npm run dev" e tente de novo.`);
    process.exit(code);
  }
});

function cleanup(code) {
  try { vite.kill(); } catch { /* já parou */ }
  process.exit(code);
}
process.on("SIGINT", () => cleanup(0));

function waitForServer(tries = 0) {
  http
    .get(URL, (res) => {
      res.resume();
      const child = spawn(electronPath, ["."], { cwd: root, stdio: "inherit", env: { ...process.env, ELECTRON_START_URL: URL } });
      child.on("exit", (code) => cleanup(code ?? 0));
    })
    .on("error", () => {
      if (tries > 120) {
        console.error("O servidor do Vite não respondeu a tempo.");
        cleanup(1);
      } else {
        setTimeout(() => waitForServer(tries + 1), 500);
      }
    });
}
waitForServer();
