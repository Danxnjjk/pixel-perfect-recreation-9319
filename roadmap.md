# Roadmap

## Aguardando o envio do usuário (GitHub)
- [ ] Usuário sobe a pasta `src` do computador dele em lotes menores que 100 arquivos
      (o GitHub recusa mais de 100 por vez).
- [ ] Conferir se a prévia ficou igual à versão pronta que ele enviou (`dist`):
      tela Dados e backup, saldo do mês, regras de investimento, fontes locais.

## Feito nesta rodada
- [x] Conferir o envio do GitHub ("Add files via upload"): aplicativo Windows, banco SQLite,
      etapas, aplicativo pronto em `dist`.
- [x] Abrir a versão pronta e ver as 6 telas funcionando.
- [x] Consertar a prévia quebrada: tirar `src/server.ts` e `src/start.ts` (pediam o pacote
      que saiu do `package.json`) e criar `src/main.tsx` (a página estava em branco).

## Pendências que eu vi
- [ ] `src/routes/__root.tsx` do repositório ainda é a versão antiga (com `<html>` dentro da
      página) — precisa ser trocado pela versão dele.
- [ ] Decidir o que fazer com `dist` (foi enviado, mas está na lista de ignorados) e com o
      `package-lock.json` que ficou ao lado do `bun.lock`.
