import type { Transaction } from '@/types/table';

import type { MonthlyComputeResult } from '../types';
import { parseAmount } from './format';
import { getMonthKey, isIncome } from './transaction';

export function computeMonthly(rows: Transaction[]): MonthlyComputeResult {
  let tIn = 0;
  let tOut = 0;
  const mmap = new Map<string, { income: number; expense: number }>();

  for (const r of rows) {
    if (r.excluded) continue;
    const amount = parseAmount(r.amount);
    const monthKey = getMonthKey(r.transactionDate);

    if (isIncome(r.transactionType)) tIn += amount;
    else tOut += amount;

    const m = mmap.get(monthKey) ?? { income: 0, expense: 0 };
    if (isIncome(r.transactionType)) m.income += amount;
    else m.expense += amount;
    mmap.set(monthKey, m);
  }

  const monthly = [...mmap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { income, expense }]) => ({
      monthKey: key,
      monthLabel: key.replace('-', '.'),
      income,
      expense,
      net: income - expense,
    }));

  return { monthly, tIn, tOut };
}
