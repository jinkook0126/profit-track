import type { EmptyPanelProps } from '../types';

export function EmptyPanel({ onReset }: EmptyPanelProps) {
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
