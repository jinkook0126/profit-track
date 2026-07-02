import { data } from 'react-router';

import { parseTransactions } from '@/lib/opanai.server';
import type { Transaction } from '@/types/table';

import type { Route } from './+types/pdf-parsing';

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== 'POST') {
    return data({ error: 'POST만 허용됩니다.' }, { status: 405 });
  }

  const formData = await request.formData();
  const dataStr = formData.get('data');

  if (typeof dataStr !== 'string') {
    return data({ error: 'data 필드에 JSON 문자열이 필요합니다.' }, { status: 400 });
  }

  try {
    const pageChunks = JSON.parse(dataStr) as string[][];

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

    transactions.sort((a, b) => {
      const dateA = a.transactionDate ?? '';
      const dateB = b.transactionDate ?? '';
      return dateB.localeCompare(dateA);
    });

    return data({ transactions });
  } catch (error) {
    console.error('거래 데이터 파싱 실패:', error);
    const message =
      error instanceof Error ? error.message : '거래 데이터 파싱 중 오류가 발생했습니다.';
    return data({ error: message }, { status: 500 });
  }
}
