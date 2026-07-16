import { IncomeCalculator } from '@/components/income-calculator';
import type { Transaction } from '@/types/table';

import type { Route } from './+types/index';

const PARSE_PDF_URL =
  'https://transaction-pdf-parser-api-976646049559.asia-northeast3.run.app/parse-bank-pdf';

export function meta(_: Route.MetaArgs) {
  return [
    { title: '소득산정 계산기' },
    { name: 'description', content: '은행 거래내역 PDF → 월별 순수익 산출' },
  ];
}

type PdfParsingResult = {
  transactions?: Transaction[];
  error?: string;
  detail?: string;
};

async function parsePdf(file: File, password?: string): Promise<Transaction[]> {
  const formData = new FormData();
  formData.append('file', file);
  if (password) {
    formData.append('password', password);
  }

  const response = await fetch(PARSE_PDF_URL, {
    method: 'POST',
    body: formData,
  });

  let result: PdfParsingResult | Transaction[] = {};
  try {
    result = await response.json();
  } catch {
    throw new Error('PDF 파싱 응답을 해석할 수 없습니다.');
  }

  if (!response.ok) {
    const errorResult = result as PdfParsingResult;
    throw new Error(errorResult.error ?? errorResult.detail ?? 'PDF 파싱에 실패했습니다.');
  }

  if (Array.isArray(result)) {
    return result;
  }

  return result.transactions ?? [];
}

export default function Home() {
  return <IncomeCalculator parsePdf={parsePdf} />;
}
