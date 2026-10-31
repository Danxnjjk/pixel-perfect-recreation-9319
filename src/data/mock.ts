import type { FinanceData, Transaction, CardPurchase } from "@/domain/types";

export const REF_MONTH = "2026-10";

const months = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];

function build(): FinanceData {
  const tx: Transaction[] = [];
  const cp: CardPurchase[] = [];
  let n = 0;
  const id = () => `t${++n}`;
  months.forEach((m, i) => {
    tx.push({ id: id(), date: `${m}-05`, description: "Salário", amount: 9200, type: "receita", categoryId: "salario", accountId: "nubank" });
    if (i % 2 === 0) tx.push({ id: id(), date: `${m}-18`, description: "Freelance design", amount: 1400 + i * 120, type: "receita", categoryId: "freela", accountId: "inter" });
    tx.push({ id: id(), date: `${m}-10`, description: "Aluguel", amount: 2300, type: "despesa", categoryId: "moradia", accountId: "nubank" });
    tx.push({ id: id(), date: `${m}-12`, description: "Supermercado", amount: 780 + (i % 3) * 95, type: "despesa", categoryId: "mercado", accountId: "nubank" });
    tx.push({ id: id(), date: `${m}-15`, description: "Conta de luz", amount: 190 + i * 8, type: "despesa", categoryId: "contas", accountId: "inter" });
    tx.push({ id: id(), date: `${m}-08`, description: "Aporte mensal", amount: 1500, type: "aporte", accountId: "nubank", toAccountId: "tesouro" });
    tx.push({ id: id(), date: `${m}-28`, description: "Rendimento CDB", amount: 210 + i * 14, type: "rendimento", accountId: "cdb" });
    tx.push({ id: id(), date: `${m}-01`, description: "Vale-refeição", amount: 900, type: "informativo", categoryId: "alimentacao" });
    cp.push({ id: `c${i}a`, cardId: "nucard", date: `${m}-03`, description: "Restaurantes", amount: 420 + i * 30, installment: 1, totalInstallments: 1, categoryId: "alimentacao", invoiceMonth: m, paid: i < 5 });
    cp.push({ id: `c${i}b`, cardId: "xp", date: `${m}-20`, description: "Combustível", amount: 310, installment: 1, totalInstallments: 1, categoryId: "transporte", invoiceMonth: m, paid: i < 5 });
  });
  tx.push({ id: id(), date: "2026-09-14", description: "Resgate p/ viagem", amount: 2000, type: "resgate", accountId: "cdb", toAccountId: "nubank" });
  tx.push({ id: id(), date: "2026-10-16", description: "Transferência entre contas", amount: 500, type: "transferencia", accountId: "nubank", toAccountId: "inter" });
  tx.push({ id: id(), date: "2026-10-22", description: "Lazer — cinema", amount: 140, type: "despesa", categoryId: "lazer", accountId: "inter" });

  return {
    accounts: [
      { id: "nubank", name: "Nubank", kind: "bancaria", color: "oklch(0.55 0.2 300)", initialBalance: 6200 },
      { id: "inter", name: "Banco Inter", kind: "bancaria", color: "oklch(0.7 0.17 55)", initialBalance: 2100 },
      { id: "tesouro", name: "Tesouro Direto", kind: "investimento", color: "oklch(0.55 0.1 240)", initialBalance: 28000 },
      { id: "cdb", name: "CDB 110% CDI", kind: "investimento", color: "oklch(0.6 0.13 160)", initialBalance: 19500 },
    ],
    categories: [
      { id: "salario", name: "Salário", color: "var(--chart-2)", icon: "Briefcase" },
      { id: "freela", name: "Freelance", color: "var(--chart-4)", icon: "Laptop" },
      { id: "moradia", name: "Moradia", color: "var(--chart-1)", icon: "Home" },
      { id: "mercado", name: "Mercado", color: "var(--chart-3)", icon: "ShoppingCart" },
      { id: "contas", name: "Contas", color: "var(--chart-4)", icon: "Zap" },
      { id: "alimentacao", name: "Alimentação", color: "var(--chart-5)", icon: "Utensils" },
      { id: "transporte", name: "Transporte", color: "var(--chart-2)", icon: "Car" },
      { id: "lazer", name: "Lazer", color: "var(--muted-foreground)", icon: "Popcorn" },
    ],
    transactions: tx,
    cards: [
      { id: "nucard", name: "Nubank Ultravioleta", limit: 12000, closingDay: 3, dueDay: 10, color: "oklch(0.45 0.18 300)" },
      { id: "xp", name: "XP Visa Infinite", limit: 18000, closingDay: 25, dueDay: 5, color: "oklch(0.25 0.02 250)" },
    ],
    cardPurchases: cp,
  };
}

export const mockData: FinanceData = build();
