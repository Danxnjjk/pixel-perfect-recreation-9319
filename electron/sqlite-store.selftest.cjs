"use strict";
// Teste do armazenamento SQLite (rode com: npm run test:sqlite). Não precisa do Electron.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { openStore } = require("./sqlite-store.cjs");

const sample = () => ({
  schemaVersion: 3,
  accounts: [
    { id: "a1", name: "Conta corrente", kind: "bancaria", color: "c1", initialBalance: 100000, archived: false },
    { id: "a2", name: "CDB", kind: "investimento", color: "c2", initialBalance: -2500, archived: true },
  ],
  categories: [{ id: "k1", name: "Mercado", color: "m", icon: "tag", archived: false }],
  transactions: [
    { id: "t1", date: "2026-10-05", description: "Salário", amount: 500000, type: "receita", accountId: "a1" },
    { id: "t2", date: "2026-10-06", description: "Mercado d'a esquina", amount: 8050, type: "despesa", accountId: "a1", categoryId: "k1", notes: "obs" },
    { id: "t3", date: "2026-10-07", description: "Aporte", amount: 30000, type: "aporte", accountId: "a1", toAccountId: "a2" },
    { id: "t4", date: "2026-10-08", description: "Ajuste", amount: -2500, type: "ajuste", accountId: "a1" },
    { id: "s1@2026-10-10", date: "2026-10-10", description: "Netflix", amount: 3990, type: "despesa", accountId: "a1",
      schedule: { scheduleId: "s1", occurrenceDate: "2026-10-10", name: "Netflix" } },
  ],
  cards: [{ id: "c1", name: "Cartão", limit: 500000, closingDay: 10, dueDay: 17, color: "k", archived: false }],
  cardPurchases: [
    { id: "p1", cardId: "c1", date: "2026-10-20", description: "TV", totalAmount: 60000, installments: 3, firstInvoiceMonth: "2026-11", categoryId: "k1" },
    { id: "p2", cardId: "c1", date: "2026-10-21", description: "Livro", totalAmount: 5000, installments: 1, firstInvoiceMonth: "2026-11", notes: "n" },
  ],
  invoicePayments: [{ id: "i1", cardId: "c1", invoiceMonth: "2026-11", accountId: "a1", date: "2026-11-17", amount: 20000 }],
  schedules: [
    { id: "s1", description: "Netflix", amount: 3990, type: "despesa", accountId: "a1", categoryId: "k1", startDate: "2026-10-10", frequency: "mensal", paused: false, endDate: "2027-10-10" },
    { id: "s2", description: "Salário", amount: 500000, type: "receita", accountId: "a1", startDate: "2026-11-05", frequency: "unica", paused: true, skipBefore: "2026-12-01" },
  ],
  scheduleOccurrences: [{ id: "s1@2026-10-10", scheduleId: "s1", date: "2026-10-10", status: "paga", transactionId: "s1@2026-10-10" }],
});
const empty = () => ({ schemaVersion: 3, accounts: [], categories: [], transactions: [], cards: [], cardPurchases: [], invoicePayments: [], schedules: [], scheduleOccurrences: [] });

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "patrimonio-sqlite-"));
let passed = 0;
let failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log("  ok  ", name); } catch (e) { failed++; console.log("  ERRO", name, "\n      ", String(e.message).split("\n")[0]); }
}

const dbFile = path.join(dir, "financas.db");
let store = openStore(dbFile);

test("banco novo não tem dados (devolve null)", () => assert.equal(store.load(), null));
test("grava e lê exatamente os mesmos dados (todos os tipos e campos opcionais)", () => {
  store.save(sample());
  assert.deepStrictEqual(store.load(), sample());
});
test("dados vazios gravados voltam como vazios (e não como 'nunca gravado')", () => {
  store.save(empty());
  assert.deepStrictEqual(store.load(), empty());
  store.save(sample());
});
test("uma nova gravação substitui a anterior (sem sobras)", () => {
  const d = sample();
  d.transactions = d.transactions.slice(0, 1);
  d.cardPurchases = [];
  store.save(d);
  assert.deepStrictEqual(store.load(), d);
  store.save(sample());
});
test("valor com centavos quebrados é recusado e nada muda", () => {
  const bad = sample();
  bad.transactions[0].amount = 10.5;
  assert.throws(() => store.save(bad));
  assert.deepStrictEqual(store.load(), sample());
});
test("tipo desconhecido é recusado e nada muda", () => {
  const bad = sample();
  bad.transactions[1].type = "xyz";
  assert.throws(() => store.save(bad));
  assert.deepStrictEqual(store.load(), sample());
});
test("identificador repetido é recusado e nada muda", () => {
  const bad = sample();
  bad.accounts.push({ ...bad.accounts[0] });
  assert.throws(() => store.save(bad));
  assert.deepStrictEqual(store.load(), sample());
});
test("formato inválido é recusado e nada muda", () => {
  assert.throws(() => store.save({ accounts: [] }));
  assert.throws(() => store.save(null));
  assert.deepStrictEqual(store.load(), sample());
});
test("os dados continuam lá depois de fechar e abrir o banco", () => {
  store.close();
  store = openStore(dbFile);
  assert.deepStrictEqual(store.load(), sample());
});
test("cópia de segurança abre como banco e tem os mesmos dados (caminho com apóstrofo)", () => {
  const out = path.join(dir, "d'água", "copia.db");
  store.backupTo(out);
  const copy = openStore(out);
  assert.deepStrictEqual(copy.load(), sample());
  copy.close();
});
test("cópia diária: cria uma por dia e guarda só as mais recentes", () => {
  const backups = path.join(dir, "backups");
  const f1 = store.dailyBackup(backups, "2026-11-01", 2);
  assert.ok(f1 && fs.existsSync(f1));
  const mtime = fs.statSync(f1).mtimeMs;
  store.dailyBackup(backups, "2026-11-01", 2); // mesmo dia: não refaz
  assert.equal(fs.statSync(f1).mtimeMs, mtime);
  store.dailyBackup(backups, "2026-11-02", 2);
  store.dailyBackup(backups, "2026-11-03", 2);
  assert.deepEqual(fs.readdirSync(backups).sort(), ["financas-2026-11-02.db", "financas-2026-11-03.db"]);
});
test("sem dados ainda, não faz cópia diária", () => {
  const fresh = openStore(path.join(dir, "novo.db"));
  assert.equal(fresh.dailyBackup(path.join(dir, "b2"), "2026-11-01"), null);
  fresh.close();
});

store.close();
fs.rmSync(dir, { recursive: true, force: true });
console.log(`\n${passed} passaram, ${failed} falharam`);
process.exit(failed === 0 ? 0 : 1);
