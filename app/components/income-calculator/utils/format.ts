export function fmt(n: number): string {
  return Math.round(n || 0).toLocaleString('ko-KR');
}

export function parseAmount(amount?: string | number): number {
  if (typeof amount === 'number') {
    return Number.isFinite(amount) ? amount : 0;
  }
  return Number((amount ?? '').replace(/,/g, '')) || 0;
}

export function formatDateTime(transactionDate?: string, transactionTime?: string): string {
  const date = transactionDate ?? '';
  const time = transactionTime ?? '';
  return [date, time].filter(Boolean).join(' ') || '—';
}
