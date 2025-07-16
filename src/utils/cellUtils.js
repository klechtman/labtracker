import { CELL_STATES, GROUP_COLOR_HEX } from '../constants';
import { cn } from '../lib/utils';
import { leftTableStore, middleTableStore, mainTableStore, undoAffectedCells } from '../stores/tableStore';
import { CELL_BASE_CLASS, CELL_PADDING, CELL_STYLE_MAP } from '../constants/cellStyles';

// Shared animation trigger function
const animationTimeouts = {};
const actionAnimationTimeouts = {};
export function triggerAnimation(cellKeys) {
  if (cellKeys.length > 0) {
    undoAffectedCells.update(set => {
      const newSet = new Set(set);
      cellKeys.forEach(key => newSet.add(key));
      return newSet;
    });
    
    cellKeys.forEach(key => {
      // If there's an existing timeout for this cell, clear it
      if (animationTimeouts[key]) {
        clearTimeout(animationTimeouts[key]);
      }
      // Clear any existing action animation timeout for this cell
      if (actionAnimationTimeouts[key]) {
        clearTimeout(actionAnimationTimeouts[key]);
        delete actionAnimationTimeouts[key];
        // Remove from actionAffectedCells immediately
        actionAffectedCells.update(set => {
          const newSet = new Set(set);
          newSet.delete(key);
          return newSet;
        });
      }
      // Set a new timeout for this cell
      animationTimeouts[key] = setTimeout(() => {
        undoAffectedCells.update(set => {
          const newSet = new Set(set);
          newSet.delete(key);
          return newSet;
        });
        delete animationTimeouts[key];
      }, 2000);
    });
  }
}

// Action performed animation trigger
import { actionAffectedCells } from '../stores/tableStore';
export function triggerActionAnimation(cellKeys) {
  if (cellKeys.length > 0) {
    actionAffectedCells.update(set => {
      const newSet = new Set(set);
      cellKeys.forEach(key => newSet.add(key));
      return newSet;
    });
    cellKeys.forEach(key => {
      if (actionAnimationTimeouts[key]) {
        clearTimeout(actionAnimationTimeouts[key]);
      }
      actionAnimationTimeouts[key] = setTimeout(() => {
        actionAffectedCells.update(set => {
          const newSet = new Set(set);
          newSet.delete(key);
          return newSet;
        });
        delete actionAnimationTimeouts[key];
      }, 2000);
    });
  }
}

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

  // Loading state (highest priority)
  if (state === CELL_STATES.LOADING) {
    classes.push(...CELL_STYLE_MAP.loading);
  }
  // Editing state (second highest priority)
  else if (isEditing) {
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
  // Group hover (takes precedence over everything except loading/editing/disabled/outFridge)
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

  // Selected (not empty) - only apply if not loading/editing
  if (isSelected && state !== CELL_STATES.EMPTY && !isEditing && state !== CELL_STATES.LOADING) {
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