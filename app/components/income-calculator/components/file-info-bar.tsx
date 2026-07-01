import type { FileInfoBarProps } from '../types';

export function FileInfoBar({ fileName, rowCount, onReset }: FileInfoBarProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[#e1e8f2] bg-white px-4 py-3">
      <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-lg bg-[#eaf1fd] font-mono text-[11px] font-extrabold text-[#123a78]">
        PDF
      </div>
      <div className="min-w-0 flex-1 leading-[1.3]">
        <p className="max-w-[520px] overflow-hidden text-[13.5px] font-bold text-ellipsis whitespace-nowrap">
          {fileName}
        </p>
        <p className="text-[11.5px] text-[#6b7a90]">{rowCount}건의 거래내역을 추출했습니다</p>
      </div>
      <button
        onClick={onReset}
        className="ml-auto cursor-pointer rounded-lg border border-[#dde4ee] bg-[#f1f4f9] px-3.5 py-2 text-[12.5px] font-semibold text-[#42526b] hover:bg-[#e7ecf4]"
      >
        다른 파일 올리기
      </button>
    </div>
  );
}
