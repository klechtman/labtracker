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

export function getCellClass({ state, linked, outFridge, groupHover }) {
  let classes = [
    'cell',
    'flex',
    'items-center',
    'w-full',
    'h-full',
    'min-h-[32px]',
    'max-h-[48px]',
    'min-w-0',
    'relative',
    'text-left',
    'overflow-visible',
    'box-border',
    'border',
    getBorderStyle(outFridge),
    getPaddingStyle(linked)
  ];
  if (state === CELL_STATES.EMPTY || (state !== CELL_STATES.EMPTY && state !== CELL_STATES.HOVER && state !== CELL_STATES.HOVER_SELECTED && state !== CELL_STATES.RENAMING && state !== CELL_STATES.SELECTED && !outFridge)) {
    classes.push('border-slate-300');
  }
  if (outFridge || state === CELL_STATES.SELECTED || state === CELL_STATES.HOVER_SELECTED) {
    classes.push('border-slate-700');
  }
  if (state === CELL_STATES.HOVER || state === CELL_STATES.RENAMING) {
    classes.push('border-sky-600');
  }
  if (state === CELL_STATES.EMPTY || outFridge) {
    classes.push('text-slate-500');
  }
  if (state !== CELL_STATES.EMPTY && !outFridge) {
    classes.push('text-slate-700');
  }
  if (state === CELL_STATES.SELECTED || state === CELL_STATES.HOVER_SELECTED) {
    classes.push('font-bold');
  } else {
    classes.push('font-normal');
  }
  if (outFridge) {
    classes.push('italic');
  }
  if (!linked && (state === CELL_STATES.HOVER || state === CELL_STATES.HOVER_SELECTED || state === CELL_STATES.RENAMING)) {
    classes.push('bg-sky-200');
  }
  return classes.join(' ');
}

// Map Tailwind group color names to hex values
const GROUP_COLOR_HEX = {
  'group-green': '#10b981',
  'group-yellow': '#f59e0b',
  'group-indigo': '#6366f1',
  'group-pink': '#ec4899',
  'group-purple': '#8b5cf6',
};

export function getGroupColorHex(colorName) {
  return GROUP_COLOR_HEX[colorName] || colorName;
}

export function getCellStyle({ state, linked, groupHover, groupColor, bgColor }) {
  let style = '';
  const groupColorHex = getGroupColorHex(groupColor);
  if (linked && (state === CELL_STATES.HOVER || state === CELL_STATES.HOVER_SELECTED || state === CELL_STATES.RENAMING || groupHover)) {
    style += `background-color: color-mix(in srgb, ${groupColorHex} 15%, white);`;
  } else {
    style += ` background: ${bgColor};`;
  }
  if (linked && state !== CELL_STATES.REGULAR) {
    style += `border-color: ${groupColorHex};`;
  }
  if (groupColorHex) {
    style += `--hover-color: ${groupColorHex}`;
  }
  return style;
} 