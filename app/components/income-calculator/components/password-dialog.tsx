import { useCallback, useRef } from 'react';

interface PasswordDialogProps {
  onSubmit: (password: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PasswordDialog({ onSubmit, onCancel, isLoading }: PasswordDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const password = inputRef.current?.value.trim();
      if (password) {
        onSubmit(password);
      }
    },
    [onSubmit],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-[400px] rounded-[16px] bg-white px-6 py-7 shadow-xl">
        <h2 className="text-[16.5px] font-extrabold text-[#16223a]">
          비밀번호 입력 필요
        </h2>
        <p className="mt-2 text-[13px] text-[#6b7a90]">
          이 PDF 파일은 비밀번호로 보호되어 있습니다. 계속하려면 비밀번호를 입력하세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <input
            ref={inputRef}
            type="password"
            placeholder="비밀번호를 입력하세요"
            autoFocus
            disabled={isLoading}
            className="rounded-[8px] border border-[#d4dbe6] bg-white px-4 py-3 text-[13.5px] placeholder-[#9aa6b8] outline-none transition-colors focus:border-[#3f78d6] focus:bg-[#f7faff] disabled:opacity-50"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 rounded-[8px] border border-[#dde4ee] bg-[#f1f4f9] px-4 py-2.5 text-[13px] font-semibold text-[#42526b] transition-colors hover:bg-[#e7ecf4] disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-[8px] bg-[#123a78] px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#0d2f63] disabled:opacity-50"
            >
              {isLoading ? '확인 중...' : '확인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
