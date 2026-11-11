"use strict";
// Armazenamento dos dados em um banco SQLite (arquivo único), usando o SQLite que já vem no Node/Electron
// (nenhuma biblioteca extra para instalar). Não depende do Electron, então pode ser testado sozinho.
//
// Como funciona: cada gravação troca TODOS os dados dentro de uma única transação. Ou grava tudo ou não
// grava nada (se algo der errado, o banco continua exatamente como estava). Valores em dinheiro são
// guardados como INTEIROS (centavos) e o próprio banco recusa números quebrados.

const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const SCHEMA_VERSION = 3;

// Ordem de apagar (filhos antes dos pais); inserir usa a ordem inversa.
const TABLES = [
  "schedule_occurrences", "schedules", "invoice_payments", "card_purchases", "cards", "transactions", "categories", "accounts",
];

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('bancaria','investimento')),
  color TEXT NOT NULL,
  initial_balance INTEGER NOT NULL CHECK (typeof(initial_balance) = 'integer'),
  archived INTEGER NOT NULL CHECK (archived IN (0,1)),
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  archived INTEGER NOT NULL CHECK (archived IN (0,1)),
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (typeof(amount) = 'integer'),
  type TEXT NOT NULL CHECK (type IN ('receita','despesa','aporte','rendimento','resgate','transferencia','ajuste','informativo')),
  category_id TEXT,
  account_id TEXT,
  to_account_id TEXT,
  notes TEXT,
  schedule_id TEXT,
  schedule_occurrence_date TEXT,
  schedule_name TEXT,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  credit_limit INTEGER NOT NULL CHECK (typeof(credit_limit) = 'integer'),
  closing_day INTEGER NOT NULL CHECK (closing_day BETWEEN 1 AND 31),
  due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
  color TEXT NOT NULL,
  archived INTEGER NOT NULL CHECK (archived IN (0,1)),
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS card_purchases (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  date TEXT NOT NULL,
  description TEXT NOT NULL,
  total_amount INTEGER NOT NULL CHECK (typeof(total_amount) = 'integer'),
  installments INTEGER NOT NULL CHECK (installments >= 1),
  first_invoice_month TEXT NOT NULL,
  category_id TEXT,
  notes TEXT,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS invoice_payments (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  invoice_month TEXT NOT NULL,
  account_id TEXT NOT NULL,
  date TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (typeof(amount) = 'integer'),
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (typeof(amount) = 'integer'),
  type TEXT NOT NULL CHECK (type IN ('receita','despesa')),
  category_id TEXT,
  account_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('unica','semanal','quinzenal','mensal','anual')),
  end_date TEXT,
  paused INTEGER NOT NULL CHECK (paused IN (0,1)),
  skip_before TEXT,
  position INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS schedule_occurrences (
  id TEXT PRIMARY KEY,
  schedule_id TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paga','cancelada')),
  transaction_id TEXT NOT NULL,
  position INTEGER NOT NULL
);
`;

const bit = (v) => (v ? 1 : 0);
const orNull = (v) => (v === undefined || v === null ? null : v);

function assertShape(data) {
  const keys = ["accounts", "categories", "transactions", "cards", "cardPurchases", "invoicePayments", "schedules", "scheduleOccurrences"];
  if (typeof data !== "object" || data === null || keys.some((k) => !Array.isArray(data[k]))) {
    throw new Error("Dados inválidos: formato não reconhecido.");
  }
}

function localDate(now = new Date()) {
  const p = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

function openStore(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const db = new DatabaseSync(filePath);
  db.exec("PRAGMA synchronous = FULL");
  db.exec(SCHEMA);

  const all = (sql) => db.prepare(sql).all();

  /** Dados salvos, ou null se nunca foi gravado nada. */
  function load() {
    const meta = db.prepare("SELECT value FROM meta WHERE key = 'schema_version'").get();
    if (!meta) return null;
    const out = {
      schemaVersion: SCHEMA_VERSION,
      accounts: all("SELECT * FROM accounts ORDER BY position").map((r) => ({
        id: r.id, name: r.name, kind: r.kind, color: r.color, initialBalance: r.initial_balance, archived: r.archived === 1,
      })),
      categories: all("SELECT * FROM categories ORDER BY position").map((r) => ({
        id: r.id, name: r.name, color: r.color, icon: r.icon, archived: r.archived === 1,
      })),
      transactions: all("SELECT * FROM transactions ORDER BY position").map((r) => {
        const t = { id: r.id, date: r.date, description: r.description, amount: r.amount, type: r.type };
        if (r.category_id !== null) t.categoryId = r.category_id;
        if (r.account_id !== null) t.accountId = r.account_id;
        if (r.to_account_id !== null) t.toAccountId = r.to_account_id;
        if (r.notes !== null) t.notes = r.notes;
        if (r.schedule_id !== null) {
          t.schedule = { scheduleId: r.schedule_id, occurrenceDate: r.schedule_occurrence_date, name: r.schedule_name };
        }
        return t;
      }),
      cards: all("SELECT * FROM cards ORDER BY position").map((r) => ({
        id: r.id, name: r.name, limit: r.credit_limit, closingDay: r.closing_day, dueDay: r.due_day, color: r.color, archived: r.archived === 1,
      })),
      cardPurchases: all("SELECT * FROM card_purchases ORDER BY position").map((r) => {
        const p = {
          id: r.id, cardId: r.card_id, date: r.date, description: r.description, totalAmount: r.total_amount,
          installments: r.installments, firstInvoiceMonth: r.first_invoice_month,
        };
        if (r.category_id !== null) p.categoryId = r.category_id;
        if (r.notes !== null) p.notes = r.notes;
        return p;
      }),
      invoicePayments: all("SELECT * FROM invoice_payments ORDER BY position").map((r) => ({
        id: r.id, cardId: r.card_id, invoiceMonth: r.invoice_month, accountId: r.account_id, date: r.date, amount: r.amount,
      })),
      schedules: all("SELECT * FROM schedules ORDER BY position").map((r) => {
        const s = {
          id: r.id, description: r.description, amount: r.amount, type: r.type, accountId: r.account_id,
          startDate: r.start_date, frequency: r.frequency, paused: r.paused === 1,
        };
        if (r.category_id !== null) s.categoryId = r.category_id;
        if (r.end_date !== null) s.endDate = r.end_date;
        if (r.skip_before !== null) s.skipBefore = r.skip_before;
        return s;
      }),
      scheduleOccurrences: all("SELECT * FROM schedule_occurrences ORDER BY position").map((r) => ({
        id: r.id, scheduleId: r.schedule_id, date: r.date, status: r.status, transactionId: r.transaction_id,
      })),
    };
    return out;
  }

  /** Troca todos os dados de uma vez. Se qualquer parte falhar, nada muda. */
  function save(data) {
    assertShape(data);
    db.exec("BEGIN IMMEDIATE");
    try {
      for (const table of TABLES) db.exec(`DELETE FROM ${table}`);

      const insert = (sql, rows, values) => {
        const stmt = db.prepare(sql);
        rows.forEach((row, i) => stmt.run(...values(row, i)));
      };

      insert("INSERT INTO accounts (id, name, kind, color, initial_balance, archived, position) VALUES (?,?,?,?,?,?,?)",
        data.accounts, (a, i) => [a.id, a.name, a.kind, a.color, a.initialBalance, bit(a.archived), i]);
      insert("INSERT INTO categories (id, name, color, icon, archived, position) VALUES (?,?,?,?,?,?)",
        data.categories, (c, i) => [c.id, c.name, c.color, c.icon, bit(c.archived), i]);
      insert(`INSERT INTO transactions (id, date, description, amount, type, category_id, account_id, to_account_id, notes,
              schedule_id, schedule_occurrence_date, schedule_name, position) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        data.transactions, (t, i) => [t.id, t.date, t.description, t.amount, t.type, orNull(t.categoryId), orNull(t.accountId),
          orNull(t.toAccountId), orNull(t.notes), orNull(t.schedule && t.schedule.scheduleId),
          orNull(t.schedule && t.schedule.occurrenceDate), orNull(t.schedule && t.schedule.name), i]);
      insert("INSERT INTO cards (id, name, credit_limit, closing_day, due_day, color, archived, position) VALUES (?,?,?,?,?,?,?,?)",
        data.cards, (c, i) => [c.id, c.name, c.limit, c.closingDay, c.dueDay, c.color, bit(c.archived), i]);
      insert(`INSERT INTO card_purchases (id, card_id, date, description, total_amount, installments, first_invoice_month,
              category_id, notes, position) VALUES (?,?,?,?,?,?,?,?,?,?)`,
        data.cardPurchases, (p, i) => [p.id, p.cardId, p.date, p.description, p.totalAmount, p.installments, p.firstInvoiceMonth,
          orNull(p.categoryId), orNull(p.notes), i]);
      insert("INSERT INTO invoice_payments (id, card_id, invoice_month, account_id, date, amount, position) VALUES (?,?,?,?,?,?,?)",
        data.invoicePayments, (p, i) => [p.id, p.cardId, p.invoiceMonth, p.accountId, p.date, p.amount, i]);
      insert(`INSERT INTO schedules (id, description, amount, type, category_id, account_id, start_date, frequency, end_date,
              paused, skip_before, position) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        data.schedules, (s, i) => [s.id, s.description, s.amount, s.type, orNull(s.categoryId), s.accountId, s.startDate,
          s.frequency, orNull(s.endDate), bit(s.paused), orNull(s.skipBefore), i]);
      insert("INSERT INTO schedule_occurrences (id, schedule_id, date, status, transaction_id, position) VALUES (?,?,?,?,?,?)",
        data.scheduleOccurrences, (o, i) => [o.id, o.scheduleId, o.date, o.status, o.transactionId, i]);

      db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES ('schema_version', ?)").run(String(SCHEMA_VERSION));
      db.exec("COMMIT");
    } catch (error) {
      try { db.exec("ROLLBACK"); } catch { /* já desfeito */ }
      throw error;
    }
  }

  /** Cópia consistente do banco inteiro em outro arquivo. */
  function backupTo(filePathOut) {
    fs.mkdirSync(path.dirname(filePathOut), { recursive: true });
    if (fs.existsSync(filePathOut)) fs.rmSync(filePathOut);
    db.exec(`VACUUM INTO '${filePathOut.replace(/'/g, "''")}'`);
  }

  /** Uma cópia por dia (se já houver dados) e guarda só as `keep` mais recentes. */
  function dailyBackup(dir, today = localDate(), keep = 30) {
    const hasData = db.prepare("SELECT 1 AS x FROM meta WHERE key = 'schema_version'").get();
    if (!hasData) return null;
    const file = path.join(dir, `financas-${today}.db`);
    if (!fs.existsSync(file)) backupTo(file);
    const files = fs.readdirSync(dir).filter((f) => /^financas-\d{4}-\d{2}-\d{2}\.db$/.test(f)).sort();
    for (const old of files.slice(0, Math.max(0, files.length - keep))) fs.rmSync(path.join(dir, old));
    return file;
  }

  function close() {
    db.close();
  }

  return { load, save, backupTo, dailyBackup, close, filePath };
}

module.exports = { openStore, SCHEMA_VERSION };
