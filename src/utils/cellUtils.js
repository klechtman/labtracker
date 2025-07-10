import { CELL_STATES, GROUP_COLOR_HEX } from '../constants';
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

export function getCellClass({ state, linked, outFridge, groupHover, isSelected, isDisabled, isSelectedGroup, isEditing }) {
  let classes = [...CELL_BASE_CLASS];

  // Padding
  classes.push(linked ? CELL_PADDING.linked : CELL_PADDING.unlinked);

  // Editing state (highest priority)
  if (isEditing) {
    classes.push(...CELL_STYLE_MAP.editing);
  }
  // Disabled
  else if (isDisabled) {
    classes.push(...CELL_STYLE_MAP.disabled);
  }
  // OutFridge
  else if (outFridge) {
    classes.push(...CELL_STYLE_MAP.outFridge);
  }
  // Group hover (takes precedence over everything except editing/disabled/outFridge)
  else if (groupHover) {
    classes.push(...CELL_STYLE_MAP.groupedHover);
  }
  // Selected group
  else if (isSelectedGroup) {
    classes.push(...CELL_STYLE_MAP.groupedSelected);
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
    if (linked) {
      classes.push(...CELL_STYLE_MAP.groupedHover);
    } else {
      classes.push(...CELL_STYLE_MAP.hover);
    }
  }
  // Regular
  else if (state === CELL_STATES.REGULAR) {
    if (linked) {
      classes.push(...CELL_STYLE_MAP.grouped);
    } else {
      classes.push(...CELL_STYLE_MAP.regular);
    }
  }

  // Selected (not empty) - only apply if not editing
  if (isSelected && state !== CELL_STATES.EMPTY && !isEditing) {
    if (linked) {
      classes.push(...CELL_STYLE_MAP.groupedSelected);
    } else {
      classes.push(...CELL_STYLE_MAP.selected);
    }
  }

  return classes.join(' ');
}

export function getGroupColorHex(colorName) {
  return GROUP_COLOR_HEX[colorName] || colorName;
}

export function getCellStyle({ state, linked, groupHover, groupColor, bgColor, isSelected, isDisabled, isSelectedGroup, isEditing, outFridge }) {
  let style = '';
  
  // groupColor is already a hex value, no need to convert
  if (groupColor && linked && !isEditing) {
    // Set CSS custom property for group color
    style += `--group-color: ${groupColor};`;
  }
  
  // Disabled state
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