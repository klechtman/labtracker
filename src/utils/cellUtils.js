import { CELL_STATES } from '../constants';
import { cn } from '../lib/utils';
import { leftTableStore, middleTableStore, mainTableStore } from '../stores/tableStore';
import { CELL_BASE_CLASS, CELL_PADDING, CELL_STYLE_MAP } from '../constants/cellStyles';

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
  let classes = [...CELL_BASE_CLASS];

  // Padding
  classes.push(linked ? CELL_PADDING.linked : CELL_PADDING.unlinked);

  // Disabled
  if (isDisabled) {
    classes.push(...CELL_STYLE_MAP.disabled);
  }
  // OutFridge
  else if (outFridge) {
    classes.push(...CELL_STYLE_MAP.outFridge);
  }
  // Selected group
  else if (isSelectedGroup) {
    classes.push(...CELL_STYLE_MAP.selectedGroup);
  }
  // Selected and empty
  else if (isSelected && state === CELL_STATES.EMPTY) {
    classes.push(...CELL_STYLE_MAP.selectedEmpty);
  }
  // Empty
  else if (state === CELL_STATES.EMPTY) {
    classes.push(...CELL_STYLE_MAP.empty);
  }
  // Hover
  else if (state === CELL_STATES.HOVER) {
    classes.push(...CELL_STYLE_MAP.hover);
  }
  // Regular
  else if (state === CELL_STATES.REGULAR) {
    classes.push(...CELL_STYLE_MAP.regular);
  }

  // Selected (not empty)
  if (isSelected && state !== CELL_STATES.EMPTY) {
    classes.push(...CELL_STYLE_MAP.selected);
  }

  // Add more logic as needed for your app!

  return classes.join(' ');
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
  } else if (linked || groupColorHex || isSelectedGroup) {
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