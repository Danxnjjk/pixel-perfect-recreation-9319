import { describe, expect, it } from "vitest";
import { inPeriod, upsertTransaction, deleteTransaction } from "@/domain/transactions";
import type { FinanceData } from "@/domain/types";

const d: FinanceData = { accounts: [], categories: [], cards: [], cardPurchases: [],
  transactions: [{ id: "a", date: "2026-10-05", description: "x", amount: 10, type: "despesa" }] };

describe("lançamentos", () => {
  it("filtra por mês, ano e intervalo", () => {
    expect(inPeriod("2026-10-05", { kind: "mes", month: "2026-10" })).toBe(true);
    expect(inPeriod("2026-09-30", { kind: "mes", month: "2026-10" })).toBe(false);
    expect(inPeriod("2026-01-01", { kind: "ano", year: "2026" })).toBe(true);
    expect(inPeriod("2026-10-31", { kind: "intervalo", from: "2026-10-01", to: "2026-10-31" })).toBe(true);
    expect(inPeriod("2026-11-01", { kind: "intervalo", from: "2026-10-01", to: "2026-10-31" })).toBe(false);
  });
  it("cria, edita e exclui", () => {
    const added = upsertTransaction(d, { id: "b", date: "2026-10-06", description: "y", amount: 5, type: "receita" });
    expect(added.transactions).toHaveLength(2);
    const edited = upsertTransaction(added, { ...added.transactions[0], amount: 99 });
    expect(edited.transactions.find((t) => t.id === "a")?.amount).toBe(99);
    expect(deleteTransaction(edited, "a").transactions.map((t) => t.id)).toEqual(["b"]);
  });
});
