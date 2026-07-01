import { cn } from '@/lib/utils';

import type { StepperProps } from '../types';

const LABELS = ['PDF 업로드', '거래내역 확인', '월별 순수익 산출'] as const;

export function Stepper({ step }: StepperProps) {
  return (
    <div className="mb-7 flex flex-wrap items-center justify-center gap-3.5">
      {([1, 2, 3] as const).map((n) => {
        const active = n === step;
        const done = n < step;
        return (
          <div key={n} className="flex items-center gap-2.5">
            <div
              className={cn(
                'flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-[13.5px] font-bold transition-all duration-200',
                active && 'bg-[#123a78] text-white shadow-[0_4px_10px_rgba(18,58,120,.3)]',
                done && 'bg-[#3f78d6] text-white',
                !active && !done && 'border border-[#d4dbe6] bg-white text-[#9aa6b8]',
              )}
            >
              {done ? '✓' : n}
            </div>
            <span
              className={cn(
                'text-[13px]',
                active && 'font-extrabold text-[#16223a]',
                done && 'font-semibold text-[#3f78d6]',
                !active && !done && 'font-semibold text-[#9aa6b8]',
              )}
            >
              {LABELS[n - 1]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
