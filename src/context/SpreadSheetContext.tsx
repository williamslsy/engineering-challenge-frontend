'use client';

import React, { createContext, useReducer, useEffect, useRef, useMemo, useCallback, ReactNode } from 'react';
import { evaluateFormula, validateFullValue, validatePartialValue } from '@/lib/utils';
import { Status, saveSpreadsheetData } from '@/lib/server-utils';
import { debounce } from 'lodash';
import { toast } from '@/components/ui/use-toast';
import { CellValues } from '@/lib/types';
import Loading from '@/app/loading';
import { SET_CELL_VALUES, SET_INITIALIZED, SET_FOCUSED_CELL, SET_IS_SAVING, SET_HAS_ERROR, spreadsheetReducer, SpreadSheetState } from '@/reducers/spreadsheet-reducers';

interface SpreadSheetContextType {
  cellValues: CellValues;
  updateCellValue: (cell: string, value: string, formula?: string | null) => void;
  handleCellValueChange: (cell: string, value: string) => void;
  handleBlur: (cell: string) => void;
  handleFocus: (cell: string) => void;
  clearCellValue: (cell: string) => void;
  handleSave: () => void;
  isError: (cell: string) => boolean;
  isSaving: boolean;
  focusedCell: string | null;
  rows: number;
  columns: number;
}

interface SpreadSheetProviderProps {
  rows: number;
  columns: number;
  children: ReactNode;
}

export const SpreadSheetContext = createContext<SpreadSheetContextType | null>(null);

const SpreadSheetProvider = ({ rows, columns, children }: SpreadSheetProviderProps) => {
  const [state, dispatch] = useReducer(spreadsheetReducer, {
    cellValues: {},
    initialized: false,
    focusedCell: null,
    isSaving: false,
    hasError: false,
  } as SpreadSheetState);

  const { cellValues, initialized, focusedCell, isSaving, hasError } = state;
  const prevCellValues = useRef<CellValues>({});

  // Debounce save to endpoint function to avoid multiple calls
  const debouncedSaveToEndpoint = useRef(
    debounce(async () => {
      dispatch({ type: SET_IS_SAVING, payload: true });
      try {
        const status = await saveSpreadsheetData(cellValues, rows, columns);
        if (status === Status.DONE) {
          console.log('Data saved to endpoint successfully');
        }
      } catch (error) {
        console.error('Error saving data to endpoint:', error);
      } finally {
        dispatch({ type: SET_IS_SAVING, payload: false });
      }
    }, 1000)
  ).current;

  const handleSave = useCallback(() => {
    if (!hasError) debouncedSaveToEndpoint();
  }, [debouncedSaveToEndpoint, hasError]);

  useEffect(() => {
    const initializeCellValues = () => {
      const dataFromLocalStorage = localStorage.getItem('spreadsheetData');
      if (dataFromLocalStorage) {
        dispatch({ type: SET_CELL_VALUES, payload: JSON.parse(dataFromLocalStorage) });
        console.log('Loaded data from localStorage');
      } else {
        // minimize loops by using Array.from and reduce to create the initial cell values object
        const initialCellValues = Array.from({ length: rows }, (_, rowIndex) =>
          Array.from({ length: columns }, (_, colIndex) => {
            const cell = String.fromCharCode(65 + colIndex) + (rowIndex + 1);
            return { [cell]: { value: '', formula: null } };
          }).reduce((acc, curr) => ({ ...acc, ...curr }), {})
        ).reduce((acc, curr) => ({ ...acc, ...curr }), {});
        dispatch({ type: SET_CELL_VALUES, payload: initialCellValues });
        console.log('Initialized new cell values');
      }
      dispatch({ type: SET_INITIALIZED, payload: true });
    };

    initializeCellValues();
  }, [rows, columns]);

  const updateCellValue = useCallback(
    (cell: string, value: string, formula?: string | null) => {
      dispatch({
        type: SET_CELL_VALUES,
        payload: {
          ...cellValues,
          [cell]: {
            ...cellValues[cell],
            value,
            formula: formula !== undefined ? formula : cellValues[cell].formula,
          },
        },
      });
    },
    [cellValues]
  );

  const handleCellValueChange = useCallback(
    (cell: string, value: string) => {
      if (value.startsWith('=')) {
        updateCellValue(cell, value, value);
      } else {
        if (value.trim() === '') {
          updateCellValue(cell, '', null);
        } else if (validatePartialValue(value)) {
          updateCellValue(cell, value);
        } else {
          toast({
            title: 'Error',
            description: 'Invalid value format',
            variant: 'destructive',
          });
          dispatch({ type: SET_HAS_ERROR, payload: true });
          updateCellValue(cell, '#ERROR', null);
        }
      }
    },
    [updateCellValue]
  );

  const saveToLocalStorage = useCallback(() => {
    if (initialized) {
      localStorage.setItem('spreadsheetData', JSON.stringify(cellValues));
    }
  }, [cellValues, initialized]);

  const handleBlur = useCallback(
    (cell: string) => {
      try {
        const formula = cellValues[cell]?.formula;
        let hasError = false;
        let hasChanged = false;
        if (formula && formula.startsWith('=')) {
          const result = evaluateFormula(formula.slice(1), cellValues, cell);
          if (result === '#ERROR' || result === '#CIRCULAR_REF') {
            hasError = true;
            dispatch({ type: SET_HAS_ERROR, payload: true });
            if (cellValues[cell]?.value !== result.toString()) {
              hasChanged = true;
            }
            updateCellValue(cell, result.toString(), formula);
          } else {
            const newValue = typeof result === 'number' ? parseFloat(result.toFixed(2)).toString() : result;
            if (cellValues[cell]?.value !== newValue) {
              hasChanged = true;
            }
            updateCellValue(cell, newValue, formula);
          }
        } else {
          const value = cellValues[cell]?.value || '';
          if (value && !validateFullValue(value)) {
            toast({
              title: 'Error',
              description: 'Invalid value format',
              variant: 'destructive',
            });
            hasError = true;
            dispatch({ type: SET_HAS_ERROR, payload: true });
            updateCellValue(cell, '#ERROR', value);
          } else {
            if (cellValues[cell]?.value !== value) {
              hasChanged = true;
            }
            updateCellValue(cell, value);
          }
        }

        if (hasChanged && !hasError) {
          dispatch({ type: SET_HAS_ERROR, payload: false });
          handleSave();
          saveToLocalStorage();
        }

        const dependentCells = Object.keys(cellValues).filter((key) => cellValues[key]?.formula?.includes(cell));
        dependentCells.forEach((dependentCell) => {
          handleBlur(dependentCell);
        });

        if (cellValues[cell]?.value === '#ERROR' || cellValues[cell]?.value === '#CIRCULAR_REF') {
          updateCellValue(cell, '', null);
        }

        dispatch({ type: SET_FOCUSED_CELL, payload: null });
      } catch (error) {
        console.error('An error occurred in handleBlur:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
        saveToLocalStorage();
      }
    },
    [cellValues, updateCellValue, handleSave, saveToLocalStorage]
  );

  const handleFocus = useCallback(
    (cell: string) => {
      const formula = cellValues[cell]?.formula;
      const cellValue = cellValues[cell]?.value;
      if (formula) {
        updateCellValue(cell, formula);
      } else if (cellValue === '#ERROR' || cellValue === '#CIRCULAR_REF') {
        updateCellValue(cell, '', null);
      }
      dispatch({ type: SET_FOCUSED_CELL, payload: cell });
    },
    [cellValues, updateCellValue]
  );

  const clearCellValue = useCallback(
    (cell: string) => {
      updateCellValue(cell, '', null);
      dispatch({ type: SET_FOCUSED_CELL, payload: null });
      saveToLocalStorage();
    },
    [updateCellValue, saveToLocalStorage]
  );

  const isError = useCallback(
    (cell: string) => {
      const cellValue = cellValues[cell]?.value;
      return cellValue === '#ERROR' || cellValue === '#CIRCULAR_REF';
    },
    [cellValues]
  );

  useEffect(() => {
    if (initialized) {
      localStorage.setItem('spreadsheetData', JSON.stringify(cellValues));
    }
  }, [cellValues, initialized]);

  useEffect(() => {
    if (focusedCell) return;
    const hasChanges = Object.entries(cellValues).some(([cell, { formula, value }]) => {
      const prevCellValue = prevCellValues.current[cell]?.value;
      const prevCellFormula = prevCellValues.current[cell]?.formula;
      return value !== prevCellValue || formula !== prevCellFormula;
    });

    if (hasChanges) {
      Object.entries(cellValues).forEach(([cell, { formula }]) => {
        if (formula && formula.startsWith('=')) {
          const result = evaluateFormula(formula.slice(1), cellValues, cell);
          updateCellValue(cell, typeof result === 'number' ? parseFloat(result.toFixed(2)).toString() : result);
        }
      });
      prevCellValues.current = cellValues;
    }
  }, [cellValues, focusedCell, updateCellValue]);

  const spreadsheetContextValue = useMemo(
    () => ({
      cellValues,
      updateCellValue,
      handleCellValueChange,
      handleBlur,
      handleFocus,
      clearCellValue,
      handleSave,
      isSaving,
      isError,
      focusedCell,
      rows,
      columns,
    }),
    [cellValues, updateCellValue, handleCellValueChange, handleBlur, handleFocus, clearCellValue, handleSave, isSaving, isError, focusedCell, rows, columns]
  );

  if (!initialized) {
    return <Loading />;
  }

  return <SpreadSheetContext.Provider value={spreadsheetContextValue}>{children}</SpreadSheetContext.Provider>;
};

export default SpreadSheetProvider;
