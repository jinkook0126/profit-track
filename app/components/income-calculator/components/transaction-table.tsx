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

import type { TransactionTableProps } from '../types';
import { fmt, formatDateTime, parseAmount } from '../utils/format';
import { isIncome } from '../utils/transaction';
import { GubunPill } from './gubun-pill';

export function TransactionTable({
  rows,
  tIn,
  tOut,
  onGubunChange,
  onExcludeChange,
}: TransactionTableProps) {
  const excludedCount = rows.filter((r) => r.excluded).length;

  return (
    <div className="overflow-hidden rounded-[14px] border border-[#e1e8f2] bg-white shadow-[0_1px_3px_rgba(20,40,80,.05)]">
      <div className="flex flex-wrap items-center gap-3.5 border-b border-[#eef2f7] px-[18px] py-[15px]">
        <span className="text-[15px] font-extrabold tracking-tight">거래내역</span>
        <Badge className="bg-[#f1f4f9] px-2.5 py-0.5 text-[12px] font-semibold text-[#6b7a90] hover:bg-[#f1f4f9]">
          {rows.length}건
        </Badge>
        {excludedCount > 0 && (
          <Badge className="bg-[#fff3cd] px-2.5 py-0.5 text-[12px] font-semibold text-[#856404] hover:bg-[#fff3cd]">
            {excludedCount}건 제외 중
          </Badge>
        )}
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

      <div className="max-h-[460px] overflow-auto">
        <Table className="text-[13px]">
          <TableHeader>
            <TableRow className="sticky top-0 z-[2] bg-[#f4f7fc] hover:bg-[#f4f7fc]">
              <TableHead className="w-10 border-b border-[#e1e8f2] py-[11px] pr-2 pl-3.5 text-center text-[11.5px] font-bold whitespace-nowrap text-[#5c6b82]">
                제외
              </TableHead>
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
                메모 / 거래처
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow
                key={`${row.transactionDate}-${row.transactionTime}-${i}`}
                className={cn(
                  'border-b border-[#f0f3f8] hover:bg-transparent',
                  row.excluded ? 'opacity-40' : i % 2 === 1 ? 'bg-[#fafbfd]' : 'bg-white',
                )}
              >
                <TableCell className="py-2.5 pr-2 pl-3.5 text-center">
                  <input
                    type="checkbox"
                    checked={!!row.excluded}
                    onChange={() => onExcludeChange(i)}
                    className="h-4 w-4 cursor-pointer accent-[#123a78]"
                    title="정산에서 제외"
                  />
                </TableCell>
                <TableCell
                  className={cn(
                    'py-2.5 pr-3.5 pl-3.5 whitespace-nowrap tabular-nums',
                    row.excluded ? 'text-[#9aa5b4] line-through' : 'text-[#42526b]',
                  )}
                >
                  {formatDateTime(row.transactionDate, row.transactionTime)}
                </TableCell>
                <TableCell className="py-2.5 pr-3.5 pl-3.5">
                  <div className="flex justify-center gap-1.5">
                    <GubunPill
                      kind="수입"
                      active={isIncome(row.transactionType)}
                      onClick={() => onGubunChange(i, '수입')}
                    />
                    <GubunPill
                      kind="지출"
                      active={!isIncome(row.transactionType)}
                      onClick={() => onGubunChange(i, '지출')}
                    />
                  </div>
                </TableCell>
                <TableCell
                  className={cn(
                    'max-w-[340px] py-2.5 pr-3.5 pl-3.5',
                    row.excluded && 'text-[#9aa5b4] line-through',
                  )}
                >
                  {row.description || '—'}
                </TableCell>
                <TableCell
                  className={cn(
                    'py-2.5 pr-3.5 pl-3.5 text-right font-bold tabular-nums',
                    row.excluded ? 'text-[#9aa5b4] line-through' : 'text-[#0f6b41]',
                  )}
                >
                  {isIncome(row.transactionType) ? fmt(parseAmount(row.amount)) : '–'}
                </TableCell>
                <TableCell
                  className={cn(
                    'py-2.5 pr-3.5 pl-3.5 text-right font-bold tabular-nums',
                    row.excluded ? 'text-[#9aa5b4] line-through' : 'text-[#a82e20]',
                  )}
                >
                  {!isIncome(row.transactionType) ? fmt(parseAmount(row.amount)) : '–'}
                </TableCell>
                <TableCell className="max-w-[200px] overflow-hidden py-2.5 pr-3.5 pl-3.5 text-[12.5px] text-ellipsis whitespace-nowrap text-[#6b7a90]">
                  {row.memo || '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
