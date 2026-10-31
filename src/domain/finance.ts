// Pure financial calculations. No UI, no storage.
import type { FinanceData, Transaction } from "./types";

const monthKey = (iso: string) => iso.slice(0, 7);

/** Effect of a transaction on each account balance. */
export function accountBalances(data: FinanceData): Record<string, number> {
  const bal: Record<string, number> = {};
  for (const a of data.accounts) bal[a.id] = a.initialBalance;
  const add = (id: string | undefined, v: number) => {
    if (id && id in bal) bal[id] += v;
  };
  for (const t of data.transactions) {
    switch (t.type) {
      case "receita":
        add(t.accountId, t.amount);
        break;
      case "despesa":
        add(t.accountId, -t.amount);
        break;
      case "aporte": // bank -> investment, not an expense
      case "resgate": // investment -> bank, not income
      case "transferencia":
        add(t.accountId, -t.amount);
        add(t.toAccountId, t.amount);
        break;
      case "rendimento": // increases investment
        add(t.accountId, t.amount);
        break;
      case "ajuste": // signed, changes balance only
        add(t.accountId, t.amount);
        break;
      case "informativo": // no effect
        break;
    }
  }
  // Card invoice payments settle obligations: they reduce the bank balance
  // but are never counted as expenses (purchase was already the expense).
  return bal;
}

export function summary(data: FinanceData) {
  const bal = accountBalances(data);
  let banco = 0;
  let investido = 0;
  for (const a of data.accounts) {
    if (a.kind === "bancaria") banco += bal[a.id];
    else investido += bal[a.id];
  }
  const obrigacoes = data.cardPurchases.filter((p) => !p.paid).reduce((s, p) => s + p.amount, 0);
  return { banco, investido, obrigacoes, patrimonio: banco + investido - obrigacoes, balances: bal };
}

/** Income/expense for a month. Card purchases count as expense once, in purchase month. */
export function monthFlow(data: FinanceData, month: string) {
  let receitas = 0;
  let despesas = 0;
  for (const t of data.transactions) {
    if (monthKey(t.date) !== month) continue;
    if (t.type === "receita") receitas += t.amount;
    if (t.type === "despesa") despesas += t.amount;
  }
  for (const p of data.cardPurchases) {
    if (p.installment === 1 && monthKey(p.date) === month) despesas += p.amount * p.totalInstallments;
  }
  return { receitas, despesas, saldo: receitas - despesas };
}

export function lastMonths(ref: string, n: number): string[] {
  const [y, m] = ref.split("-").map(Number);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return out;
}

export function expensesByCategory(data: FinanceData, month: string) {
  const map: Record<string, number> = {};
  const push = (id: string | undefined, v: number) => {
    const k = id ?? "outros";
    map[k] = (map[k] ?? 0) + v;
  };
  data.transactions
    .filter((t) => t.type === "despesa" && monthKey(t.date) === month)
    .forEach((t) => push(t.categoryId, t.amount));
  data.cardPurchases
    .filter((p) => p.installment === 1 && monthKey(p.date) === month)
    .forEach((p) => push(p.categoryId, p.amount * p.totalInstallments));
  return Object.entries(map)
    .map(([categoryId, value]) => {
      const c = data.categories.find((x) => x.id === categoryId);
      return { categoryId, name: c?.name ?? "Outros", color: c?.color ?? "var(--muted-foreground)", value };
    })
    .sort((a, b) => b.value - a.value);
}

/** Net worth at end of each month (approximation: applies txs up to month end). */
export function patrimonyEvolution(data: FinanceData, months: string[]) {
  return months.map((m) => {
    const subset: FinanceData = {
      ...data,
      transactions: data.transactions.filter((t: Transaction) => monthKey(t.date) <= m),
      cardPurchases: data.cardPurchases.filter((p) => p.invoiceMonth <= m),
    };
    const s = summary(subset);
    return { month: m, patrimonio: s.patrimonio, investido: s.investido };
  });
}
