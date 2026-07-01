export function getMonthKey(transactionDate?: string): string {
  if (!transactionDate) return 'unknown';
  return transactionDate.slice(0, 7);
}

export function isIncome(transactionType?: string): boolean {
  return transactionType === '입금';
}
