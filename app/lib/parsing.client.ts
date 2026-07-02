import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

import { type Cell } from '@/types/table';

GlobalWorkerOptions.workerSrc = pdfWorker;

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

/**
 * PDF 파일에서 거래 데이터 테이블 추출
 * 클라이언트 측에서 PDF를 로드하고 파싱하여 raw 데이터를 반환합니다.
 */
export async function extractPdfData(file: File, password?: string): Promise<string[][][]> {
  const pdfData = new Uint8Array(await file.arrayBuffer());
  const pdfOptions: Record<string, unknown> = { data: pdfData };
  if (password) pdfOptions.password = String(password);

  const pdf = await getDocument(pdfOptions).promise;

  const pages: string[][][] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const items = textContent.items.filter((item): item is TextItem => 'str' in item);

    const cells: Cell[] = items
      .map((item) => ({
        text: item.str.trim(),
        x: item.transform[4],
        y: item.transform[5],
      }))
      .filter((cell) => cell.text.length > 0);

    const rows = groupRows(cells);

    const headerIndex = findHeaderRow(rows);

    if (headerIndex === -1) {
      console.warn(`${pageNum}페이지에서 거래 헤더를 찾지 못했습니다.`);
      continue;
    }

    const transactionRows = rows.slice(headerIndex);

    pages.push(transactionRows);
  }

  return pages;
}
