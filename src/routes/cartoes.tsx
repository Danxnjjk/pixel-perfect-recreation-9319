import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ComingSoon } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/cartoes")({
  head: () => ({
    meta: [
      { title: "Cartões — Patrimônio" },
      { name: "description", content: "Limites, faturas, compras e parcelas." },
      { property: "og:title", content: "Cartões — Patrimônio" },
      { property: "og:description", content: "Limites, faturas, compras e parcelas." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Cartões" subtitle="Limites, faturas, compras e parcelas." />
      <ComingSoon items={["Cadastro de cartões e limites", "Compras parceladas", "Pagamento de faturas (sem gerar nova despesa)"]} />
    </>
  );
}
