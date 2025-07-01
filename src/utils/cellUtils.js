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

  // Selected (not empty) - only apply if not editing
  if (isSelected && state !== CELL_STATES.EMPTY && !isEditing) {
    classes.push(...CELL_STYLE_MAP.selected);
  }

  // Add more logic as needed for your app!

  return classes.join(' ');
}

// Map Tailwind group color names to hex values
export const GROUP_COLOR_HEX = {
  'cat1': '#FFC928',  // goldenrod
  'cat2': '#D072A7',  // orchid
  'cat3': '#CFE8B9',  // pale green
  'cat4': '#682D6E',  // mulberry
  'cat5': '#F4EAB0',  // ivory
  'cat6': '#5D91A8',  // steel teal
  'cat7': '#EB7A2D',  // princeton orange
  'cat8': '#2E5B4D',  // dark slate gray
  'cat9': '#D4B2D0',  // rosy mauve
  'cat10': '#C9C176', // old gold
  'cat11': '#AF6175', // dusty rose
  'cat12': '#A8CB79', // celadon
  'cat13': '#F79B93', // salmon pink
  'cat14': '#8B4B2F', // saddle brown
  'cat15': '#78A16B', // laurel green
  'cat16': '#9C76B7', // amethyst
  'cat17': '#E9B7CE', // soft pastel pink
  'cat18': '#FBD6B4', // peach
  'cat19': '#9AA9D8', // blue bell
  'cat20': '#F9D7DD', // pale pink
  'cat21': '#B5643F', // terra cotta
  'cat22': '#3A599E', // cobalt
  'cat23': '#E4DAF4', // lavender
  'cat24': '#9F3B49', // dark terra cotta
  'cat25': '#D8AB31', // saffron
  'cat26': '#697A3F', // olive green
  'cat27': '#C6D9EB', // light steel blue
  'cat28': '#8F5A85', // plum wine
  'cat29': '#B35E6B', // medium rich rose
  'cat30': '#A27B2B', // bronze
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