import ExcelJS from 'exceljs';
import { useState } from 'react';

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

export function MonthlySummaryTable({ monthly, tIn, tOut }: MonthlySummaryTableProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadExcel = async () => {
    setIsLoading(true);
    try {
      const totalCols = monthly.length + 2; // 구분 + 월들 + 합계

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('월별 순수익');

      // 제목
      const titleRow = worksheet.addRow(['월별 순수입 계산표']);
      titleRow.font = { bold: true, size: 14 };
      titleRow.alignment = { horizontal: 'center' as const, vertical: 'middle' };
      const lastCol = String.fromCharCode(64 + totalCols);
      worksheet.mergeCells(`A1:${lastCol}1`);
      titleRow.height = 25;

      worksheet.addRow([]); // 공란

      // 헤더 행
      const headerData = ['구분', ...monthly.map((m) => m.monthLabel), '합계'];
      const headerRow = worksheet.addRow(headerData);

      const headerStyle = {
        font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 },
        fill: {
          type: 'pattern' as const,
          pattern: 'solid' as const,
          fgColor: { argb: 'FF123A78' },
        },
        alignment: { horizontal: 'center' as const, vertical: 'middle' as const, wrapText: true },
        border: {
          top: { style: 'thin' as const, color: { argb: 'FF000000' } },
          bottom: { style: 'thin' as const, color: { argb: 'FF000000' } },
          left: { style: 'thin' as const, color: { argb: 'FF000000' } },
          right: { style: 'thin' as const, color: { argb: 'FF000000' } },
        },
      };

      for (let i = 1; i <= headerData.length; i++) {
        const cell = headerRow.getCell(i);
        cell.font = headerStyle.font;
        cell.fill = headerStyle.fill;
        cell.alignment = headerStyle.alignment;
        cell.border = headerStyle.border;
      }

      // 수입 행
      const incomeData = ['수입', ...monthly.map((m) => m.income), tIn];
      worksheet.addRow(incomeData);

      // 지출 행
      const expenseData = ['지출', ...monthly.map((m) => m.expense), tOut];
      worksheet.addRow(expenseData);

      // 순수익 행
      const netData = ['순수익', ...monthly.map((m) => m.net), tIn - tOut];
      worksheet.addRow(netData);

      // 컬럼 너비 설정
      worksheet.columns = [
        { width: 12 },
        ...monthly.map(() => ({ width: 14 }) as const),
        { width: 14 },
      ];

      // 월평균소득 추가
      const avgRow = 8;
      const avgIncome = monthly.length > 0 ? (tIn - tOut) / monthly.length : 0;

      while (worksheet.rowCount < avgRow) {
        worksheet.addRow([]);
      }

      const avgRow1 = worksheet.getRow(avgRow);
      const avgLabelCell = avgRow1.getCell(totalCols - 1);
      avgLabelCell.value = '월 평균 순수익';
      avgLabelCell.font = { bold: true, size: 11 };
      avgLabelCell.alignment = { horizontal: 'right' as const, vertical: 'middle' };

      const avgValueCell = avgRow1.getCell(totalCols);
      avgValueCell.value = avgIncome;
      avgValueCell.numFmt = '#,##0';
      avgValueCell.font = { bold: true, size: 11 };
      avgValueCell.alignment = { horizontal: 'right' as const, vertical: 'middle' };

      // 파일 다운로드
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '월별순수익계산표.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-[scfade_.35s_ease] overflow-hidden rounded-[14px] border border-[#e1e8f2] bg-white shadow-[0_1px_3px_rgba(20,40,80,.05)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#eef2f7] bg-[#f8fafd] px-[18px] py-[15px]">
        <span className="text-[15px] font-extrabold tracking-tight">월별 순수익</span>
        <Badge className="bg-[#eef2f7] px-2.5 py-0.5 text-[12px] font-semibold text-[#6b7a90] hover:bg-[#eef2f7]">
          {monthly.length}개월
        </Badge>
        <button
          onClick={handleDownloadExcel}
          disabled={isLoading}
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
