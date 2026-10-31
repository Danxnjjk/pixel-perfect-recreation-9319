import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ComingSoon } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/investimentos")({
  head: () => ({
    meta: [
      { title: "Investimentos — Patrimônio" },
      { name: "description", content: "Acompanhe aportes, rendimentos e resgates." },
      { property: "og:title", content: "Investimentos — Patrimônio" },
      { property: "og:description", content: "Acompanhe aportes, rendimentos e resgates." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Investimentos" subtitle="Acompanhe aportes, rendimentos e resgates." />
      <ComingSoon items={["Saldo investido por conta", "Histórico de aportes e resgates", "Gráfico de evolução"]} />
    </>
  );
}
