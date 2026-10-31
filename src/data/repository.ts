// Storage abstraction. Today: localStorage. Later: Electron IPC -> SQLite,
// implementing the same FinanceRepository interface.
import type { FinanceData } from "@/domain/types";
import { mockData } from "./mock";

export interface FinanceRepository {
  load(): FinanceData;
  save(data: FinanceData): void;
}

const KEY = "financas:data:v1";

export const localRepository: FinanceRepository = {
  load() {
    if (typeof window === "undefined") return mockData;
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as FinanceData) : mockData;
    } catch {
      return mockData;
    }
  },
  save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  },
};
