import { IncomeCalculator } from '@/components/income-calculator';
import type { Transaction } from '@/components/income-calculator/types';

import type { Route } from './+types/home';

export function meta(_: Route.MetaArgs) {
  return [
    { title: '소득산정 계산기' },
    { name: 'description', content: '은행 거래내역 PDF → 월별 순수익 산출' },
  ];
}

/**
 * TODO: 이 함수에 실제 PDF 파싱 로직을 구현하세요.
 * pdfjs-dist 등을 사용해 file을 파싱하고 Transaction[] 을 반환하면 됩니다.
 */
async function parsePdf(_file: File): Promise<Transaction[]> {
  throw new Error('PDF 파싱 기능이 아직 구현되지 않았습니다.');
}

/**
 * TODO: xlsx 등을 사용해 엑셀 다운로드를 구현하세요.
 */
function downloadExcel(_rows: Transaction[]): void {
  alert('엑셀 다운로드를 구현해주세요.');
}

export default function Home() {
  return <IncomeCalculator parsePdf={parsePdf} downloadExcel={downloadExcel} />;
}
