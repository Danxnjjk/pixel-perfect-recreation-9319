import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TRANSACTION_TYPE_LABEL, type FinanceData, type Transaction, type TransactionType } from "@/domain/types";
import { needsDestination } from "@/domain/transactions";

const NONE = "__none";

export function TransactionDialog({
  open, onOpenChange, data, initial, onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  data: FinanceData;
  initial?: Transaction | undefined;
  onSave: (t: Transaction) => void;
}) {
  const blank = (): Transaction => ({
    id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), description: "",
    amount: 0, type: "despesa", accountId: data.accounts[0]?.id,
  });
  const [t, setT] = useState<Transaction>(initial ?? blank());
  const [amount, setAmount] = useState("");
  useEffect(() => {
    if (open) {
      const v = initial ?? blank();
      setT(v);
      setAmount(v.amount ? String(v.amount).replace(".", ",") : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const set = (p: Partial<Transaction>) => setT((x) => ({ ...x, ...p }));
  const value = Number(amount.replace(/\./g, "").replace(",", "."));
  const dest = needsDestination(t.type);
  const valid = t.description.trim() && t.date && !Number.isNaN(value) && value !== 0
    && (t.type === "ajuste" || value > 0) && (t.type === "informativo" || t.accountId)
    && (!dest || (t.toAccountId && t.toAccountId !== t.accountId));

  const submit = () => {
    if (!valid) return;
    onSave({ ...t, description: t.description.trim(), amount: value, toAccountId: dest ? t.toAccountId : undefined });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{initial ? "Editar lançamento" : "Novo lançamento"}</DialogTitle></DialogHeader>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Descrição</Label>
            <Input value={t.description} onChange={(e) => set({ description: e.target.value })} autoFocus />
          </div>
          <div className="grid gap-1.5">
            <Label>Tipo</Label>
            <Select value={t.type} onValueChange={(v) => set({ type: v as TransactionType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TRANSACTION_TYPE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Valor (R$){t.type === "ajuste" && " — use − para reduzir"}</Label>
            <Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" />
          </div>
          <div className="grid gap-1.5">
            <Label>Data</Label>
            <Input type="date" value={t.date} onChange={(e) => set({ date: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label>Categoria</Label>
            <Select value={t.categoryId ?? NONE} onValueChange={(v) => set({ categoryId: v === NONE ? undefined : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Sem categoria</SelectItem>
                {data.categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>{dest ? "Conta de origem" : "Conta"}</Label>
            <Select value={t.accountId ?? NONE} onValueChange={(v) => set({ accountId: v === NONE ? undefined : v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>Nenhuma</SelectItem>
                {data.accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {dest && (
            <div className="grid gap-1.5">
              <Label>Conta de destino</Label>
              <Select value={t.toAccountId ?? NONE} onValueChange={(v) => set({ toAccountId: v === NONE ? undefined : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Escolha…</SelectItem>
                  {data.accounts.filter((a) => a.id !== t.accountId).map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={!valid}>Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
