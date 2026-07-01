import { useCallback, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/types/table';

import type { AppStatus } from './types';

// ---------- helpers ----------

function fmt(n: number): string {
  return Math.round(n || 0).toLocaleString('ko-KR');
}

function parseAmount(amount?: string): number {
  return Number((amount ?? '').replace(/,/g, '')) || 0;
}

function formatDateTime(transactionDate?: string, transactionTime?: string): string {
  const date = transactionDate ?? '';
  const time = transactionTime ?? '';
  return [date, time].filter(Boolean).join(' ') || '—';
}

function getMonthKey(transactionDate?: string): string {
  if (!transactionDate) return 'unknown';
  return transactionDate.slice(0, 7);
}

function isIncome(transactionType?: string): boolean {
  return transactionType === '입금';
}

function computeMonthly(rows: Transaction[]) {
  let tIn = 0;
  let tOut = 0;
  const mmap = new Map<string, { income: number; expense: number }>();

  for (const r of rows) {
    const amount = parseAmount(r.amount);
    const monthKey = getMonthKey(r.transactionDate);

    if (isIncome(r.transactionType)) tIn += amount;
    else tOut += amount;

    const m = mmap.get(monthKey) ?? { income: 0, expense: 0 };
    if (isIncome(r.transactionType)) m.income += amount;
    else m.expense += amount;
    mmap.set(monthKey, m);
  }

  const monthly = [...mmap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, { income, expense }]) => ({
      monthKey: key,
      monthLabel: key.replace('-', '.'),
      income,
      expense,
      net: income - expense,
    }));

  return { monthly, tIn, tOut };
}

// ---------- Stepper ----------

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const labels = ['PDF 업로드', '거래내역 확인', '월별 순수익 산출'];
  return (
    <div className="mb-7 flex flex-wrap items-center justify-center gap-3.5">
      {([1, 2, 3] as const).map((n) => {
        const active = n === step;
        const done = n < step;
        return (
          <div key={n} className="flex items-center gap-2.5">
            <div
              className={cn(
                'flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-[13.5px] font-bold transition-all duration-200',
                active && 'bg-[#123a78] text-white shadow-[0_4px_10px_rgba(18,58,120,.3)]',
                done && 'bg-[#3f78d6] text-white',
                !active && !done && 'border border-[#d4dbe6] bg-white text-[#9aa6b8]',
              )}
            >
              {done ? '✓' : n}
            </div>
            <span
              className={cn(
                'text-[13px]',
                active && 'font-extrabold text-[#16223a]',
                done && 'font-semibold text-[#3f78d6]',
                !active && !done && 'font-semibold text-[#9aa6b8]',
              )}
            >
              {labels[n - 1]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Upload zone ----------

function UploadZone({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | null | undefined) => {
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[18px] border-2 border-dashed bg-white px-8 py-16 text-center transition-all duration-150 outline-none',
        dragging
          ? 'border-[#3f78d6] bg-[#f7faff]'
          : 'border-[#b9c8e2] hover:border-[#3f78d6] hover:bg-[#f7faff]',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf1fd] font-mono text-[15px] font-extrabold tracking-wide text-[#123a78]">
        PDF
      </div>
      <div>
        <p className="mb-1.5 text-[17px] font-extrabold text-[#16223a]">
          거래내역 PDF를 업로드하세요
        </p>
        <p className="text-[13px] leading-relaxed text-[#6b7a90]">
          이 영역에 파일을 끌어다 놓거나 클릭해서 선택합니다.
          <br />
          은행에서 내려받은 거래내역서 PDF를 지원합니다.
        </p>
      </div>
      <span className="mt-1 rounded-[10px] bg-[#123a78] px-[22px] py-[11px] text-[13.5px] font-bold text-white shadow-[0_4px_12px_rgba(18,58,120,.28)]">
        파일 선택
      </span>
    </div>
  );
}

// ---------- Status panels ----------

function ParsingPanel({ fileName }: { fileName: string }) {
  return (
    <div className="flex flex-col items-center gap-[18px] rounded-[18px] border border-[#e1e8f2] bg-white px-8 py-14">
      <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#e3ebf7] border-t-[#123a78]" />
      <div className="text-center">
        <p className="text-[15.5px] font-bold">거래내역을 추출하는 중…</p>
        <p className="mt-1.5 text-[12.5px] text-[#6b7a90]">{fileName}</p>
      </div>
    </div>
  );
}

function ErrorPanel({ message, onReset }: { message: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3.5 rounded-[18px] border border-[#f2d5d0] bg-white px-8 py-11 text-center">
      <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#fdecea] text-[26px] font-extrabold text-[#bb3525]">
        !
      </div>
      <p className="text-[15.5px] font-bold">PDF를 처리하지 못했습니다</p>
      <p className="max-w-[420px] text-[12.5px] leading-relaxed text-[#6b7a90]">{message}</p>
      <button
        onClick={onReset}
        className="mt-1.5 cursor-pointer rounded-[9px] bg-[#123a78] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#0d2f63]"
      >
        다시 시도
      </button>
    </div>
  );
}

function EmptyPanel({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3.5 rounded-[18px] border border-[#e1e8f2] bg-white px-8 py-11 text-center">
      <div className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[#fff5e6] text-[26px] font-extrabold text-[#b5790f]">
        ?
      </div>
      <p className="text-[15.5px] font-bold">표 형식의 거래내역을 찾지 못했습니다</p>
      <p className="max-w-[460px] text-[12.5px] leading-relaxed text-[#6b7a90]">
        이미지로만 스캔된 PDF이거나 거래내역 표 구조가 인식되지 않았습니다. 텍스트가 선택
        가능한(복사되는) 거래내역서 PDF인지 확인해 주세요.
      </p>
      <button
        onClick={onReset}
        className="mt-1.5 cursor-pointer rounded-[9px] bg-[#123a78] px-5 py-2.5 text-[13px] font-bold text-white hover:bg-[#0d2f63]"
      >
        다른 파일 올리기
      </button>
    </div>
  );
}

// ---------- Gubun pill toggle ----------

function GubunPill({
  kind,
  active,
  onClick,
}: {
  kind: '수입' | '지출';
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        'cursor-pointer rounded-full border px-[11px] py-[3px] text-[11.5px] leading-[1.4] font-bold transition-all duration-150',
        kind === '수입'
          ? active
            ? 'border-[#1f8a5b] bg-[#e7f6ee] text-[#147a4d]'
            : 'border-[#dce3ee] bg-white text-[#a6b1c2]'
          : active
            ? 'border-[#d3503f] bg-[#fdecea] text-[#bb3525]'
            : 'border-[#dce3ee] bg-white text-[#a6b1c2]',
      )}
    >
      {kind}
    </button>
  );
}

// ---------- Main component ----------

interface State {
  status: AppStatus;
  fileName: string;
  rows: Transaction[];
  showSummary: boolean;
  errorMsg: string;
}

const INITIAL: State = {
  status: 'idle',
  fileName: '',
  rows: [],
  showSummary: false,
  errorMsg: '',
};

export interface IncomeCalculatorProps {
  /**
   * PDF 파싱 구현체를 여기에 주입하세요.
   * file을 받아 Transaction[] 을 반환하는 async 함수입니다.
   */
  parsePdf: (file: File) => Promise<Transaction[]>;
  /**
   * 엑셀 다운로드 구현체 (선택). 없으면 버튼이 비활성화됩니다.
   */
  downloadExcel?: (rows: Transaction[]) => void;
}

export function IncomeCalculator({ parsePdf, downloadExcel }: IncomeCalculatorProps) {
  const [state, setState] = useState<State>(INITIAL);

  const reset = useCallback(() => setState(INITIAL), []);

  const setGubun = useCallback((index: number, gubun: '수입' | '지출') => {
    setState((s) => ({
      ...s,
      rows: s.rows.map((r, i) =>
        i === index ? { ...r, transactionType: gubun === '수입' ? '입금' : '출금' } : r,
      ),
    }));
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
        setState({
          ...INITIAL,
          status: 'error',
          fileName: file.name,
          errorMsg: 'PDF 파일만 업로드할 수 있습니다.',
        });
        return;
      }
      setState({ ...INITIAL, status: 'parsing', fileName: file.name });
      try {
        const rows = await parsePdf(file);
        if (!rows.length) {
          setState((s) => ({ ...s, status: 'empty' }));
        } else {
          setState((s) => ({ ...s, status: 'ready', rows }));
        }
      } catch (e) {
        setState((s) => ({
          ...s,
          status: 'error',
          errorMsg: e instanceof Error ? e.message : String(e),
        }));
      }
    },
    [parsePdf],
  );

  const { monthly, tIn, tOut } = computeMonthly(state.rows);
  const activeStep: 1 | 2 | 3 = state.status === 'ready' ? (state.showSummary ? 3 : 2) : 1;

  return (
    <div className="flex min-h-screen flex-col bg-[#eef1f6] font-sans text-[#16223a] antialiased">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-[#123a78] text-white shadow-[0_1px_0_rgba(255,255,255,.08),0_6px_18px_rgba(12,38,80,.18)]">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-3.5 px-7">
          <div className="flex items-end gap-[3px] rounded-[9px] bg-white p-[9px_10px] shadow-[inset_0_0_0_1px_rgba(18,58,120,.08)]">
            <div className="h-[11px] w-[5px] rounded-[1.5px] bg-[#9cc0f5]" />
            <div className="h-[17px] w-[5px] rounded-[1.5px] bg-[#3f78d6]" />
            <div className="h-[23px] w-[5px] rounded-[1.5px] bg-[#123a78]" />
          </div>
          <div className="flex flex-col leading-[1.2]">
            <span className="text-[17px] font-extrabold tracking-tight">소득산정 계산기</span>
            <span className="text-[11.5px] font-medium text-[#aec4e8]">
              은행 거래내역 PDF → 월별 순수익 산출
            </span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto w-full max-w-[1240px] flex-1 px-7 pt-[30px] pb-14">
        <Stepper step={activeStep} />

        {/* Idle */}
        {state.status === 'idle' && <UploadZone onFile={handleFile} />}

        {/* Parsing */}
        {state.status === 'parsing' && <ParsingPanel fileName={state.fileName} />}

        {/* Error */}
        {state.status === 'error' && <ErrorPanel message={state.errorMsg} onReset={reset} />}

        {/* Empty */}
        {state.status === 'empty' && <EmptyPanel onReset={reset} />}

        {/* Ready */}
        {state.status === 'ready' && (
          <div className="flex animate-[scfade_.35s_ease] flex-col gap-5">
            {/* File info bar */}
            <div className="flex items-center gap-3 rounded-xl border border-[#e1e8f2] bg-white px-4 py-3">
              <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-[#eaf1fd] font-mono text-[11px] font-extrabold text-[#123a78]">
                PDF
              </div>
              <div className="min-w-0 flex-1 leading-[1.3]">
                <p className="max-w-[520px] overflow-hidden text-[13.5px] font-bold text-ellipsis whitespace-nowrap">
                  {state.fileName}
                </p>
                <p className="text-[11.5px] text-[#6b7a90]">
                  {state.rows.length}건의 거래내역을 추출했습니다
                </p>
              </div>
              <button
                onClick={reset}
                className="ml-auto cursor-pointer rounded-lg border border-[#dde4ee] bg-[#f1f4f9] px-3.5 py-2 text-[12.5px] font-semibold text-[#42526b] hover:bg-[#e7ecf4]"
              >
                다른 파일 올리기
              </button>
            </div>

            {/* Transaction table */}
            <div className="overflow-hidden rounded-[14px] border border-[#e1e8f2] bg-white shadow-[0_1px_3px_rgba(20,40,80,.05)]">
              {/* Table toolbar */}
              <div className="flex flex-wrap items-center gap-3.5 border-b border-[#eef2f7] px-[18px] py-[15px]">
                <span className="text-[15px] font-extrabold tracking-tight">거래내역</span>
                <Badge className="bg-[#f1f4f9] px-2.5 py-0.5 text-[12px] font-semibold text-[#6b7a90] hover:bg-[#f1f4f9]">
                  {state.rows.length}건
                </Badge>
                <div className="ml-auto flex flex-wrap gap-2.5">
                  <div className="flex items-center gap-1.5 rounded-[9px] border border-[#cdeede] bg-[#e9f7f0] px-3 py-1.5">
                    <span className="text-[11px] font-bold text-[#147a4d]">총 수입</span>
                    <span className="text-[13.5px] font-extrabold text-[#0f6b41] tabular-nums">
                      {fmt(tIn)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-[9px] border border-[#f5d3cd] bg-[#fdeeec] px-3 py-1.5">
                    <span className="text-[11px] font-bold text-[#bb3525]">총 지출</span>
                    <span className="text-[13.5px] font-extrabold text-[#a82e20] tabular-nums">
                      {fmt(tOut)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-[9px] border border-[#cfddf6] bg-[#eaf1fd] px-3 py-1.5">
                    <span className="text-[11px] font-bold text-[#123a78]">순수익</span>
                    <span className="text-[13.5px] font-extrabold text-[#123a78] tabular-nums">
                      {fmt(tIn - tOut)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable rows */}
              <div className="max-h-[460px] overflow-auto">
                <Table className="text-[13px]">
                  <TableHeader>
                    <TableRow className="sticky top-0 z-[2] bg-[#f4f7fc] hover:bg-[#f4f7fc]">
                      <TableHead className="border-b border-[#e1e8f2] py-[11px] pr-3.5 pl-3.5 text-[11.5px] font-bold whitespace-nowrap text-[#5c6b82]">
                        거래일자
                      </TableHead>
                      <TableHead className="border-b border-[#e1e8f2] py-[11px] pr-3.5 pl-3.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#5c6b82]">
                        구분
                      </TableHead>
                      <TableHead className="border-b border-[#e1e8f2] py-[11px] pr-3.5 pl-3.5 text-[11.5px] font-bold text-[#5c6b82]">
                        적요 / 내용
                      </TableHead>
                      <TableHead className="border-b border-[#e1e8f2] py-[11px] pr-3.5 pl-3.5 text-right text-[11.5px] font-bold whitespace-nowrap text-[#147a4d]">
                        입금액
                      </TableHead>
                      <TableHead className="border-b border-[#e1e8f2] py-[11px] pr-3.5 pl-3.5 text-right text-[11.5px] font-bold whitespace-nowrap text-[#bb3525]">
                        출금액
                      </TableHead>
                      <TableHead className="border-b border-[#e1e8f2] py-[11px] pr-3.5 pl-3.5 text-[11.5px] font-bold whitespace-nowrap text-[#5c6b82]">
                        거래처 / 메모
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {state.rows.map((row, i) => (
                      <TableRow
                        key={`${row.transactionDate}-${row.transactionTime}-${i}`}
                        className={cn(
                          'border-b border-[#f0f3f8] hover:bg-transparent',
                          i % 2 === 1 ? 'bg-[#fafbfd]' : 'bg-white',
                        )}
                      >
                        <TableCell className="py-2.5 pr-3.5 pl-3.5 whitespace-nowrap text-[#42526b] tabular-nums">
                          {formatDateTime(row.transactionDate, row.transactionTime)}
                        </TableCell>
                        <TableCell className="py-2.5 pr-3.5 pl-3.5">
                          <div className="flex justify-center gap-1.5">
                            <GubunPill
                              kind="수입"
                              active={isIncome(row.transactionType)}
                              onClick={() => setGubun(i, '수입')}
                            />
                            <GubunPill
                              kind="지출"
                              active={!isIncome(row.transactionType)}
                              onClick={() => setGubun(i, '지출')}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[340px] py-2.5 pr-3.5 pl-3.5 text-[#26344c]">
                          {row.description || '—'}
                        </TableCell>
                        <TableCell className="py-2.5 pr-3.5 pl-3.5 text-right font-bold text-[#0f6b41] tabular-nums">
                          {isIncome(row.transactionType) ? fmt(parseAmount(row.amount)) : '–'}
                        </TableCell>
                        <TableCell className="py-2.5 pr-3.5 pl-3.5 text-right font-bold text-[#a82e20] tabular-nums">
                          {!isIncome(row.transactionType) ? fmt(parseAmount(row.amount)) : '–'}
                        </TableCell>
                        <TableCell className="max-w-[200px] overflow-hidden py-2.5 pr-3.5 pl-3.5 text-[12.5px] text-ellipsis whitespace-nowrap text-[#6b7a90]">
                          {row.note || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-3.5">
              <button
                onClick={() => setState((s) => ({ ...s, showSummary: true }))}
                className="flex cursor-pointer items-center gap-2.5 rounded-[11px] bg-[#123a78] px-6 py-3.5 text-[14.5px] font-extrabold text-white shadow-[0_6px_16px_rgba(18,58,120,.3)] transition-colors hover:bg-[#0d2f63]"
              >
                <span className="flex items-end gap-0.5">
                  <span className="block h-2 w-[3px] rounded-[1px] bg-[#7fa9ef]" />
                  <span className="block h-[13px] w-[3px] rounded-[1px] bg-[#aecaf6]" />
                  <span className="block h-[18px] w-[3px] rounded-[1px] bg-white" />
                </span>
                월별 순수익 표 만들기
              </button>
              <span className="text-[12.5px] leading-[1.5] text-[#6b7a90]">
                &lsquo;구분&rsquo;의 <strong className="text-[#147a4d]">수입</strong>/
                <strong className="text-[#bb3525]">지출</strong> 분류를 기준으로 월별 순수익을
                산정합니다.
              </span>
            </div>

            {/* Monthly summary */}
            {state.showSummary && (
              <div className="animate-[scfade_.35s_ease] overflow-hidden rounded-[14px] border border-[#e1e8f2] bg-white shadow-[0_1px_3px_rgba(20,40,80,.05)]">
                <div className="flex flex-wrap items-center gap-3 border-b border-[#eef2f7] bg-[#f8fafd] px-[18px] py-[15px]">
                  <span className="text-[15px] font-extrabold tracking-tight">월별 순수익</span>
                  <Badge className="bg-[#eef2f7] px-2.5 py-0.5 text-[12px] font-semibold text-[#6b7a90] hover:bg-[#eef2f7]">
                    {monthly.length}개월
                  </Badge>
                  <button
                    onClick={() => downloadExcel?.(state.rows)}
                    disabled={!downloadExcel}
                    className="ml-auto flex cursor-pointer items-center gap-2 rounded-[9px] bg-[#147a4d] px-[18px] py-[11px] text-[13.5px] font-extrabold text-white shadow-[0_4px_12px_rgba(20,122,77,.28)] transition-colors hover:bg-[#0f6b41] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="rounded bg-white/20 px-1.5 py-0.5 font-mono text-[10px] font-extrabold">
                      XLSX
                    </span>
                    엑셀 다운로드
                  </button>
                </div>
                <Table className="text-[13.5px]">
                  <TableHeader>
                    <TableRow className="bg-[#f4f7fc] hover:bg-[#f4f7fc]">
                      <TableHead className="border-b border-[#e1e8f2] py-3 pr-[18px] pl-[18px] text-[11.5px] font-bold text-[#5c6b82]">
                        월
                      </TableHead>
                      <TableHead className="border-b border-[#e1e8f2] py-3 pr-[18px] pl-[18px] text-right text-[11.5px] font-bold text-[#147a4d]">
                        수입
                      </TableHead>
                      <TableHead className="border-b border-[#e1e8f2] py-3 pr-[18px] pl-[18px] text-right text-[11.5px] font-bold text-[#bb3525]">
                        지출
                      </TableHead>
                      <TableHead className="border-b border-[#e1e8f2] py-3 pr-[18px] pl-[18px] text-right text-[11.5px] font-bold text-[#123a78]">
                        순수익
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthly.map((m) => (
                      <TableRow
                        key={m.monthKey}
                        className="border-b border-[#f0f3f8] hover:bg-transparent"
                      >
                        <TableCell className="py-3 pr-[18px] pl-[18px] font-bold text-[#26344c] tabular-nums">
                          {m.monthLabel}
                        </TableCell>
                        <TableCell className="py-3 pr-[18px] pl-[18px] text-right font-semibold text-[#0f6b41] tabular-nums">
                          {fmt(m.income)}
                        </TableCell>
                        <TableCell className="py-3 pr-[18px] pl-[18px] text-right font-semibold text-[#a82e20] tabular-nums">
                          {fmt(m.expense)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'py-3 pr-[18px] pl-[18px] text-right font-extrabold tabular-nums',
                            m.net >= 0 ? 'text-[#123a78]' : 'text-[#a82e20]',
                          )}
                        >
                          {fmt(m.net)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-[#f4f7fc] hover:bg-[#f4f7fc]">
                      <TableCell className="py-[13px] pr-[18px] pl-[18px] font-extrabold text-[#16223a]">
                        합계
                      </TableCell>
                      <TableCell className="py-[13px] pr-[18px] pl-[18px] text-right font-extrabold text-[#0f6b41] tabular-nums">
                        {fmt(tIn)}
                      </TableCell>
                      <TableCell className="py-[13px] pr-[18px] pl-[18px] text-right font-extrabold text-[#a82e20] tabular-nums">
                        {fmt(tOut)}
                      </TableCell>
                      <TableCell className="py-[13px] pr-[18px] pl-[18px] text-right font-extrabold text-[#123a78] tabular-nums">
                        {fmt(tIn - tOut)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
