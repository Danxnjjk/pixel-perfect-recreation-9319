import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { FinanceData } from "@/domain/types";
import { mockData } from "@/data/mock";
import { localRepository } from "@/data/repository";

const Ctx = createContext<{ data: FinanceData; setData: (d: FinanceData) => void } | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [data, setState] = useState<FinanceData>(mockData);
  useEffect(() => setState(localRepository.load()), []);
  const setData = (d: FinanceData) => {
    setState(d);
    localRepository.save(d);
  };
  return <Ctx.Provider value={{ data, setData }}>{children}</Ctx.Provider>;
}

export function useFinance() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useFinance outside FinanceProvider");
  return c;
}
