const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export const formatBRL = (v: number) => brl.format(v);

export const formatDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const MONTHS_FULL = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
export const monthShort = (ym: string) => MONTHS[Number(ym.slice(5, 7)) - 1];
export const monthLong = (ym: string) => `${MONTHS_FULL[Number(ym.slice(5, 7)) - 1]} de ${ym.slice(0, 4)}`;
