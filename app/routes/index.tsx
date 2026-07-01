import { useCallback, useEffect, useRef } from 'react';
import { useFetcher } from 'react-router';

import { IncomeCalculator } from '@/components/income-calculator';
import type { Transaction } from '@/types/table';

import type { Route } from './+types/index';

export function meta(_: Route.MetaArgs) {
  return [
    { title: '소득산정 계산기' },
    { name: 'description', content: '은행 거래내역 PDF → 월별 순수익 산출' },
  ];
}

type PdfParsingResult = {
  transactions?: Transaction[];
  error?: string;
  requiresPassword?: boolean;
};

/**
 * TODO: xlsx 등을 사용해 엑셀 다운로드를 구현하세요.
 */
function downloadExcel(_rows: Transaction[]): void {
  alert('엑셀 다운로드 구현 예정');
}

export default function Home() {
  const fetcher = useFetcher<PdfParsingResult>();
  const pendingRef = useRef<{
    resolve: (rows: Transaction[]) => void;
    reject: (error: Error) => void;
  } | null>(null);

  useEffect(() => {
    if (fetcher.state !== 'idle' || !pendingRef.current) return;

    const pending = pendingRef.current;
    pendingRef.current = null;

    if (fetcher.data?.error) {
      const error = new Error(fetcher.data.error);
      if (fetcher.data.requiresPassword) {
        (error as any).requiresPassword = true;
      }
      pending.reject(error);
      return;
    }
    pending.resolve(fetcher.data?.transactions ?? []);
  }, [fetcher.state, fetcher.data]);

  const parsePdf = useCallback(
    (file: File, password?: string) => {
      if (fetcher.state !== 'idle') {
        return Promise.reject(new Error('이미 파싱이 진행 중입니다.'));
      }

      return new Promise<Transaction[]>((resolve, reject) => {
        pendingRef.current = { resolve, reject };

        const formData = new FormData();
        formData.append('file', file);
        if (password) formData.append('password', password);

        fetcher.submit(formData, {
          method: 'POST',
          action: '/api/pdf-parsing',
          encType: 'multipart/form-data',
        });
      });
    },
    [fetcher],
  );

  return <IncomeCalculator parsePdf={parsePdf} downloadExcel={downloadExcel} />;
}
