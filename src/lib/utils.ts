import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CellValues } from './types';
import { evaluate } from 'mathjs';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const reduceZeros = (input: string) => {
  const letterPart = input.charAt(0);
  const numericPart = parseInt(input.slice(1)).toString();

  return [letterPart, numericPart];
};

export const evaluateFormula = (formula: string, cellValues: CellValues): string | number => {
  console.log('Evaluating formula:', formula);
  const match = formula.match(/([A-Z])(\d+)/g);
  let evaluatedFormula = formula;
  match?.forEach((match) => {
    const [cell, row] = reduceZeros(match);
    const cellValue = cellValues[`${cell}${row}`]?.value || '0';
    console.log(`Replacing ${match} with value ${cellValue}`);
    evaluatedFormula = evaluatedFormula.replace(match, cellValue.replace(/[^\d.%]/g, ''));
  });

  try {
    const result = evaluate(evaluatedFormula) as number;
    console.log('Evaluation result:', result);
    return result;
  } catch (error) {
    console.error('Error evaluating formula:', error);
    return '#ERROR';
  }
};
