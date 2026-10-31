import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";

type Tone = "default" | "positive" | "negative";

export function StatCard({ label, value, icon: Icon, tone = "default", hint }: {
  label: string; value: number; icon: LucideIcon; tone?: Tone; hint?: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("flex size-9 items-center justify-center rounded-xl bg-muted text-foreground",
          tone === "positive" && "bg-positive-soft text-positive",
          tone === "negative" && "bg-negative-soft text-negative")}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className={cn("mt-3 font-display text-2xl font-semibold tabular",
        tone === "positive" && "text-positive", tone === "negative" && "text-negative")}>
        {formatBRL(value)}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, action, children, className }: {
  title: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border bg-card p-5 shadow-card", className)}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
