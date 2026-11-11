"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { saveBackupFile, newestBackupTime } = require("./backup-files.cjs");
const { openStore } = require("./sqlite-store.cjs");

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "patrimonio-backups-"));
let passed = 0;
let failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log("  ok  ", name); } catch (e) { failed++; console.log("  ERRO", name, "\n      ", String(e.message).split("\n")[0]); }
}
const backups = path.join(dir, "pasta nova", "backups");

test("sem arquivos ainda, não há data de backup", () => assert.equal(newestBackupTime(backups), null));
test("salva o backup na pasta (criando a pasta se preciso) com o mesmo conteúdo", () => {
  const file = saveBackupFile(backups, "patrimonio-backup-2026-11-04-1530.json", '{"ok":true,"acentuação":"çã"}');
  assert.equal(path.dirname(file), backups);
  assert.equal(fs.readFileSync(file, "utf8"), '{"ok":true,"acentuação":"çã"}');
  assert.deepEqual(fs.readdirSync(backups), ["patrimonio-backup-2026-11-04-1530.json"]); // sem sobras temporárias
});
test("a data do último backup é a do arquivo mais recente", () => {
  const iso = newestBackupTime(backups);
  assert.ok(iso && Math.abs(Date.now() - new Date(iso).getTime()) < 60_000);
});
test("fazer outro backup no mesmo minuto substitui o arquivo, sem erro", () => {
  saveBackupFile(backups, "patrimonio-backup-2026-11-04-1530.json", "{}");
  assert.equal(fs.readFileSync(path.join(backups, "patrimonio-backup-2026-11-04-1530.json"), "utf8"), "{}");
});
test("recusa nomes perigosos ou fora do padrão (nada sai da pasta de backups)", () => {
  for (const bad of ["../x.json", "..\\x.json", "a/b.json", "patrimonio-backup-.txt", "outro.json", "", "patrimonio-backup-/../../x.json", 42, null]) {
    assert.throws(() => saveBackupFile(backups, bad, "{}"), undefined, String(bad));
  }
  assert.deepEqual(fs.readdirSync(backups), ["patrimonio-backup-2026-11-04-1530.json"]);
});
test("recusa conteúdo vazio ou que não é texto", () => {
  assert.throws(() => saveBackupFile(backups, "patrimonio-backup-x.json", ""));
  assert.throws(() => saveBackupFile(backups, "patrimonio-backup-x.json", null));
});
test("a rotação das cópias diárias (.db) não apaga os backups em JSON", () => {
  const store = openStore(path.join(dir, "financas.db"));
  store.save({ schemaVersion: 3, accounts: [], categories: [], transactions: [], cards: [], cardPurchases: [], invoicePayments: [], schedules: [], scheduleOccurrences: [] });
  for (const dia of ["01", "02", "03", "04"]) store.dailyBackup(backups, `2026-11-${dia}`, 2);
  store.close();
  const files = fs.readdirSync(backups).sort();
  assert.ok(files.includes("patrimonio-backup-2026-11-04-1530.json"));
  assert.deepEqual(files.filter((f) => f.endsWith(".db")), ["financas-2026-11-03.db", "financas-2026-11-04.db"]);
});

fs.rmSync(dir, { recursive: true, force: true });
console.log(`\n${passed} passaram, ${failed} falharam`);
process.exit(failed === 0 ? 0 : 1);
