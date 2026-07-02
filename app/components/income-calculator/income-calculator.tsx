import { useCallback } from 'react';

import {
  CalculatorHeader,
  EmptyPanel,
  ErrorPanel,
  ParsingPanel,
  PasswordDialog,
  ReadyPanel,
  Stepper,
  UploadZone,
} from './components/index';
import { useIncomeCalculator } from './hooks';
import type { IncomeCalculatorProps } from './types';

export function IncomeCalculator(props: IncomeCalculatorProps) {
  const {
    state,
    computed,
    activeStep,
    reset,
    setGubun,
    toggleExcluded,
    handleFiles,
    showSummary,
    downloadExcel,
    retryWithPassword,
  } = useIncomeCalculator(props);
  const { monthly, tIn, tOut } = computed;

  const handlePasswordSubmit = useCallback(
    (password: string) => {
      retryWithPassword(password);
    },
    [retryWithPassword],
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#eef1f6] font-sans text-[#16223a] antialiased">
      <CalculatorHeader />

      <main className="mx-auto w-full max-w-[1240px] flex-1 px-7 pt-[30px] pb-14">
        <Stepper step={activeStep} />

        {state.status === 'idle' && <UploadZone onFiles={handleFiles} />}
        {state.status === 'parsing' && <ParsingPanel fileName={state.fileName} />}
        {state.status === 'error' && !state.requiresPassword && (
          <ErrorPanel message={state.errorMsg} onReset={reset} />
        )}
        {state.status === 'error' && state.requiresPassword && (
          <ErrorPanel message={state.errorMsg} onReset={reset} />
        )}
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
            onExcludeChange={toggleExcluded}
            onShowSummary={showSummary}
            onDownloadExcel={() => downloadExcel?.(state.rows)}
            downloadDisabled={!downloadExcel}
          />
        )}
      </main>

      {state.requiresPassword && (
        <PasswordDialog
          onSubmit={handlePasswordSubmit}
          onCancel={reset}
          isLoading={state.status === 'parsing'}
        />
      )}
    </div>
  );
}
