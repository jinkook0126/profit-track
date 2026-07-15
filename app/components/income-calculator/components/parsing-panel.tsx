import type { ParsingPanelProps } from '../types';

export function ParsingPanel({ fileName, progressCurrent, progressTotal }: ParsingPanelProps) {
  const showProgress =
    typeof progressCurrent === 'number' && typeof progressTotal === 'number' && progressTotal > 1;

  return (
    <div className="flex flex-col items-center gap-[18px] rounded-[18px] border border-[#e1e8f2] bg-white px-8 py-14">
      <div className="h-11 w-11 animate-spin rounded-full border-4 border-[#e3ebf7] border-t-[#123a78]" />
      <div className="text-center">
        <p className="text-[15.5px] font-bold">거래내역을 추출하는 중…</p>
        {showProgress && (
          <p className="mt-2 text-[13.5px] font-semibold text-[#123a78]">
            {progressTotal}개 중 {progressCurrent}번째 파일
          </p>
        )}
        <p className="mt-1.5 text-[12.5px] text-[#6b7a90]">{fileName}</p>
        {showProgress && (
          <div className="mx-auto mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-[#e3ebf7]">
            <div
              className="h-full rounded-full bg-[#123a78] transition-all duration-300"
              style={{
                width: `${Math.min(100, (progressCurrent / progressTotal) * 100)}%`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
