import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { data } from 'react-router';

import { parseTransactions } from '@/lib/opanai.server';
import { chunkPages, findHeaderRow, groupRows } from '@/lib/parsing.server';
import type { Cell, Transaction } from '@/types/table';

import type { Route } from './+types/pdf-parsing';

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return data({ error: 'POST만 허용됩니다.' }, { status: 405 });
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const password = formData.get('password');

  if (!(file instanceof File)) {
    return data({ error: 'file 필드에 PDF 파일이 필요합니다.' }, { status: 400 });
  }

  try {
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

    const pageChunks = chunkPages(pages, 5);

    const transactions: Transaction[] = [];

    for (const chunk of pageChunks) {
      const content = await parseTransactions(JSON.stringify(chunk));

      if (!content) {
        continue;
      } else {
        const parsed = JSON.parse(content);
        transactions.push(...parsed);
      }
    }

    return data({ transactions });
  } catch (error) {
    console.error('PDF 파싱 실패:', error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('No password given')) {
      return data({ error: '비밀번호 보호된 PDF입니다.', requiresPassword: true }, { status: 401 });
    }

    return data({ error: errorMessage }, { status: 500 });
  }
}
