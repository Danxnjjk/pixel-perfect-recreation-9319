// Arquivo que abre o aplicativo: cria o roteador e mostra a tela no navegador.
// Sem servidor, sem internet — tudo funciona local, inclusive dentro do aplicativo Windows.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { createRouter, createHashHistory, RouterProvider } from "@tanstack/react-router";

import { routeTree } from "./routeTree.gen";
import "./styles.css";

const queryClient = new QueryClient();

// Endereço com "#" (ex.: ./index.html#/cartoes) para funcionar também aberto direto do disco.
const router = createRouter({
  routeTree,
  context: { queryClient },
  history: createHashHistory(),
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Faltou o elemento root na página.");

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
