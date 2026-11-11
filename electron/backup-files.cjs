"use strict";
// Cópias de segurança em arquivo (JSON) guardadas na pasta de backups do aplicativo, sem perguntar onde salvar.
const fs = require("node:fs");
const path = require("node:path");

// Só aceita nomes como "patrimonio-backup-2026-11-04-1530.json" (nada de pastas ou caminhos).
const NAME = /^patrimonio-backup-[A-Za-z0-9._-]+\.json$/;

function saveBackupFile(dir, fileName, text) {
  if (typeof fileName !== "string" || !NAME.test(fileName)) throw new Error("Nome de arquivo de backup inválido.");
  if (typeof text !== "string" || text.length === 0 || text.length > 100 * 1024 * 1024) throw new Error("Conteúdo de backup inválido.");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, fileName);
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, text, "utf8"); // grava em arquivo temporário e troca no fim: nunca deixa um backup pela metade
  fs.renameSync(tmp, file);
  return file;
}

/** Data e hora (ISO) do arquivo de backup mais recente da pasta, ou null. */
function newestBackupTime(dir) {
  try {
    const times = fs
      .readdirSync(dir)
      .filter((f) => !f.endsWith(".tmp"))
      .map((f) => fs.statSync(path.join(dir, f)).mtimeMs);
    return times.length > 0 ? new Date(Math.max(...times)).toISOString() : null;
  } catch {
    return null;
  }
}

module.exports = { saveBackupFile, newestBackupTime, NAME };
