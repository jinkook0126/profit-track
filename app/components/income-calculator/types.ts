export type AppStatus = 'idle' | 'parsing' | 'error' | 'empty' | 'ready';

export interface Transaction {
  id: string;
  year: number;
  mon: number;
  date: string;
  monthKey: string;
  deposit: number;
  withdraw: number;
  desc: string;
  memo: string;
  gubun: '수입' | '지출';
}
