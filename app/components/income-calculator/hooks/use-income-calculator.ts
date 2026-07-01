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
    async (file: File) => {
      if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
        dispatch({ type: 'ERROR', errorMsg: 'PDF 파일만 업로드할 수 있습니다.' });
        return;
      }

      dispatch({ type: 'PARSING', fileName: file.name });

      try {
        const rows = await parsePdf(file);
        if (!rows.length) {
          dispatch({ type: 'EMPTY' });
        } else {
          dispatch({ type: 'PARSED', rows });
        }
      } catch (e) {
        dispatch({
          type: 'ERROR',
          errorMsg: e instanceof Error ? e.message : String(e),
        });
      }
    },
    [parsePdf],
  );

  const showSummary = useCallback(() => {
    dispatch({ type: 'SHOW_SUMMARY' });
  }, []);

  return {
    state,
    computed,
    activeStep,
    reset,
    setGubun,
    handleFile,
    showSummary,
    downloadExcel,
  };
}
