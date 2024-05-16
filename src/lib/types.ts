export interface CellValues {
  [cell: string]: {
    value: string;
    formula: string | null;
  };
}

export enum Status {
  DONE = 'DONE',
  IN_PROGRESS = 'IN_PROGRESS',
}

export enum TypeOfMessage {
  SUCCESS = 'success',
  INFO = 'info',
  ERROR = 'error',
}
