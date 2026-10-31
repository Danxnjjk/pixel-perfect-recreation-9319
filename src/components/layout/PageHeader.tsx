export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export function ComingSoon({ items }: { items: string[] }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
      <p className="font-display text-lg font-semibold">Em construção</p>
      <p className="mt-1 text-sm text-muted-foreground">Próximos recursos desta área:</p>
      <ul className="mx-auto mt-4 max-w-sm space-y-1 text-sm text-muted-foreground">
        {items.map((i) => <li key={i}>• {i}</li>)}
      </ul>
    </div>
  );
}
