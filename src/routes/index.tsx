import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Wallet, PiggyBank, Receipt, Landmark, ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useFinance } from "@/hooks/use-finance";
import { summary, monthFlow, lastMonths, expensesByCategory, patrimonyEvolution } from "@/domain/finance";
import { REF_MONTH } from "@/data/mock";
import { formatBRL, monthShort, monthLong } from "@/lib/format";
import { StatCard, Panel } from "@/components/finance/StatCard";
import { PageHeader } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Patrimônio" },
      { name: "description", content: "Visão geral de saldos, investimentos, obrigações e patrimônio." },
      { property: "og:title", content: "Dashboard — Patrimônio" },
      { property: "og:description", content: "Visão geral de saldos, investimentos, obrigações e patrimônio." },
    ],
  }),
  component: Dashboard,
});

const tooltipStyle = {
  background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12,
  color: "var(--popover-foreground)", fontSize: 12,
};
const compact = (v: number) => `R$ ${(v / 1000).toFixed(0)}k`;

function Dashboard() {
  const { data } = useFinance();
  const s = useMemo(() => summary(data), [data]);
  const months = lastMonths(REF_MONTH, 6);
  const flow = monthFlow(data, REF_MONTH);
  const flowSeries = months.map((m) => ({ month: monthShort(m), ...monthFlow(data, m) }));
  const evo = patrimonyEvolution(data, months).map((e) => ({ ...e, month: monthShort(e.month) }));
  const cats = expensesByCategory(data, REF_MONTH);
  const catTotal = cats.reduce((a, c) => a + c.value, 0);

  return (
    <>
      <PageHeader title="Olá! Aqui está seu resumo" subtitle={monthLong(REF_MONTH)} />

      <div className="mb-6 rounded-3xl bg-hero p-6 text-primary-foreground shadow-card md:p-8">
        <p className="text-sm opacity-80">Patrimônio total</p>
        <p className="mt-2 font-display text-4xl font-semibold tabular md:text-5xl">{formatBRL(s.patrimonio)}</p>
        <div className="mt-6 flex flex-wrap gap-6 text-sm">
          <span className="flex items-center gap-1.5"><ArrowUpRight className="size-4" /> Receitas {formatBRL(flow.receitas)}</span>
          <span className="flex items-center gap-1.5"><ArrowDownRight className="size-4" /> Despesas {formatBRL(flow.despesas)}</span>
          <span className="opacity-80">Saldo do mês {formatBRL(flow.saldo)}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Saldo em contas" value={s.banco} icon={Wallet} />
        <StatCard label="Total investido" value={s.investido} icon={PiggyBank} tone="positive" />
        <StatCard label="Obrigações" value={s.obrigacoes} icon={Receipt} tone="negative" hint="Faturas de cartão em aberto" />
        <StatCard label="Patrimônio" value={s.patrimonio} icon={Landmark} hint="Contas + investimentos − obrigações" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Receitas x Despesas" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={flowSeries} barGap={6}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis tickFormatter={compact} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} width={56} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} formatter={(v: number) => formatBRL(v)} />
                <Bar dataKey="receitas" name="Receitas" fill="var(--positive)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesas" name="Despesas" fill="var(--negative)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Despesas por categoria">
          <div className="h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={cats} dataKey="value" nameKey="name" innerRadius={50} outerRadius={78} paddingAngle={2} stroke="none">
                  {cats.map((c) => <Cell key={c.categoryId} fill={c.color} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatBRL(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {cats.map((c) => (
              <li key={c.categoryId} className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: c.color }} />{c.name}</span>
                <span className="tabular text-muted-foreground">{((c.value / catTotal) * 100).toFixed(0)}% · {formatBRL(c.value)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Evolução patrimonial" className="lg:col-span-3">
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={evo}>
                <defs>
                  <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis tickFormatter={compact} tickLine={false} axisLine={false} stroke="var(--muted-foreground)" fontSize={12} width={56} domain={["dataMin - 5000", "auto"]} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatBRL(v)} />
                <Area type="monotone" dataKey="patrimonio" name="Patrimônio" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#gp)" />
                <Area type="monotone" dataKey="investido" name="Investido" stroke="var(--chart-2)" strokeWidth={2} fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
    </>
  );
}
