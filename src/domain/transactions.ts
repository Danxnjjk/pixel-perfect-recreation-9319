// Pure transaction operations and period filtering.
import type { FinanceData, Transaction } from "./types";

export type Period =
  | { kind: "todos" }
  | { kind: "mes"; month: string } // yyyy-mm
  | { kind: "ano"; year: string } // yyyy
  | { kind: "intervalo"; from: string; to: string }; // yyyy-mm-dd inclusive

export function inPeriod(date: string, p: Period): boolean {
  switch (p.kind) {
    case "todos":
      return true;
    case "mes":
      return date.slice(0, 7) === p.month;
    case "ano":
      return date.slice(0, 4) === p.year;
    case "intervalo":
      return (!p.from || date >= p.from) && (!p.to || date <= p.to);
  }
}

export const needsDestination = (t: Transaction["type"]) =>
  t === "aporte" || t === "resgate" || t === "transferencia";

export function upsertTransaction(data: FinanceData, tx: Transaction): FinanceData {
  const exists = data.transactions.some((t) => t.id === tx.id);
  return {
    ...data,
    transactions: exists
      ? data.transactions.map((t) => (t.id === tx.id ? tx : t))
      : [...data.transactions, tx],
  };
}

export function deleteTransaction(data: FinanceData, id: string): FinanceData {
  return { ...data, transactions: data.transactions.filter((t) => t.id !== id) };
}
