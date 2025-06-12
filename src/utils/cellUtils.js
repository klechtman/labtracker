import { CELL_STATES } from '../constants';
import { cn } from '../lib/utils';
import { leftTableStore, middleTableStore, mainTableStore } from '../stores/tableStore';

export function getCellState(state, text) {
  if (state === CELL_STATES.EMPTY) return CELL_STATES.EMPTY;
  if (state === CELL_STATES.HOVER && text === '') return CELL_STATES.EMPTY;
  return state;
}

export function getCellKey(fridge, row, col) {
  return `${fridge}-${row}-${col}`;
}

export function parseCellKey(cellKey) {
  const [fridge, row, col] = cellKey.split('-');
  return { fridge, row: parseInt(row), col: parseInt(col) };
}

export function getCellClass({ state, linked, outFridge, groupHover, isSelected, isDisabled, isSelectedGroup }) {
  return cn(
    'cell flex items-center w-full h-full min-h-[32px] max-h-[48px] min-w-0 relative text-left overflow-visible box-border border',
    {
      'border-dashed': outFridge,
      'border-solid': !outFridge,
      'px-2': linked,
      'px-1.5': !linked,
      'border-slate-300': (state === CELL_STATES.EMPTY && !isSelected) || (state !== CELL_STATES.EMPTY && state !== CELL_STATES.HOVER && !outFridge),
      'border-slate-700': outFridge || isSelected,
      'border-sky-600': state === CELL_STATES.HOVER,
      'text-slate-500': (state === CELL_STATES.EMPTY && !isSelected) || outFridge,
      'text-slate-700': state !== CELL_STATES.EMPTY && !outFridge,
      'font-bold': isSelected && state !== CELL_STATES.EMPTY,
      'font-normal': !isSelected || state === CELL_STATES.EMPTY,
      'italic': outFridge,
      'bg-sky-100': (!linked && state === CELL_STATES.HOVER) || isSelectedGroup,
      'bg-white': isSelected && state === CELL_STATES.EMPTY,
      'opacity-50 cursor-not-allowed': isDisabled,
      'hover:bg-sky-100': !isDisabled && !linked && state === CELL_STATES.EMPTY
    }
  );
}

// Map Tailwind group color names to hex values
export const GROUP_COLOR_HEX = {
  'group-green': '#10b981',
  'group-yellow': '#f59e0b',
  'group-indigo': '#6366f1',
  'group-pink': '#ec4899',
  'group-purple': '#8b5cf6',
};

export function getGroupColorHex(colorName) {
  return GROUP_COLOR_HEX[colorName] || colorName;
}

export function getCellStyle({ state, linked, groupHover, groupColor, bgColor, isSelected, isDisabled, isSelectedGroup }) {
  let style = '';
  const groupColorHex = getGroupColorHex(groupColor);
  if ((linked && (state === CELL_STATES.HOVER || (isSelected && state !== CELL_STATES.EMPTY) || groupHover)) || isSelectedGroup) {
    style += `background-color: color-mix(in srgb, ${groupColorHex} 15%, ${bgColor});`;
  } else {
    style += `background: ${bgColor};`;
  }
  if (linked && (state !== CELL_STATES.REGULAR || (isSelected && state !== CELL_STATES.EMPTY))) {
    style += `border-color: ${groupColorHex};`;
  }
  if (groupColorHex) {
    style += `--hover-color: ${groupColorHex}`;
  }
  if (isDisabled) {
    style += 'pointer-events: none;';
  }
  return style;
}

// Cell naming utilities
export function updateCellName(cellKey, newName, store) {
  if (!cellKey || !store) return;
  
  const currentCell = store.get(cellKey) || {};
  const newState = newName.trim() ? CELL_STATES.REGULAR : CELL_STATES.EMPTY;
  
  store.updateCell(cellKey, {
    ...currentCell,
    text: newName,
    state: newState
  });
}

export function getCellName(cellKey, store) {
  if (!cellKey || !store) return '';
  const cell = store.get(cellKey) || {};
  return cell.text || '';
}

export function getStoreByCellKey(cellKey) {
  if (!cellKey) return null;
  const [fridge] = cellKey.split('-');
  return fridge === 'left' ? leftTableStore : 
         fridge === 'middle' ? middleTableStore : 
         mainTableStore;
} 