'use client';
import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { evaluateFormula } from '@/lib/utils';
import { Status, saveSpreadsheetData } from '@/lib/server-utils';
import { debounce, has, set } from 'lodash';
import { toast } from '@/components/ui/use-toast';
import { CellValues } from '@/lib/types';
import Loading from '@/app/loading';

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
  children: React.ReactNode;
}

export const SpreadSheetContext = createContext<SpreadSheetContextType | null>(null);

const SpreadSheetProvider = ({ rows, columns, children }: SpreadSheetProviderProps) => {
  const [cellValues, setCellValues] = useState<CellValues>({});
  const [initialized, setInitialized] = useState(false);
  const [focusedCell, setFocusedCell] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const prevCellValues = useRef<CellValues>({});

  // Debounced save to endpoint
  const debouncedSaveToEndpoint = useRef(
    debounce(async () => {
      setIsSaving(true);
      try {
        const status = await saveSpreadsheetData(cellValues, rows, columns);
        if (status === Status.DONE) {
          console.log('Data saved to endpoint successfully');
        }
      } catch (error) {
        console.error('Error saving data to endpoint:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000)
  ).current;

  const handleSave = useCallback(() => {
    !hasError && debouncedSaveToEndpoint();
  }, [debouncedSaveToEndpoint, hasError]);

  useEffect(() => {
    const initializeCellValues = () => {
      const getDataFromLocalStorage = localStorage.getItem('spreadsheetData');
      if (getDataFromLocalStorage) {
        setCellValues(JSON.parse(getDataFromLocalStorage) as CellValues);
        console.log('Loaded data from localStorage');
      } else {
        // minimizes for loops by using reduce and spread operator to initialize cell values
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

    initializeCellValues();
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
        // Evaluate formula if it starts with '='
        if (formula && formula.startsWith('=')) {
          const result = evaluateFormula(formula.slice(1), cellValues, cell);
          if (result === '#ERROR' || result === '#CIRCULAR_REF') {
            hasError = true;
            setHasError(true);
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
          // Matches values like $1000, 1000, 5%, 1000.00, $1000.00 etc.
          const validValueRegex = /^(\$?\d+(\.\d+)?%?)$/;

          if (value && !validValueRegex.test(value)) {
            toast({
              title: 'Error',
              description: 'Invalid value format',
              variant: 'destructive',
            });
            hasError = true;
            setHasError(true);
            updateCellValue(cell, '#ERROR', value);
          } else {
            if (cellValues[cell]?.value !== value) {
              hasChanged = true;
            }
            updateCellValue(cell, value);
          }
        }

        if (hasChanged && !hasError) {
          setHasError(false);
          handleSave();
          saveToLocalStorage();
        }

        setFocusedCell(null);
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
      saveToLocalStorage();
    },
    [updateCellValue, saveToLocalStorage]
  );

  const isError = (cell: string) => {
    const cellValue = cellValues[cell]?.value;
    return cellValue === '#ERROR' || cellValue === '#CIRCULAR_REF';
  };

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
    return (
      <>
        <Loading />
      </>
    );
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
        handleSave,
        isSaving,
        isError,
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
