'use client';
import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { evaluateFormula } from '@/lib/utils';
import useLocalStorage from '@/hooks/useLocalStorage';

export interface CellValues {
  [cell: string]: {
    value: string;
    formula: string | null;
  };
}

interface SpreadSheetContextType {
  cellValues: CellValues;
  updateCellValue: (cell: string, value: string) => void;
  handleCellValueChange: (cell: string, value: string) => void;
  handleBlur: (cell: string) => void;
  handleFocus: (cell: string) => void;
  focusedCell: string | null;
  rows: number;
  columns: number;
}

interface SpreadSheetProviderProps {
  rows: number;
  columns: number;
  children: React.ReactNode;
}

export const SpreadSheetContext = createContext<SpreadSheetContextType | null>(null);

const SpreadSheetProvider = ({ rows, columns, children }: SpreadSheetProviderProps) => {
  const [cellValues, setCellValues] = useLocalStorage<CellValues>('spreadsheetData', {});
  const [initialized, setInitialized] = useState(false);
  const [focusedCell, setFocusedCell] = useState<string | null>(null);
  const prevCellValues = useRef<CellValues>({});

  useEffect(() => {
    if (!initialized) {
      const initialCellValues: CellValues = Array.from({ length: rows }, (_, rowIndex) =>
        Array.from({ length: columns }, (_, colIndex) => {
          const cell = String.fromCharCode(65 + colIndex) + (rowIndex + 1);
          return { [cell]: { value: '', formula: null } };
        }).reduce((acc, curr) => ({ ...acc, ...curr }), {})
      ).reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setCellValues((prevCellValues) => ({
        ...prevCellValues,
        ...initialCellValues,
      }));
      setInitialized(true);
    }
  }, [rows, columns, initialized, setCellValues]);

  const updateCellValue = useCallback(
    (cell: string, value: string) => {
      console.log(`Updating cell ${cell} with value ${value}`);
      setCellValues((prevCellValues: CellValues) => ({
        ...prevCellValues,
        [cell]: { ...prevCellValues[cell], value },
      }));
    },
    [setCellValues]
  );

  const handleCellValueChange = useCallback(
    (cell: string, value: string) => {
      console.log(`Changing cell ${cell} value to ${value}`);
      updateCellValue(cell, value);
    },
    [updateCellValue]
  );

  const handleBlur = useCallback(
    (cell: string) => {
      const value = cellValues[cell].value;
      console.log(`Blur event on cell ${cell} with value ${value}`);
      if (value.startsWith('=')) {
        const result = evaluateFormula(value.slice(1), cellValues);
        updateCellValue(cell, typeof result === 'number' ? parseFloat(result.toFixed(2)).toString() : result);
      }
      setFocusedCell(null);
    },
    [cellValues, updateCellValue]
  );

  const handleFocus = useCallback(
    (cell: string) => {
      console.log(`Focus event on cell ${cell}`);
      const formula = cellValues[cell].formula;
      if (formula) {
        updateCellValue(cell, formula);
      }
      setFocusedCell(cell);
    },
    [cellValues, updateCellValue]
  );

  useEffect(() => {
    if (focusedCell) return;
    const hasChanges = Object.entries(cellValues).some(([cell, { formula, value }]) => {
      const prevCellValue = prevCellValues.current[cell]?.value;
      const prevCellFormula = prevCellValues.current[cell]?.formula;
      return value !== prevCellValue || formula !== prevCellFormula;
    });

    if (hasChanges) {
      Object.entries(cellValues).forEach(([cell, { formula }]) => {
        if (formula) {
          const result = evaluateFormula(formula.slice(1), cellValues);
          updateCellValue(cell, typeof result === 'number' ? parseFloat(result.toFixed(2)).toString() : result);
        }
      });
      prevCellValues.current = cellValues;
      console.log('Updated previous cell values');
    }
  }, [cellValues, focusedCell, updateCellValue]);

  return <SpreadSheetContext.Provider value={{ cellValues, updateCellValue, handleCellValueChange, handleBlur, handleFocus, focusedCell, rows, columns }}>{children}</SpreadSheetContext.Provider>;
};

export default SpreadSheetProvider;
