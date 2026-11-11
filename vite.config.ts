// Configuração do Vite para um aplicativo local (sem servidor), pronto para o Electron.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import path from "node:path";

export default defineConfig({
  // "./" faz os arquivos serem encontrados também quando abertos direto do disco (Electron).
  base: "./",
  plugins: [
    // O plugin de rotas precisa vir antes do plugin do React.
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
