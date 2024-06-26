export interface CellValues {
  [cell: string]: {
    value: string;
    formula: string | null;
    error?: string | null;
  };
}
