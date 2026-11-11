# Patrimônio — controle financeiro pessoal

Aplicativo de controle financeiro pessoal em português do Brasil, pensado para funcionar
**totalmente offline** no Windows (futuramente com Electron + SQLite).
A interface inicial foi criada com o Lovable; o desenvolvimento continua a partir daqui.

## Como usar durante o desenvolvimento

No terminal do VS Code, dentro da pasta do projeto (a que contém o `package.json`):

| Comando | Para que serve |
|---|---|
| `npm.cmd install` | Instala as bibliotecas (só na primeira vez ou quando o `package.json` mudar) |
| `npm.cmd run dev` | Abre o app em `http://localhost:5173/` para testar |
| `npm.cmd test` | Roda os testes das regras financeiras |
| `npm.cmd run build` | Gera a versão final na pasta `dist` |

## Aplicativo Windows (Electron + SQLite)

Os dados do aplicativo Windows ficam em um **banco SQLite no computador**, sem internet (pasta `%APPDATA%\patrimonio`),
com uma cópia de segurança automática por dia. No navegador os dados ficam no `localStorage` (temporário).

| Comando | Para que serve |
|---|---|
| `npm.cmd install --save-dev electron` | Instala o Electron (uma vez só) |
| `npm.cmd run test:sqlite` | Testa o banco de dados SQLite sozinho |
| `npm.cmd run electron:dev` | Abre o aplicativo Windows em modo de desenvolvimento |
| `npm.cmd run electron:start` | Gera a tela final e abre o aplicativo como ele ficará instalado |

Para levar os dados de teste do navegador para o aplicativo Windows: no navegador, **Dados e backup → Baixar backup**; no
aplicativo, **Dados e backup → Escolher arquivo de backup**.

## Organização do código

- `src/domain/` — regras financeiras (cálculos), sem tela e sem armazenamento.
- `src/data/` — armazenamento dos dados (navegador: localStorage; aplicativo Windows: SQLite, pela ponte do Electron).
- `electron/` — janela do aplicativo Windows, ponte segura e banco SQLite (`sqlite-store.cjs`, com teste próprio).
- `src/routes/` e `src/components/` — telas e componentes visuais.
- `src/test/` — testes automáticos.
- `docs/etapas.md` — diário de cada etapa do desenvolvimento.

## Princípios do projeto

- Sem serviços externos ou pagos (nada de Supabase, Firebase etc.); tudo local.
- Valores em dinheiro em centavos inteiros.
- Compra no cartão conta como despesa uma única vez; pagar a fatura não gera nova despesa.
- Nada de funcionalidade falsa: o que aparece na tela precisa funcionar de verdade.
