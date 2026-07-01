import type { ReadyPanelProps } from '../types';
import { FileInfoBar } from './file-info-bar';
import { MonthlySummaryTable } from './monthly-summary-table';
import { TransactionTable } from './transaction-table';

export function ReadyPanel({
  fileName,
  rows,
  showSummary,
  monthly,
  tIn,
  tOut,
  onReset,
  onGubunChange,
  onShowSummary,
  onDownloadExcel,
  downloadDisabled,
}: ReadyPanelProps) {
  return (
    <div className="flex animate-[scfade_.35s_ease] flex-col gap-5">
      <FileInfoBar fileName={fileName} rowCount={rows.length} onReset={onReset} />

      <TransactionTable rows={rows} tIn={tIn} tOut={tOut} onGubunChange={onGubunChange} />

      <div className="flex flex-wrap items-center gap-3.5">
        <button
          onClick={onShowSummary}
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
          <strong className="text-[#bb3525]">지출</strong> 분류를 기준으로 월별 순수익을 산정합니다.
        </span>
      </div>

      {showSummary && (
        <MonthlySummaryTable
          monthly={monthly}
          tIn={tIn}
          tOut={tOut}
          onDownloadExcel={onDownloadExcel}
          downloadDisabled={downloadDisabled}
        />
      )}
    </div>
  );
}
