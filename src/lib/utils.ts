import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CellValues } from './types';
import { evaluate } from 'mathjs';
import { toast } from '@/components/ui/use-toast';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const reduceZeros = (input: string) => {
  const letterPart = input.charAt(0);
  const numericPart = parseInt(input.slice(1)).toString();

  return [letterPart, numericPart];
};

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

    const match = formula.match(/([A-Z])(\d+)/g);
    let evaluatedFormula = formula;

    // Handle circular references vulnerability
    if (match) {
      for (const refCell of match) {
        const refCellFormula = cellValues[refCell]?.formula || '';

        if (refCellFormula.includes(currentCell)) {
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

        console.log(`Replacing ${refCell} with value ${cellValues[refCell]?.value || '0'}`);
        evaluatedFormula = evaluatedFormula.replace(refCell, (cellValues[refCell]?.value || '0').replace(/[^\d.%]/g, ''));
      }
    }

    const result = evaluate(evaluatedFormula) as number;
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
