import { CellValues } from '@/lib/types';

// Define action types for useReducer
export const SET_CELL_VALUES = 'SET_CELL_VALUES';
export const SET_INITIALIZED = 'SET_INITIALIZED';
export const SET_FOCUSED_CELL = 'SET_FOCUSED_CELL';
export const SET_IS_SAVING = 'SET_IS_SAVING';
export const SET_HAS_ERROR = 'SET_HAS_ERROR';
export const SET_PREV_CELL_VALUES = 'SET_PREV_CELL_VALUES';

export interface SpreadSheetState {
  cellValues: CellValues;
  initialized: boolean;
  focusedCell: string | null;
  isSaving: boolean;
  hasError: boolean;
}

interface SetCellValuesAction {
  type: typeof SET_CELL_VALUES;
  payload: CellValues;
}

interface SetInitializedAction {
  type: typeof SET_INITIALIZED;
  payload: boolean;
}

interface SetFocusedCellAction {
  type: typeof SET_FOCUSED_CELL;
  payload: string | null;
}

interface SetIsSavingAction {
  type: typeof SET_IS_SAVING;
  payload: boolean;
}

interface SetHasErrorAction {
  type: typeof SET_HAS_ERROR;
  payload: boolean;
}

interface SetPrevCellValuesAction {
  type: typeof SET_PREV_CELL_VALUES;
  payload: CellValues;
}

export type SpreadSheetAction = SetCellValuesAction | SetInitializedAction | SetFocusedCellAction | SetIsSavingAction | SetHasErrorAction | SetPrevCellValuesAction;

// Reducer function to manage state updates
export function spreadsheetReducer(state: SpreadSheetState, action: SpreadSheetAction): SpreadSheetState {
  switch (action.type) {
    case SET_CELL_VALUES:
      return { ...state, cellValues: action.payload };
    case SET_INITIALIZED:
      return { ...state, initialized: action.payload };
    case SET_FOCUSED_CELL:
      return { ...state, focusedCell: action.payload };
    case SET_IS_SAVING:
      return { ...state, isSaving: action.payload };
    case SET_HAS_ERROR:
      return { ...state, hasError: action.payload };
    case SET_PREV_CELL_VALUES:
      return { ...state, cellValues: action.payload };
    default:
      return state;
  }
}
