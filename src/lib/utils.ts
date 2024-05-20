/**
 * Utility functions for handling common tasks such as CSS class merging,
 * formula evaluation, data conversion, and value validation.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CellValues } from './types';
import { evaluate } from 'mathjs';
import { toast } from '@/components/ui/use-toast';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Reduces leading zeros in a cell identifier (e.g., "A01" to "A1").
 * @param input - The cell identifier.
 * @returns An array with the letter part and the numeric part.
 */

export const reduceZeros = (input: string) => {
  const letterPart = input.charAt(0);
  const numericPart = parseInt(input.slice(1)).toString();
  return [letterPart, numericPart];
};

/**
 * Evaluates a formula within the context of the spreadsheet.
 * @param formula - The formula to evaluate.
 * @param cellValues - The current cell values.
 * @param currentCell - The cell being evaluated.
 * @param visitedCells - A set of cells that have been visited to detect circular references.
 * @returns The result of the formula or an error indicator.
 */

export const evaluateFormula = (formula: string, cellValues: CellValues, currentCell: string, visitedCells: Set<string> = new Set()): string | number => {
  console.log('Evaluating formula:', formula);

  try {
    visitedCells.add(currentCell);

    const invalidCharacters = /[^A-Z0-9+*-/(). ]/i;

    if (invalidCharacters.test(formula)) {
      toast({
        title: 'Error',
        description: 'Invalid or incomplete formula',
        variant: 'destructive',
      });
      return '#ERROR';
    }

    const match = formula.match(/([A-Z]+[0-9]+)/g);
    let evaluatedFormula = formula;

    // Handles invalid cell reference errors
    if (match) {
      for (const refCell of match) {
        if (!cellValues[refCell]) {
          console.error(`Invalid cell reference: ${refCell}`);
          toast({
            title: 'Error',
            description: `Invalid cell reference ${refCell}`,
            variant: 'destructive',
          });
          return '#ERROR';
        }

        // Handles circular reference vulnerabilities
        if (cellValues[refCell]?.formula?.includes(currentCell)) {
          console.error('Circular dependency detected:', refCell);
          toast({
            title: 'Error',
            description: 'Circular dependency detected',
            variant: 'destructive',
          });
          return '#CIRCULAR_REF';
        }

        if (visitedCells.has(refCell)) {
          console.error('Circular dependency detected:', refCell);
          toast({
            title: 'Error',
            description: 'Circular dependency detected',
            variant: 'destructive',
          });
          return '#CIRCULAR_REF';
        }

        visitedCells.add(refCell);
        console.log(`Replacing ${refCell} with value ${cellValues[refCell]?.value || '0'}`);
        evaluatedFormula = evaluatedFormula.replace(new RegExp(refCell, 'g'), (cellValues[refCell]?.value || '0').replace(/[^\d.%]/g, ''));
      }
    }

    const result = evaluate(evaluatedFormula);

    // Ensures result is a primitive value
    if (typeof result === 'object') {
      console.error('Evaluation result is an object:', result);
      toast({
        title: 'Error',
        description: 'Invalid formula result',
        variant: 'destructive',
      });
      return '#ERROR';
    }

    console.log('Evaluation result:', result);
    return result;
  } catch (error: any) {
    console.error('Error evaluating formula:', error);
    toast({
      title: 'Error',
      description: error.message,
      variant: 'destructive',
    });
    return '#ERROR';
  }
};

/**
 * Converts the cell values to CSV format.
 * @param data - The cell values.
 * @param rows - The number of rows.
 * @param columns - The number of columns.
 * @returns The CSV representation of the cell values.
 */

export const convertToCSV = (data: CellValues, rows: number, columns: number): string => {
  const csvRows: string[] = [];

  for (let row = 1; row <= rows; row++) {
    const rowData: string[] = [];
    for (let col = 1; col <= columns; col++) {
      const cell = String.fromCharCode(64 + col) + row;
      const cellValue = data[cell]?.value || '';
      rowData.push(cellValue);
    }
    csvRows.push(rowData.join(','));
  }
  return csvRows.join('\n');
};

/**
 * Validates partial input values for cells (e.g., $100, 5%).
 * @param value - The value to validate.
 * @returns True if the value is valid, false otherwise.
 */

export const validatePartialValue = (value: string): boolean => {
  const validPartialValueRegex = /^(\$?\d*(\.\d*)?%?)$/;
  return validPartialValueRegex.test(value);
};

/**
 * Validates full input values for cells (e.g., $1000, 1000, 5%, 1000.00, $1000.00).
 * @param value - The value to validate.
 * @returns True if the value is valid, false otherwise.
 */

export const validateFullValue = (value: string): boolean => {
  const validFullValueRegex = /^(\$?\d+(\.\d+)?%?)$/;
  return validFullValueRegex.test(value);
};
