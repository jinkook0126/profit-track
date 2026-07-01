import {
  CalculatorHeader,
  EmptyPanel,
  ErrorPanel,
  ParsingPanel,
  ReadyPanel,
  Stepper,
  UploadZone,
} from './components/index';
import { useIncomeCalculator } from './hooks';
import type { IncomeCalculatorProps } from './types';

export function IncomeCalculator(props: IncomeCalculatorProps) {
  const { state, computed, activeStep, reset, setGubun, handleFile, showSummary, downloadExcel } =
    useIncomeCalculator(props);
  const { monthly, tIn, tOut } = computed;

  return (
    <div className="flex min-h-screen flex-col bg-[#eef1f6] font-sans text-[#16223a] antialiased">
      <CalculatorHeader />

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-7 pt-[30px] pb-14">
        <Stepper step={activeStep} />

        {state.status === 'idle' && <UploadZone onFile={handleFile} />}
        {state.status === 'parsing' && <ParsingPanel fileName={state.fileName} />}
        {state.status === 'error' && <ErrorPanel message={state.errorMsg} onReset={reset} />}
        {state.status === 'empty' && <EmptyPanel onReset={reset} />}
        {state.status === 'ready' && (
          <ReadyPanel
            fileName={state.fileName}
            rows={state.rows}
            showSummary={state.showSummary}
            monthly={monthly}
            tIn={tIn}
            tOut={tOut}
            onReset={reset}
            onGubunChange={setGubun}
            onShowSummary={showSummary}
            onDownloadExcel={() => downloadExcel?.(state.rows)}
            downloadDisabled={!downloadExcel}
          />
        )}
      </main>
    </div>
  );
}
