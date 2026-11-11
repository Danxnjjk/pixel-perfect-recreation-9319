# Regras para quem desenvolve este projeto

- Separar sempre: regras financeiras como funções puras em `src/domain`, armazenamento atrás da
  interface `FinanceRepository` em `src/data`, e tela em `src/components` e `src/routes`. Assim o
  armazenamento atual (navegador) poderá ser trocado por Electron + SQLite sem mexer nas telas.
- Funcionamento 100% offline; não usar serviços externos nem pagos.
- Dinheiro em centavos inteiros; nunca usar números decimais para valores.
- Evitar duplicidade: compra no cartão é despesa uma única vez; pagamento de fatura não é despesa.
- Não criar funcionalidades falsas; manter o design atual quando adequado.
- Avançar em etapas pequenas, registrando cada uma em `docs/etapas.md`.
