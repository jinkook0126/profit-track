import { cn } from '@/lib/utils';

import type { GubunPillProps } from '../types';

export function GubunPill({ kind, active, onClick }: GubunPillProps) {
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
