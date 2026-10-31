import { describe, expect, it } from "vitest";
import { monthFlow, summary } from "./finance";
import type { FinanceData, Transaction } from "./types";

const base = (tx: Transaction[], paid = false): FinanceData => ({
  accounts: [
    { id: "b", name: "Banco", kind: "bancaria", color: "", initialBalance: 1000 },
    { id: "i", name: "Inv", kind: "investimento", color: "", initialBalance: 0 },
  ],
  categories: [],
  cards: [{ id: "c", name: "C", limit: 1, closingDay: 1, dueDay: 1, color: "" }],
  cardPurchases: [{ id: "p", cardId: "c", date: "2026-10-02", description: "x", amount: 200, installment: 1, totalInstallments: 1, invoiceMonth: "2026-10", paid }],
  transactions: tx,
});
const t = (type: Transaction["type"], extra: Partial<Transaction> = {}): Transaction =>
  ({ id: type, date: "2026-10-05", description: type, amount: 100, type, accountId: "b", ...extra });

describe("regras financeiras", () => {
  it("aporte não é despesa e move saldo para investimento", () => {
    const d = base([t("aporte", { toAccountId: "i" })]);
    expect(monthFlow(d, "2026-10").despesas).toBe(200); // só a compra do cartão
    expect(summary(d).investido).toBe(100);
  });
  it("transferência não é receita nem despesa", () => {
    const f = monthFlow(base([t("transferencia", { toAccountId: "i" })]), "2026-10");
    expect(f.receitas).toBe(0);
    expect(f.despesas).toBe(200);
  });
  it("resgate não é receita", () => {
    expect(monthFlow(base([t("resgate", { accountId: "i", toAccountId: "b" })]), "2026-10").receitas).toBe(0);
  });
  it("informativo não altera patrimônio", () => {
    expect(summary(base([t("informativo")])).patrimonio).toBe(summary(base([])).patrimonio);
  });
  it("compra no cartão conta como despesa uma vez; fatura paga zera obrigação", () => {
    expect(monthFlow(base([], true), "2026-10").despesas).toBe(200);
    expect(summary(base([], true)).obrigacoes).toBe(0);
    expect(summary(base([], false)).obrigacoes).toBe(200);
  });
});
