export function CalculatorHeader() {
  return (
    <header className="sticky top-0 z-30 bg-[#123a78] text-white shadow-[0_1px_0_rgba(255,255,255,.08),0_6px_18px_rgba(12,38,80,.18)]">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-3.5 px-7">
        <div className="flex items-end gap-[3px] rounded-[9px] bg-white p-[9px_10px] shadow-[inset_0_0_0_1px_rgba(18,58,120,.08)]">
          <div className="h-[11px] w-[5px] rounded-[1.5px] bg-[#9cc0f5]" />
          <div className="h-[17px] w-[5px] rounded-[1.5px] bg-[#3f78d6]" />
          <div className="h-[23px] w-[5px] rounded-[1.5px] bg-[#123a78]" />
        </div>
        <div className="flex flex-col leading-[1.2]">
          <span className="text-[17px] font-extrabold tracking-tight">소득산정 계산기</span>
          <span className="text-[11.5px] font-medium text-[#aec4e8]">
            은행 거래내역 PDF → 월별 순수익 산출
          </span>
        </div>
      </div>
    </header>
  );
}
