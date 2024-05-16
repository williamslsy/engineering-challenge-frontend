'use client';
import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { evaluateFormula } from '@/lib/utils';
import { Status, saveSpreadsheetData } from '@/lib/server-utils';
import { debounce } from 'lodash';

export interface CellValues {
  [cell: string]: {
    value: string;
    formula: string | null;
  };
}

interface SpreadSheetContextType {
  cellValues: CellValues;
  updateCellValue: (cell: string, value: string, formula?: string) => void;
  handleCellValueChange: (cell: string, value: string) => void;
  handleBlur: (cell: string) => void;
  handleFocus: (cell: string) => void;
  clearCellValue: (cell: string) => void;
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
  const [cellValues, setCellValues] = useState<CellValues>({});
  const [initialized, setInitialized] = useState(false);
  const [focusedCell, setFocusedCell] = useState<string | null>(null);
  const prevCellValues = useRef<CellValues>({});

  // Ensure the save only occurs onBlur
  const debouncedSave = useRef(
    debounce((newCellValues: CellValues) => {
      saveSpreadsheetData(newCellValues, rows, columns)
        .then((status) => {
          if (status === Status.DONE) {
            console.log('Data saved successfully');
          }
        })
        .catch((error) => {
          console.error('Error saving data:', error);
        });
    }, 1000)
  ).current;

  const initializeCellValues = () => {
    const getDataFromLocalStorage = localStorage.getItem('spreadsheetData');
    if (getDataFromLocalStorage) {
      setCellValues(JSON.parse(getDataFromLocalStorage) as CellValues);
      console.log('Loaded data from localStorage');
    } else {
      const initialCellValues: CellValues = Array.from({ length: rows }, (_, rowIndex) =>
        Array.from({ length: columns }, (_, colIndex) => {
          const cell = String.fromCharCode(65 + colIndex) + (rowIndex + 1);
          return { [cell]: { value: '', formula: null } };
        }).reduce((acc, curr) => ({ ...acc, ...curr }), {})
      ).reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setCellValues(initialCellValues);
      console.log('Initialized new cell values');
    }
    setInitialized(true);
  };

  useEffect(() => {
    initializeCellValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, columns]);

  const updateCellValue = useCallback((cell: string, value: string, formula?: string | null) => {
    setCellValues((prevCellValues) => {
      const updatedCellValues = {
        ...prevCellValues,
        [cell]: {
          ...prevCellValues[cell],
          value,
          formula: formula !== undefined ? formula : prevCellValues[cell].formula,
        },
      };
      return updatedCellValues;
    });
  }, []);

  const handleCellValueChange = useCallback(
    (cell: string, value: string) => {
      if (value.startsWith('=')) {
        updateCellValue(cell, value, value);
      } else {
        if (value.trim() === '') {
          updateCellValue(cell, '', null);
        } else {
          updateCellValue(cell, value);
        }
      }
    },
    [updateCellValue]
  );

  const handleBlur = useCallback(
    (cell: string) => {
      const formula = cellValues[cell]?.formula;
      if (formula && formula.startsWith('=')) {
        const result = evaluateFormula(formula.slice(1), cellValues, cell); // Pass the current cell
        updateCellValue(cell, typeof result === 'number' ? parseFloat(result.toFixed(2)).toString() : result, formula);
      }
      // debouncedSave(cellValues);
      setFocusedCell(null);
    },
    [cellValues, updateCellValue, debouncedSave]
  );

  const handleFocus = useCallback(
    (cell: string) => {
      const formula = cellValues[cell]?.formula;
      if (formula) {
        updateCellValue(cell, formula);
      }
      setFocusedCell(cell);
    },
    [cellValues, updateCellValue]
  );

  const clearCellValue = useCallback(
    (cell: string) => {
      updateCellValue(cell, '', null);
      setFocusedCell(null);
    },
    [updateCellValue]
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
          const result = evaluateFormula(formula.slice(1), cellValues, cell); // Pass the current cell
          updateCellValue(cell, typeof result === 'number' ? parseFloat(result.toFixed(2)).toString() : result);
        }
      });
      prevCellValues.current = cellValues;
    }
  }, [cellValues, focusedCell, updateCellValue]);

  if (!initialized) {
    return <>Loading Skeleton...</>;
  }

  return (
    <SpreadSheetContext.Provider
      value={{
        cellValues,
        updateCellValue,
        handleCellValueChange,
        handleBlur,
        handleFocus,
        clearCellValue,
        focusedCell,
        rows,
        columns,
      }}
    >
      {children}
    </SpreadSheetContext.Provider>
  );
};

export default SpreadSheetProvider;
