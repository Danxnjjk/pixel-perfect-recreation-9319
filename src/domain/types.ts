// Domain types — mirror future SQLite tables (Electron).
export type TransactionType =
  | "receita"
  | "despesa"
  | "aporte"
  | "rendimento"
  | "resgate"
  | "transferencia"
  | "ajuste"
  | "informativo";

export type AccountKind = "bancaria" | "investimento";

export interface Account {
  id: string;
  name: string;
  kind: AccountKind;
  color: string; // css color
  initialBalance: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string; // lucide icon name
}

export interface Transaction {
  id: string;
  date: string; // ISO yyyy-mm-dd
  description: string;
  amount: number; // always positive; sign derived from type (ajuste may be negative)
  type: TransactionType;
  categoryId?: string;
  accountId?: string; // origin account
  toAccountId?: string; // destination (transferencia / aporte / resgate)
  notes?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  color: string;
}

export interface CardPurchase {
  id: string;
  cardId: string;
  date: string;
  description: string;
  amount: number; // per installment
  installment: number;
  totalInstallments: number;
  categoryId?: string;
  invoiceMonth: string; // yyyy-mm
  paid: boolean; // invoice paid (settles obligation only)
}

export interface FinanceData {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  cards: CreditCard[];
  cardPurchases: CardPurchase[];
}

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  receita: "Receita",
  despesa: "Despesa",
  aporte: "Aporte",
  rendimento: "Rendimento",
  resgate: "Resgate",
  transferencia: "Transferência",
  ajuste: "Ajuste de saldo",
  informativo: "Informativo",
};
