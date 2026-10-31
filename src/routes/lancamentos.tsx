import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { useFinance } from "@/hooks/use-finance";
import { TRANSACTION_TYPE_LABEL, type TransactionType } from "@/domain/types";
import { formatBRL, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/lancamentos")({
  head: () => ({
    meta: [
      { title: "Lançamentos — Patrimônio" },
      { name: "description", content: "Todas as suas movimentações financeiras em uma única tabela." },
      { property: "og:title", content: "Lançamentos — Patrimônio" },
      { property: "og:description", content: "Todas as suas movimentações financeiras em uma única tabela." },
    ],
  }),
  component: Lancamentos,
});

const sign = (t: TransactionType) =>
  t === "receita" || t === "rendimento" ? "positive" : t === "despesa" ? "negative" : "neutral";

function Lancamentos() {
  const { data } = useFinance();
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("todos");
  const rows = [...data.transactions]
    .filter((t) => (type === "todos" || t.type === type) && t.description.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));
  const cat = (id?: string) => data.categories.find((c) => c.id === id)?.name ?? "—";
  const acc = (id?: string) => data.accounts.find((c) => c.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader title="Lançamentos" subtitle={`${rows.length} movimentações`}>
        <div className="flex gap-2">
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
        </div>
      </PageHeader>
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-card">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-muted-foreground">
            <tr>{["Data", "Descrição", "Tipo", "Categoria", "Conta", "Valor"].map((h) => (
              <th key={h} className={cn("px-4 py-3 font-medium", h === "Valor" && "text-right")}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const s = sign(t.type);
              return (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 tabular text-muted-foreground">{formatDate(t.date)}</td>
                  <td className="px-4 py-3 font-medium">{t.description}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{TRANSACTION_TYPE_LABEL[t.type]}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{cat(t.categoryId)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{acc(t.accountId)}</td>
                  <td className={cn("px-4 py-3 text-right font-medium tabular",
                    s === "positive" && "text-positive", s === "negative" && "text-negative")}>
                    {s === "negative" ? "− " : s === "positive" ? "+ " : ""}{formatBRL(t.amount)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
