import { useCallback, useMemo, useReducer } from 'react';

import type { Transaction } from '@/types/table';

import type {
  CalculatorStep,
  GubunKind,
  IncomeCalculatorProps,
  IncomeCalculatorState,
} from '../types';
import { INITIAL_INCOME_CALCULATOR_STATE } from '../types';
import { computeMonthly } from '../utils/compute-monthly';

type Action =
  | { type: 'RESET' }
  | { type: 'PARSING'; fileName: string }
  | { type: 'PARSED'; rows: Transaction[] }
  | { type: 'EMPTY' }
  | { type: 'ERROR'; errorMsg: string }
  | { type: 'PASSWORD_REQUIRED'; fileName: string; file: File }
  | { type: 'CLEAR_PASSWORD' }
  | { type: 'SET_GUBUN'; index: number; gubun: GubunKind }
  | { type: 'SHOW_SUMMARY' };

function reducer(state: IncomeCalculatorState, action: Action): IncomeCalculatorState {
  switch (action.type) {
    case 'RESET':
      return INITIAL_INCOME_CALCULATOR_STATE;
    case 'PARSING':
      return { ...INITIAL_INCOME_CALCULATOR_STATE, status: 'parsing', fileName: action.fileName };
    case 'PARSED':
      return { ...state, status: 'ready', rows: action.rows };
    case 'EMPTY':
      return { ...state, status: 'empty' };
    case 'ERROR':
      return { ...state, status: 'error', errorMsg: action.errorMsg };
    case 'PASSWORD_REQUIRED':
      return {
        ...state,
        status: 'error',
        errorMsg: '비밀번호 보호된 PDF입니다.',
        requiresPassword: true,
        fileForPasswordRetry: action.file,
        fileName: action.fileName,
      };
    case 'CLEAR_PASSWORD':
      return { ...state, requiresPassword: false, fileForPasswordRetry: undefined };
    case 'SET_GUBUN':
      return {
        ...state,
        rows: state.rows.map((r: Transaction, i: number) =>
          i === action.index
            ? { ...r, transactionType: action.gubun === '수입' ? '입금' : '출금' }
            : r,
        ),
      };
    case 'SHOW_SUMMARY':
      return { ...state, showSummary: true };
    default:
      return state;
  }
}

export function useIncomeCalculator({ parsePdf, downloadExcel }: IncomeCalculatorProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_INCOME_CALCULATOR_STATE);

  const computed = useMemo(() => computeMonthly(state.rows), [state.rows]);
  const activeStep: CalculatorStep = state.status === 'ready' ? (state.showSummary ? 3 : 2) : 1;

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setGubun = useCallback((index: number, gubun: GubunKind) => {
    dispatch({ type: 'SET_GUBUN', index, gubun });
  }, []);

  const handleFile = useCallback(
    async (file: File, password?: string) => {
      if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
        dispatch({ type: 'ERROR', errorMsg: 'PDF 파일만 업로드할 수 있습니다.' });
        return;
      }

      dispatch({ type: 'PARSING', fileName: file.name });

      try {
        const rows = await parsePdf(file, password);
        if (!rows.length) {
          dispatch({ type: 'EMPTY' });
        } else {
          dispatch({ type: 'PARSED', rows });
          dispatch({ type: 'CLEAR_PASSWORD' });
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);

        // 비밀번호 필요 에러 감지
        if (errorMessage.includes('requiresPassword') || errorMessage.includes('비밀번호')) {
          dispatch({ type: 'PASSWORD_REQUIRED', fileName: file.name, file });
        } else {
          dispatch({ type: 'ERROR', errorMsg: errorMessage });
        }
      }
    },
    [parsePdf],
  );

  const showSummary = useCallback(() => {
    dispatch({ type: 'SHOW_SUMMARY' });
  }, []);

  const retryWithPassword = useCallback(
    async (password: string) => {
      if (!state.fileForPasswordRetry) return;
      await handleFile(state.fileForPasswordRetry, password);
    },
    [state.fileForPasswordRetry, handleFile],
  );

  return {
    state,
    computed,
    activeStep,
    reset,
    setGubun,
    handleFile,
    showSummary,
    downloadExcel,
    retryWithPassword,
  };
}
