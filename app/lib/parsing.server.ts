import { type Cell } from '@/types/table';

export function groupRows(cells: Cell[], tolerance = 2): string[][] {
  // 위에서 아래 순으로 정렬
  const sorted = [...cells].sort((a, b) => b.y - a.y);

  const rows: Cell[][] = [];

  for (const cell of sorted) {
    // 같은 y값의 Row 찾기
    let row = rows.find((r) => Math.abs(r[0].y - cell.y) <= tolerance);

    if (!row) {
      row = [];
      rows.push(row);
    }

    row.push(cell);
  }

  // 각 Row를 x 순으로 정렬
  rows.forEach((row) => row.sort((a, b) => a.x - b.x));

  // text만 반환
  return rows.map((row) => row.map((cell) => cell.text));
}

const HEADER_KEYWORDS = ['거래일시', '거래일', '거래후잔액', '금액', '거래금액', '적요'];

function normalize(text: string): string {
  return text.replace(/\s+/g, '');
}

export function findHeaderRow(rows: string[][]): number {
  let bestIndex = -1;
  let bestScore = 0;

  for (let i = 0; i < rows.length; i++) {
    const normalizedRow = rows[i].map(normalize);

    const score = HEADER_KEYWORDS.filter((keyword) => normalizedRow.includes(keyword)).length;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  }

  return bestIndex;
}

export function chunkPages<T>(pages: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < pages.length; i += size) {
    chunks.push(pages.slice(i, i + size));
  }

  return chunks;
}
