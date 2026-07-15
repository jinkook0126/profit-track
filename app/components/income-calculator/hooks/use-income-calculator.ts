import { useCallback, useMemo, useReducer, useRef } from 'react';

import { checkPdfAccess } from '@/lib/parsing.client';
import type { Transaction } from '@/types/table';

import type {
  CalculatorStep,
  GubunKind,
  IncomeCalculatorProps,
  IncomeCalculatorState,
} from '../types';
import { INITIAL_INCOME_CALCULATOR_STATE } from '../types';
import { computeMonthly } from '../utils/compute-monthly';

type BatchState = {
  files: File[];
  index: number;
  rows: Transaction[];
  displayName: string;
};

type Action =
  | {
      type: 'PARSING';
      fileName: string;
      progressCurrent: number;
      progressTotal: number;
    }
  | { type: 'PASSWORD_CHECKING' }
  | { type: 'PARSED'; rows: Transaction[]; fileName: string }
  | { type: 'EMPTY' }
  | { type: 'ERROR'; errorMsg: string }
  | {
      type: 'PASSWORD_REQUIRED';
      fileName: string;
      file: File;
      errorMsg?: string;
      progressCurrent: number;
      progressTotal: number;
    }
  | { type: 'CLEAR_PASSWORD' }
  | { type: 'RESET' }
  | { type: 'SET_GUBUN'; index: number; gubun: GubunKind }
  | { type: 'TOGGLE_EXCLUDED'; index: number }
  | { type: 'SHOW_SUMMARY' };

function sortByDateAsc(rows: Transaction[]): Transaction[] {
  return [...rows].sort((a, b) => {
    const keyA = `${a.transactionDate ?? ''} ${a.transactionTime ?? ''}`.trim();
    const keyB = `${b.transactionDate ?? ''} ${b.transactionTime ?? ''}`.trim();
    return keyA.localeCompare(keyB);
  });
}

function reducer(state: IncomeCalculatorState, action: Action): IncomeCalculatorState {
  switch (action.type) {
    case 'RESET':
      return INITIAL_INCOME_CALCULATOR_STATE;
    case 'PARSING':
      return {
        ...state,
        status: 'parsing',
        fileName: action.fileName,
        requiresPassword: false,
        fileForPasswordRetry: undefined,
        errorMsg: '',
        progressCurrent: action.progressCurrent,
        progressTotal: action.progressTotal,
        rows: state.rows,
        showSummary: false,
      };
    case 'PASSWORD_CHECKING':
      return { ...state, status: 'parsing' };
    case 'PARSED':
      return {
        ...state,
        status: 'ready',
        rows: action.rows,
        fileName: action.fileName,
        requiresPassword: false,
        fileForPasswordRetry: undefined,
        progressCurrent: 0,
        progressTotal: 0,
      };
    case 'EMPTY':
      return {
        ...state,
        status: 'empty',
        requiresPassword: false,
        fileForPasswordRetry: undefined,
        progressCurrent: 0,
        progressTotal: 0,
      };
    case 'ERROR':
      return {
        ...state,
        status: 'error',
        errorMsg: action.errorMsg,
        requiresPassword: false,
        fileForPasswordRetry: undefined,
        progressCurrent: 0,
        progressTotal: 0,
      };
    case 'PASSWORD_REQUIRED':
      return {
        ...state,
        status: 'error',
        errorMsg: action.errorMsg ?? '비밀번호 보호된 PDF입니다.',
        requiresPassword: true,
        fileForPasswordRetry: action.file,
        fileName: action.fileName,
        progressCurrent: action.progressCurrent,
        progressTotal: action.progressTotal,
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
    case 'TOGGLE_EXCLUDED':
      return {
        ...state,
        rows: state.rows.map((r: Transaction, i: number) =>
          i === action.index ? { ...r, excluded: !r.excluded } : r,
        ),
      };
    case 'SHOW_SUMMARY':
      return { ...state, showSummary: true };
    default:
      return state;
  }
}

function buildDisplayName(files: File[]): string {
  if (files.length === 1) return files[0].name;
  return `${files[0].name} 외 ${files.length - 1}개`;
}

export function useIncomeCalculator({ parsePdf, downloadExcel }: IncomeCalculatorProps) {
  const [state, dispatch] = useReducer(reducer, INITIAL_INCOME_CALCULATOR_STATE);
  const batchRef = useRef<BatchState | null>(null);

  const computed = useMemo(() => computeMonthly(state.rows), [state.rows]);
  const activeStep: CalculatorStep = state.status === 'ready' ? (state.showSummary ? 3 : 2) : 1;

  const reset = useCallback(() => {
    batchRef.current = null;
    dispatch({ type: 'RESET' });
  }, []);

  const setGubun = useCallback((index: number, gubun: GubunKind) => {
    dispatch({ type: 'SET_GUBUN', index, gubun });
  }, []);

  const toggleExcluded = useCallback((index: number) => {
    dispatch({ type: 'TOGGLE_EXCLUDED', index });
  }, []);

  const finishBatch = useCallback((rows: Transaction[], displayName: string) => {
    batchRef.current = null;
    if (!rows.length) {
      dispatch({ type: 'EMPTY' });
      return;
    }
    dispatch({ type: 'PARSED', rows: sortByDateAsc(rows), fileName: displayName });
  }, []);

  const processFromIndex = useCallback(
    async (password?: string) => {
      const batch = batchRef.current;
      if (!batch) return;

      const { files, displayName } = batch;
      const total = files.length;

      while (batchRef.current && batchRef.current.index < files.length) {
        const current = batchRef.current;
        const index = current.index;
        const file = files[index];
        const progressCurrent = index + 1;

        try {
          if (password && index === batch.index) {
            dispatch({ type: 'PASSWORD_CHECKING' });
          } else {
            dispatch({
              type: 'PARSING',
              fileName: file.name,
              progressCurrent,
              progressTotal: total,
            });
          }

          const access = await checkPdfAccess(file, password);

          if (access === 'need-password') {
            dispatch({
              type: 'PASSWORD_REQUIRED',
              fileName: file.name,
              file,
              progressCurrent,
              progressTotal: total,
            });
            return;
          }

          if (access === 'incorrect-password') {
            dispatch({
              type: 'PASSWORD_REQUIRED',
              fileName: file.name,
              file,
              errorMsg: '비밀번호가 올바르지 않습니다.',
              progressCurrent,
              progressTotal: total,
            });
            return;
          }

          dispatch({
            type: 'PARSING',
            fileName: file.name,
            progressCurrent,
            progressTotal: total,
          });

          const rows = await parsePdf(file, password);
          // 비밀번호는 현재 파일에만 적용. 다음 파일부터는 다시 체크
          password = undefined;

          if (!batchRef.current) return;

          batchRef.current = {
            ...batchRef.current,
            index: index + 1,
            rows: [...batchRef.current.rows, ...rows],
          };
        } catch (e) {
          batchRef.current = null;
          const error = e as Error;
          dispatch({ type: 'ERROR', errorMsg: error?.message || String(e) });
          return;
        }
      }

      if (!batchRef.current) return;
      finishBatch(batchRef.current.rows, displayName);
    },
    [parsePdf, finishBatch],
  );

  const handleFiles = useCallback(
    async (files: File[]) => {
      const validFiles = files.filter(
        (f) => /\.pdf$/i.test(f.name) || f.type === 'application/pdf',
      );

      if (validFiles.length === 0) {
        dispatch({ type: 'ERROR', errorMsg: 'PDF 파일만 업로드할 수 있습니다.' });
        return;
      }

      const displayName = buildDisplayName(validFiles);
      batchRef.current = {
        files: validFiles,
        index: 0,
        rows: [],
        displayName,
      };

      dispatch({
        type: 'PARSING',
        fileName: validFiles[0].name,
        progressCurrent: 1,
        progressTotal: validFiles.length,
      });

      await processFromIndex();
    },
    [processFromIndex],
  );

  const handleFile = useCallback(
    async (file: File, password?: string) => {
      if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
        dispatch({ type: 'ERROR', errorMsg: 'PDF 파일만 업로드할 수 있습니다.' });
        return;
      }

      // 단일 파일도 배치 파이프라인으로 통일
      if (!batchRef.current) {
        batchRef.current = {
          files: [file],
          index: 0,
          rows: [],
          displayName: file.name,
        };
      }

      await processFromIndex(password);
    },
    [processFromIndex],
  );

  const showSummary = useCallback(() => {
    dispatch({ type: 'SHOW_SUMMARY' });
  }, []);

  const retryWithPassword = useCallback(
    async (password: string) => {
      if (!batchRef.current || !state.fileForPasswordRetry) return;
      await processFromIndex(password);
    },
    [state.fileForPasswordRetry, processFromIndex],
  );

  return {
    state,
    computed,
    activeStep,
    reset,
    setGubun,
    toggleExcluded,
    handleFile,
    handleFiles,
    showSummary,
    downloadExcel,
    retryWithPassword,
  };
}
