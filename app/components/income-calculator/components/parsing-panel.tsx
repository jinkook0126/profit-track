import type { ParsingPanelProps } from '../types';

export function ParsingPanel({ fileName }: ParsingPanelProps) {
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
