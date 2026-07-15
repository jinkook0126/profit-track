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
        {state.status === 'parsing' && !state.requiresPassword && (
          <ParsingPanel
            fileName={state.fileName}
            progressCurrent={state.progressCurrent}
            progressTotal={state.progressTotal}
          />
        )}
        {state.status === 'error' && !state.requiresPassword && (
          <ErrorPanel message={state.errorMsg} onReset={reset} />
        )}
        {state.requiresPassword && (
          <ErrorPanel
            message={
              state.progressTotal > 1
                ? `${state.progressTotal}개 중 ${state.progressCurrent}번째 파일이 비밀번호로 보호되어 있습니다.`
                : '비밀번호 보호된 PDF입니다.'
            }
            onReset={reset}
          />
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
          errorMessage={state.errorMsg}
        />
      )}
    </div>
  );
}
