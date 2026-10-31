import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ComingSoon } from "@/components/layout/PageHeader";

export const Route = createFileRoute("/contas")({
  head: () => ({
    meta: [
      { title: "Contas e categorias — Patrimônio" },
      { name: "description", content: "Cadastre contas bancárias, de investimento e categorias." },
      { property: "og:title", content: "Contas e categorias — Patrimônio" },
      { property: "og:description", content: "Cadastre contas bancárias, de investimento e categorias." },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Contas e categorias" subtitle="Cadastre contas bancárias, de investimento e categorias." />
      <ComingSoon items={["Cadastro de contas bancárias", "Contas de investimento", "Categorias com cores e ícones"]} />
    </>
  );
}
