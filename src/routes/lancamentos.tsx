import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useFinance } from "@/hooks/use-finance";
import { TRANSACTION_TYPE_LABEL, type Transaction, type TransactionType } from "@/domain/types";
import { inPeriod, upsertTransaction, deleteTransaction, type Period } from "@/domain/transactions";
import { REF_MONTH } from "@/data/mock";
import { formatBRL, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { TransactionDialog } from "@/components/finance/TransactionDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lancamentos")({
  head: () => ({
    meta: [
      { title: "Lançamentos — Patrimônio" },
      { name: "description", content: "Cadastre, edite e filtre suas movimentações financeiras por período." },
      { property: "og:title", content: "Lançamentos — Patrimônio" },
      { property: "og:description", content: "Cadastre, edite e filtre suas movimentações financeiras por período." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Lancamentos,
});

const sign = (t: TransactionType, amount: number) =>
  t === "receita" || t === "rendimento" || (t === "ajuste" && amount > 0) ? "positive"
    : t === "despesa" || (t === "ajuste" && amount < 0) ? "negative" : "neutral";

function Lancamentos() {
  const { data, setData } = useFinance();
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("todos");
  const [pk, setPk] = useState<Period["kind"]>("mes");
  const [month, setMonth] = useState(REF_MONTH);
  const [year, setYear] = useState(REF_MONTH.slice(0, 4));
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Transaction | undefined>();

  const period: Period = pk === "mes" ? { kind: "mes", month } : pk === "ano" ? { kind: "ano", year }
    : pk === "intervalo" ? { kind: "intervalo", from, to } : { kind: "todos" };
  const years = [...new Set(data.transactions.map((t) => t.date.slice(0, 4)))].sort().reverse();
  const rows = [...data.transactions]
    .filter((t) => inPeriod(t.date, period) && (type === "todos" || t.type === type)
      && t.description.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));
  const cat = (id?: string) => data.categories.find((c) => c.id === id)?.name ?? "—";
  const acc = (id?: string) => data.accounts.find((c) => c.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader title="Lançamentos" subtitle={`${rows.length} movimentações`}>
        <Button onClick={() => { setEditing(undefined); setOpen(true); }}><Plus /> Novo lançamento</Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar…" className="w-56 pl-9" />
        </div>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {Object.entries(TRANSACTION_TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={pk} onValueChange={(v) => setPk(v as Period["kind"])}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="mes">Mês</SelectItem>
            <SelectItem value="ano">Ano</SelectItem>
            <SelectItem value="intervalo">Período</SelectItem>
            <SelectItem value="todos">Tudo</SelectItem>
          </SelectContent>
        </Select>
        {pk === "mes" && <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="w-44" />}
        {pk === "ano" && (
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{(years.length ? years : [year]).map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
          </Select>
        )}
        {pk === "intervalo" && (
          <>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" aria-label="De" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" aria-label="Até" />
          </>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>{["Data", "Descrição", "Tipo", "Categoria", "Conta", "Valor", ""].map((h, i) => (
              <th key={i} className={cn("px-4 py-3 font-medium", h === "Valor" && "text-right")}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Nenhum lançamento neste período.</td></tr>
            )}
            {rows.map((t) => {
              const s = sign(t.type, t.amount);
              return (
                <tr key={t.id} className="group border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 tabular text-muted-foreground">{formatDate(t.date)}</td>
                  <td className="px-4 py-3 font-medium">{t.description}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{TRANSACTION_TYPE_LABEL[t.type]}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{cat(t.categoryId)}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {acc(t.accountId)}{t.toAccountId && ` → ${acc(t.toAccountId)}`}
                  </td>
                  <td className={cn("px-4 py-3 text-right font-medium tabular",
                    s === "positive" && "text-positive", s === "negative" && "text-negative")}>
                    {s === "negative" ? "− " : s === "positive" ? "+ " : ""}{formatBRL(Math.abs(t.amount))}
                  </td>
                  <td className="px-2 py-3 text-right whitespace-nowrap">
                    <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => { setEditing(t); setOpen(true); }}><Pencil /></Button>
                    <Button size="icon" variant="ghost" aria-label="Excluir" onClick={() => setToDelete(t)}><Trash2 /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <TransactionDialog open={open} onOpenChange={setOpen} data={data} initial={editing}
        onSave={(t) => setData(upsertTransaction(data, t))} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
            <AlertDialogDescription>“{toDelete?.description}” será removido e os saldos recalculados.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (toDelete) setData(deleteTransaction(data, toDelete.id)); setToDelete(undefined); }}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
