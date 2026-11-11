# Diário das etapas

## Etapa 0.0 — Base original (Lovable)
- Instalação, testes (6 de 6) e build funcionaram no Windows.

## Etapa 0.1 — App local, sem parte de servidor
- Removida a parte de servidor (TanStack Start, Nitro/Cloudflare, `server.ts`, `start.ts`) e os relatórios de erro do Lovable.
- Criados `index.html` e `src/main.tsx`; o app agora é uma página local simples.
- Rotas usam endereço com `#` (ex.: `#/lancamentos`) para funcionar dentro do Electron.
- Textos de erro/404 traduzidos para português.
- Removidos `bun.lock` e `bunfig.toml` (o projeto usa npm).
- Visual e regras financeiras: **sem alterações**.

- Conferido pelo usuário no Windows: instalação, testes (6 de 6), build e visual.

## Etapa 0.2 — Fontes offline e documentação
- Fontes Manrope e Sora agora vêm de pacotes locais (`@fontsource`), não do Google Fonts.
- Nenhum endereço de internet restante no código do app.
- README.md e AGENTS.md reescritos em português, sem referências ao Lovable.
- Visual e regras financeiras: **sem alterações**.

## Etapa 1, parte 1 — Dinheiro em centavos inteiros
- Novo `src/domain/money.ts`: `reaisToCents`, `parseMoneyInput` (lê "1.234,56" com regras rígidas), `isCents`, `assertCents`.
- Todos os valores (saldos iniciais, lançamentos, limites, parcelas) passam a ser centavos inteiros; `formatBRL` recebe centavos.
- Dashboard: eixo dos gráficos ajustado para centavos.
- Dados de exemplo (temporários) convertidos para centavos; chave do armazenamento mudou para `financas:data:v2`.
- Testes: de 6 para 45 (dinheiro, leitura de valores digitados, formatação, precisão e regras).
- Conferido: números do dashboard idênticos aos de antes. Visual: **sem alterações**.
- Ajuste visual: eixo vertical dos gráficos do Dashboard mais largo (rótulos como "R$ 120k" estavam cortados).

## Etapa 1, partes 2 e 3 — Modelo financeiro completo (sem mudar o visual)
- **Cartões:** a compra no cartão é guardada uma única vez (valor total + nº de parcelas + fatura da 1ª parcela). As parcelas são calculadas a partir dela (somam exatamente o total; centavos que sobram vão para as primeiras parcelas), então nunca ficam soltas.
- **Faturas:** calculadas por cartão e mês (aberta, fechada, paga, vencida). Compras até o dia do fechamento (inclusive) entram na fatura daquele mês.
- **Pagamento de fatura:** tira o valor de uma conta bancária e abate a obrigação do cartão; não é despesa. Não aceita pagar mais do que falta (impede pagamento em duplicidade). Corrige o erro do código original, em que "pagar" inflava o patrimônio.
- **Limite disponível:** limite menos tudo que ainda se deve (compras parceladas consomem o limite inteiro).
- **Validação por tipo de lançamento** (aporte exige destino de investimento, resgate vai para conta bancária, transferência só entre contas do mesmo tipo etc.): nenhum dinheiro "some".
- **Operações** (`src/domain/operations.ts`): criar, editar, arquivar e excluir contas, categorias, cartões, compras e pagamentos, com regras (conta/categoria/cartão usados são arquivados, não excluídos; aviso de lançamento duplicado).
- **Saldos "até hoje":** lançamentos de datas futuras não entram no saldo de hoje; evolução do patrimônio respeita o histórico.
- **Armazenamento assíncrono** (pronto para SQLite), com verificação de consistência ao carregar e cópia de segurança se os dados salvos estiverem ilegíveis.
- **O aplicativo agora começa vazio** (dados fictícios removidos). Dashboard e Lançamentos mostram estado vazio.
- Novo comando `npm.cmd run typecheck` (verificação de tipos).
- Testes: de 45 para mais de 120.

## Etapa 2 — Contas, categorias e lançamentos funcionando
- **Contas e categorias** (tela real): criar, editar, arquivar/reativar e excluir. Contas e categorias já usadas não são excluídas (são arquivadas, para manter o histórico). Botão opcional "Adicionar sugeridas" cria uma lista inicial de categorias (nada é criado sozinho).
- **Lançamentos** (tela real): criar, editar e excluir, com formulário que muda conforme o tipo (receita, despesa, aporte, resgate, transferência, rendimento, ajuste, informativo). Filtros por texto (ignora acentos), tipo, mês, conta e categoria, com totais do que está filtrado. Aviso de lançamento duplicado, com opção de confirmar.
- Valores digitados no padrão brasileiro (1.234,56); valor inválido é recusado com mensagem clara.
- Novos arquivos de regras (puros e testados): `forms.ts`, `queries.ts`, `suggestions.ts`, `palette.ts`.
- Mensagens de confirmação e aviso (toast) após cada ação; erros das regras aparecem no formulário.
- Dashboard: estado vazio com atalhos para cadastrar contas e lançamentos.
- Testes: 131 no total.
- Ainda NÃO feito (próximas etapas): Investimentos e Cartões (telas), SQLite/Electron, importação da planilha.

## Ajustes visuais do Dashboard
- **Hierarquia:** "Saldo em contas" ocupa o destaque no card grande; "Patrimônio total" virou um card menor (o card duplicado de Patrimônio foi removido). Total investido e Obrigações foram mantidos.
- **Total investido:** card mais largo com um gráfico dos rendimentos dos 3 meses mais recentes que têm rendimento lançado (somente dados reais; mostra aviso se não há rendimentos). Quando entra um mês novo com rendimento, o mais antigo sai. Meses diferenciados por intensidade de cor, valor sobre cada barra e tooltip.
- **Receitas x Despesas:** barras com degradê, legenda, valores sobre as barras, linha do saldo do mês, tooltip detalhado (receitas, despesas, saldo e % da receita que sobrou) e total do período.
- **Evolução patrimonial:** gráfico de linha/área com pontos e valores, períodos "Mês/ano", linha do investido como referência, tooltip com patrimônio, investido e variação do mês, e variação do período no cabeçalho.
- **Tema escuro:** o card grande ganhou uma cor de texto própria (`--hero-foreground`) que não depende do tema, corrigindo o texto escuro sobre fundo escuro. Textos e legendas dos gráficos passaram a usar as cores do tema.
- Nova regra pura e testada: `recentMonthlyYields` (rendimentos por mês). Nenhuma regra financeira existente mudou.

## Ajustes do Dashboard (2ª rodada)
- **Conferência do saldo em contas:** nenhum erro encontrado. Foram adicionados testes para cada regra (receita soma, despesa subtrai da conta que pagou, compra no cartão não mexe no saldo bancário, pagamento de fatura reduz a conta pagadora, transferência/aporte/resgate não mudam o total, lançamentos futuros não entram) e uma conferência com 300 lançamentos gerados. Nenhuma regra financeira foi alterada.
- **Cartão verde:** agora mostra "Saldo do mês" (receitas do mês − despesas do mês), com Receitas (verde) e Despesas (vermelho) em destaque abaixo, e o gráfico "Gastos por dia" ao lado.
- **Gastos por dia:** gráfico de linhas com os dias do mês, valores no eixo, os 3 dias de maior gasto destacados (ponto vermelho claro com valor) e tooltip com o valor exato. Usa despesas + compras no cartão (a soma dos dias é igual às despesas do mês); dias que ainda não chegaram ficam em branco.
- **Card "Patrimônio total" removido**; no lugar, **"Rendimento no mês"** (soma dos rendimentos lançados no mês selecionado).
- **Rendimentos dos últimos 3 meses:** agora em gráfico de linhas, só com rendimentos reais.
- **Navegação de meses** (novo) no topo do Dashboard: mês anterior/próximo (até o mês atual) e "Mês atual". O cartão verde, o rendimento do mês, os gastos por dia, as despesas por categoria, os saldos e os gráficos de 6 meses seguem o mês escolhido.
- Funções novas e testadas: `monthYield`, `dailyExpenses`, `topSpendingDays`, `earliestMonth`.

## Ajustes do Dashboard (3ª rodada) e Agendamentos
- **Cartão verde:** conteúdo centralizado na vertical; "Receitas do mês:" e "Despesas do mês:" (com dois-pontos). Abaixo, três valores diferentes: *Acumulado até o mês anterior*, *Saldo acumulado* (inicial + resultado do mês) e *Saldo real nas contas*.
- **Saldo acumulado:** `accumulatedBalance` soma o resultado (receitas − despesas) de cada mês aos anteriores. É só um cálculo: não lança receita nenhuma, então nada é contado duas vezes; meses sem movimento repetem o acumulado.
- **Total investido** (substitui o card de rendimento): legenda "↑ R$ X investidos em <mês anterior ao selecionado>" (soma só de aportes, sem rendimentos).
- **Rendimento acumulado:** janeiro até o mês selecionado, no mesmo ano (ex.: 100 + 150 + 200 = 450), com gráfico de linha dos 3 últimos meses com rendimento.
- **Gastos por dia:** gráfico de linha mantido; legenda no topo com as 3 maiores despesas individuais do mês (valor + descrição); essas 3 aparecem numeradas (1, 2, 3) no gráfico, sem valores nos demais pontos.
- **Cartões no Dashboard:** painel com faturas pagas no mês, fatura atual (total, pago, pendente), próximo vencimento e parcelas futuras, com a explicação data da compra × mês da fatura × data do pagamento.
- **Receitas x Despesas:** agora em duas linhas (estilo da evolução patrimonial), legenda centralizada fora do gráfico, escala automática do eixo, maior valor de cada linha em destaque. O gráfico de Evolução patrimonial saiu do Dashboard (o componente fica guardado para a tela de Investimentos).
- **Clicáveis:** cartão verde, pílulas de receitas/despesas, gráfico de gastos por dia, gráfico de Receitas x Despesas (mês clicado), categorias (fatia e lista), Total investido e Rendimento (Investimentos), Obrigações (Cartões). O mês escolhido fica no endereço e é levado junto.
- **Lançamentos:** resumo com mais espaço entre os indicadores (mantendo os pontos); filtros vindos do Dashboard.
- **Agendamentos** (nova aba em Lançamentos): cadastro (descrição, valor, tipo, categoria, conta, primeira data, frequência única/semanal/quinzenal/mensal/anual, data final), editar, pausar, reativar, excluir e ver os próximos pagamentos. Cada data é uma ocorrência com identificação própria (`<agendamento>@<data>`); quando o dia chega vira um lançamento comum (marcado com o ícone de agendamento), atualiza o saldo e nunca é registrada duas vezes (nem ao fechar e abrir o aplicativo). Ocorrências futuras aparecem em Lançamentos com sinal amarelo ("Agendado") e não mexem em saldo.
- Dados salvos passam para a versão 3 automaticamente (com cópia de segurança da versão anterior).
- Pendente: telas de Investimentos e Cartões (os atalhos já levam até elas, com o período), cadastro de compras no cartão, SQLite/Electron.

## Ajustes do Dashboard (4ª rodada)
- **Cartão verde:** o maior valor agora é o **Saldo acumulado** (resultado dos meses anteriores + o do mês selecionado). Removidos o Saldo do mês e as informações secundárias (acumulado até o mês anterior, saldo acumulado repetido, saldo real nas contas). Receitas e despesas ficam em duas caixas de tamanho fixo: o valor se ajusta (fonte responsiva) para caber, sem aumentar o cartão. Vermelho das despesas mais forte.
- **Gastos por dia:** voltou a ser só o gráfico de linha, no estilo dos outros (área suave, pontos, escala automática, tooltip, maior dia em destaque discreto). Sem legenda das 3 maiores despesas e sem marcadores numerados.
- **Total investido:** o valor é o acumulado até o mês selecionado e a legenda mostra apenas os aportes **daquele mesmo mês** (antes mostrava o mês anterior). Legenda menor, em uma linha. Nova função testada: `investmentCard`.
- **Rendimento acumulado:** ícone no canto superior direito (alinhado aos outros cards); valor alinhado com os demais; texto dos 3 últimos meses centralizado em relação ao gráfico.
- **Obrigações:** card com as mesmas dimensões dos demais (preenche a grade).
- **Lançamentos:** pagamentos agendados mostram "Agendado" (em vez de "Aguardando a data").
- A função `topExpenses` (3 maiores despesas) continua no domínio, testada, mas não é mais usada na tela.

## Ajustes do Dashboard (5ª rodada)
- **Total investido:** a legenda mostra só a seta e o valor dos aportes do mês selecionado (ex.: "↑ R$ 485,00"), em uma única linha, sem texto nem referência ao mês (a explicação fica no balão ao passar o mouse).
- **Rendimento acumulado:** o eixo vertical escondido do gráfico passou a não ocupar espaço (`width={0}`), então a área do gráfico fica simétrica e o título "Rendimentos dos últimos 3 meses" fica centralizado em relação a ela. Ícone, valor e tamanho do card não mudaram.

## Etapa 3 (parte 1) — Backup, banco SQLite e base do aplicativo Windows
- **Dados e backup** (nova tela no menu): mostra onde os dados estão guardados e quantos itens existem; **exporta** um backup (.json); **restaura** um backup com resumo antes de substituir (só aceita arquivos consistentes; backups da versão anterior são atualizados sozinhos); **apaga todos os dados** (digitando APAGAR). Antes de restaurar ou apagar, uma cópia dos dados atuais é baixada.
- **Banco SQLite** (`electron/sqlite-store.cjs`): usa o SQLite que já vem no Electron/Node (nada extra a instalar). Cada gravação troca todos os dados em uma única transação (grava tudo ou nada). O banco recusa valores em dinheiro que não sejam inteiros (centavos), tipos inválidos e identificadores repetidos. Cópia de segurança automática por dia (guarda as 30 mais recentes). Teste próprio: `npm run test:sqlite` (12 verificações).
- **Aplicativo Windows** (`electron/main.cjs`, `preload.cjs`): janela única, tela isolada do sistema (ponte com só 4 funções), links externos abrem no navegador. Modo de desenvolvimento: `npm run electron:dev`.
- **Armazenamento da tela:** escolhe sozinho: SQLite no aplicativo Windows, localStorage no navegador (`defaultRepository`).
- Pendente: gerar o instalador (.exe), telas de Investimentos e Cartões, cadastro de compras no cartão.

## Tela Cartões (completa)
- **Cartões:** criar, editar, arquivar/reativar e excluir (cartão com compras ou pagamentos é arquivado, não excluído). Cada cartão mostra o limite usado (todas as parcelas que faltam pagar), o disponível e uma barra de uso.
- **Compras no cartão:** criar, editar e excluir. O formulário mostra em qual fatura a compra cai (pelo dia de fechamento), a data de vencimento e a prévia das parcelas (somam exatamente o total); é possível escolher outra fatura para a 1ª parcela. A compra é despesa integral no mês da compra.
- **Faturas:** lista por mês (aberta, fechada, paga ou vencida) com total, pago e o que falta, datas de fechamento e vencimento e o detalhe de cada parcela. Filtro "pendentes / todas" (o atalho Obrigações do Dashboard abre as pendentes) e filtro por cartão.
- **Pagamento de fatura:** escolhe a conta bancária, a data e o valor (total ou parcial). Reduz o saldo da conta e quita a fatura, sem gerar despesa; nunca aceita pagar mais do que falta. Pagamentos podem ser estornados.
- Novas funções testadas: `installmentPreview`, `cardUsage`.

## Tela Investimentos (completa)
- **Resumo do mês selecionado** (setas de mês no topo; o Dashboard abre já no mês escolhido): total investido (até o fim do mês ou até hoje), aportes no mês, rendimento no mês e rendimento acumulado no ano.
- **Contas de investimento:** saldo, saldo inicial, aportes, resgates, rendimentos (total e do mês) e "ajustes e transferências". O saldo sempre fecha: inicial + aportes − resgates + rendimentos + outros.
- **Evolução do total investido** (12 meses): linha do total investido x linha do que foi aportado (saldo inicial + aportes − resgates). A distância entre as duas são os rendimentos acumulados.
- **Mês a mês:** aportes, resgates, rendimentos e total investido ao fim de cada mês (o mês escolhido fica destacado).
- **Movimentações:** aportes, resgates, rendimentos e os ajustes/transferências que tocam investimentos, com editar e excluir. Botões **Novo aporte**, **Registrar rendimento** e **Novo resgate** abrem o formulário já com o tipo escolhido (e a conta, quando só existe uma possível).
- Regras novas em `domain/investments.ts`, com testes (relatório por conta, evolução, tabela mensal, histórico).

## Acabamento final — fase 1 (Dashboard, saldo do mês, Lançamentos, barra lateral, backup)
- **Saldo do mês com sobra:** o maior valor do Dashboard é o saldo das contas bancárias no fim do mês; o que sobra de um mês vira o saldo inicial do seguinte ("Veio do mês anterior"), sem ser contado como receita. Meses sem movimento repetem o saldo. Verde quando positivo, vermelho quando negativo. (`monthLedger`; `monthFlow` e `expensesByCategory` aceitam data de corte.)
- **Dashboard reorganizado e compacto** (cabe na janela de um notebook sem rolar): linha 1 = saldo do mês + investimentos (total investido com aportes do mês, rendimento acumulado, evolução e rendimentos de 3 meses); linha 2 = Receitas x Despesas, despesas por categoria e Obrigações. O gráfico "Gastos por dia" saiu do Dashboard.
- **Obrigações:** só a fatura atual (a de vencimento mais próximo) com situação (Aberta/Fechada/Vencida) e vencimento; parcelas futuras ficam na tela Cartões. Textos explicativos sobre data da compra/mês da fatura removidos.
- **Cores e animações:** azul nos indicadores (verde só para saldo positivo), animações de entrada dos cards, transição entre páginas, gráficos animados. Tooltip de categorias legível no modo escuro.
- **Saudação** (Bom dia/Boa tarde/Boa noite pelo relógio do computador) e **frases** sobre a situação financeira por regras locais (`financialInsights`).
- **Backup no Dashboard:** indicador (em dia/antigo/nunca) e botão "Fazer backup"; a tela Dados e backup mostra data e hora do último backup (manual e automático).
- **Barra lateral:** fechada ao iniciar, aba selecionada destacada, "Contas e categorias" por último.
- **Lançamentos:** separadores de mês, agendamentos na posição da sua data, movimentos de investimento com menos destaque, rendimentos só na aba Investimentos, campo de valor com máscara (digitar números forma o valor), categoria Presentes e 16 cores para categorias.
- **Dados da planilha corrigidos** (arquivo de backup novo): itens de "Contas" do começo do mês foram para o cartão (faturas pagas) e a N-MultiFibra virou agendamento mensal até fevereiro de 2027. O Saldo do mês confere, mês a mês, com o "Saldo final" da planilha.

## Acabamento final — fase 1, ajustes
- **Cabeçalho:** só a saudação e o seletor de mês. As 2 frases foram para o meio do card Obrigações.
- **Linha de cima:** Saldo do mês mais estreito e mais alto, conteúdo centralizado na vertical, caixas de Receitas e Despesas menores; bloco de investimentos mais largo. Alturas das duas linhas ajustadas à altura da janela (sem rolagem, sem espaço vazio dentro dos cards).
- **Investimentos:** evolução igual à da aba Investimentos (total x linha pontilhada do aportado, maior valor em negrito e bolinha cheia); rendimentos dos últimos 6 meses no mesmo estilo; ícones pequenos (guardado e rendimento) ao lado dos números.
- **Despesas por categoria:** sem barra de rolagem horizontal, valores menores, % da maior categoria no centro da rosca na cor dela (com o nome pequeno embaixo).
- **Obrigações:** frases no meio e agendamentos no fim do card. **Correção:** os agendamentos eram sempre os de hoje; agora cada mês mostra só os seus (`scheduleOccurrencesInMonth`). Fatura atual, investimentos, saldos e rendimentos já usavam a data do mês escolhido.
- **Backup:** saiu do Dashboard. A logo do canto superior esquerdo é o indicador (verde = backup de hoje feito; escura = ainda não) e, ao clicar, faz o backup na hora com um check de confirmação. No aplicativo Windows o arquivo é salvo sozinho na pasta de backups (`electron/backup-files.cjs`, com teste próprio). A tela Dados e backup mostra data e hora do último backup.

## Ajustes finais do Dashboard (1c)
- Seletor de mês sem o "De" maiúsculo; barras de rolagem finas e discretas em todo o aplicativo (a branca do Windows ficava feia no modo escuro); linhas de baixo do Dashboard com altura proporcional à janela.
- **Gráfico de categorias:** compra parcelada agora entra com o valor da PARCELA de cada mês (R$ 1.000,00 em 4x = R$ 250,00 por mês), não a compra inteira (`monthlyExpensesByCategory`). "Despesas do mês" e Receitas x Despesas continuam pela regra combinada (compra inteira no mês da compra).
