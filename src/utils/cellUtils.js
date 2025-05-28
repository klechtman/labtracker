import { CELL_STATES } from '../constants';

export function getCellState(state, text) {
  if (state === CELL_STATES.EMPTY) return CELL_STATES.EMPTY;
  if (state === CELL_STATES.HOVER && text === '') return CELL_STATES.EMPTY;
  return state;
}

export function getBorderStyle(outFridge) {
  return outFridge ? 'border-dashed' : 'border-solid';
}

export function getPaddingStyle(linked) {
  return linked ? 'px-2' : 'px-1.5';
}

export function getHoverBgColor(state, linked, groupHover) {
  if (state === CELL_STATES.HOVER || 
      state === CELL_STATES.HOVER_SELECTED || 
      state === CELL_STATES.RENAMING || 
      groupHover) {
    return linked ? 'hover-bg' : 'hover-bg-regular';
  }
  return '';
}

export function getCellKey(fridge, row, col) {
  return `${fridge}-${row}-${col}`;
}

export function parseCellKey(cellKey) {
  const [fridge, row, col] = cellKey.split('-');
  return { fridge, row: parseInt(row), col: parseInt(col) };
} 