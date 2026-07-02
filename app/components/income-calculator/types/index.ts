import type { Transaction } from '@/types/table';

// ─── Status & Step ───

export type AppStatus = 'idle' | 'parsing' | 'error' | 'empty' | 'ready';

export type CalculatorStep = 1 | 2 | 3;

// ─── Classification ───

export type GubunKind = '수입' | '지출';

// ─── State ───

export interface IncomeCalculatorState {
  status: AppStatus;
  fileName: string;
  rows: Transaction[];
  showSummary: boolean;
  errorMsg: string;
  requiresPassword: boolean;
  fileForPasswordRetry?: File;
}

export const INITIAL_INCOME_CALCULATOR_STATE: IncomeCalculatorState = {
  status: 'idle',
  fileName: '',
  rows: [],
  showSummary: false,
  errorMsg: '',
  requiresPassword: false,
};

// ─── Computation Results ───

export interface MonthlySummary {
  monthKey: string;
  monthLabel: string;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlyComputeResult {
  monthly: MonthlySummary[];
  tIn: number;
  tOut: number;
}

// ─── Component Props ───

export interface IncomeCalculatorProps {
  /**
   * PDF 파싱 구현체를 여기에 주입하세요.
   * file을 받아 Transaction[] 을 반환하는 async 함수입니다.
   * 선택적으로 비밀번호를 두 번째 인자로 받을 수 있습니다.
   */
  parsePdf: (file: File, password?: string) => Promise<Transaction[]>;
  /**
   * 엑셀 다운로드 구현체 (선택). 없으면 버튼이 비활성화됩니다.
   */
  downloadExcel?: (rows: Transaction[]) => void;
}

// ─── Sub-component Props ───

export interface StepperProps {
  step: CalculatorStep;
}

export interface UploadZoneProps {
  onFiles: (files: File[]) => void;
}

export interface ParsingPanelProps {
  fileName: string;
}

export interface ErrorPanelProps {
  message: string;
  onReset: () => void;
}

export interface EmptyPanelProps {
  onReset: () => void;
}

export interface GubunPillProps {
  kind: GubunKind;
  active: boolean;
  onClick: () => void;
}

export interface FileInfoBarProps {
  fileName: string;
  rowCount: number;
  onReset: () => void;
}

export interface TransactionTableProps {
  rows: Transaction[];
  tIn: number;
  tOut: number;
  onGubunChange: (index: number, gubun: GubunKind) => void;
  onExcludeChange: (index: number) => void;
}

export interface MonthlySummaryTableProps {
  monthly: MonthlyComputeResult['monthly'];
  tIn: number;
  tOut: number;
  onDownloadExcel?: () => void;
  downloadDisabled: boolean;
}

export interface ReadyPanelProps {
  fileName: string;
  rows: Transaction[];
  showSummary: boolean;
  monthly: MonthlyComputeResult['monthly'];
  tIn: number;
  tOut: number;
  onReset: () => void;
  onGubunChange: (index: number, gubun: GubunKind) => void;
  onExcludeChange: (index: number) => void;
  onShowSummary: () => void;
  onDownloadExcel?: () => void;
  downloadDisabled: boolean;
}
