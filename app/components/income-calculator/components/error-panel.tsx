import type { ErrorPanelProps } from '../types';

export function ErrorPanel({ message, onReset }: ErrorPanelProps) {
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
