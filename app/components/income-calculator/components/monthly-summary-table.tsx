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

import type { MonthlySummaryTableProps } from '../types';
import { fmt } from '../utils/format';

export function MonthlySummaryTable({
  monthly,
  tIn,
  tOut,
  onDownloadExcel,
  downloadDisabled,
}: MonthlySummaryTableProps) {
  return (
    <div className="animate-[scfade_.35s_ease] overflow-hidden rounded-[14px] border border-[#e1e8f2] bg-white shadow-[0_1px_3px_rgba(20,40,80,.05)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#eef2f7] bg-[#f8fafd] px-[18px] py-[15px]">
        <span className="text-[15px] font-extrabold tracking-tight">월별 순수익</span>
        <Badge className="bg-[#eef2f7] px-2.5 py-0.5 text-[12px] font-semibold text-[#6b7a90] hover:bg-[#eef2f7]">
          {monthly.length}개월
        </Badge>
        <button
          onClick={onDownloadExcel}
          disabled={downloadDisabled}
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
            <TableRow key={m.monthKey} className="border-b border-[#f0f3f8] hover:bg-transparent">
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
  );
}
