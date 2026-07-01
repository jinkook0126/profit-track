export interface Cell {
  text: string;
  x: number;
  y: number;
}

export interface Row {
  y: number;
  cells: Cell[];
}

export interface Transaction {
  transactionDate?: string;
  transactionTime?: string;
  amount?: string;
  transactionType?: string;
  description?: string;
  note?: string;
}
