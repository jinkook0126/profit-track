import { useCallback, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import type { UploadZoneProps } from '../types';

export function UploadZone({ onFiles }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null | undefined) => {
      if (!fileList || fileList.length === 0) return;
      onFiles(Array.from(fileList));
    },
    [onFiles],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-4 rounded-[18px] border-2 border-dashed bg-white px-8 py-16 text-center transition-all duration-150 outline-none',
        dragging
          ? 'border-[#3f78d6] bg-[#f7faff]'
          : 'border-[#b9c8e2] hover:border-[#3f78d6] hover:bg-[#f7faff]',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf1fd] font-mono text-[15px] font-extrabold tracking-wide text-[#123a78]">
        PDF
      </div>
      <div>
        <p className="mb-1.5 text-[17px] font-extrabold text-[#16223a]">
          거래내역 PDF를 업로드하세요
        </p>
        <p className="text-[13px] leading-relaxed text-[#6b7a90]">
          이 영역에 파일을 끌어다 놓거나 클릭해서 선택합니다.
          <br />
          여러 PDF를 동시에 선택해 합산할 수 있습니다.
        </p>
      </div>
      <span className="mt-1 rounded-[10px] bg-[#123a78] px-[22px] py-[11px] text-[13.5px] font-bold text-white shadow-[0_4px_12px_rgba(18,58,120,.28)]">
        파일 선택
      </span>
    </div>
  );
}
