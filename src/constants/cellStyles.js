// src/constants/cellStyles.js
// Beginner-friendly, fully consolidated cell style config

// Base styles for all cells (array for easy editing)
export const CELL_BASE_CLASS = [
  'cell',
  'flex',
  'items-center',
  'w-full',
  'h-full',
  'min-h-[32px]',
  'max-h-[48px]',
  'min-w-[60px]',
  'min-w-0',
  'relative',
  'text-left',
  'overflow-visible',
  'box-border',
  'border',
  'transition-all',
  'duration-200',
  'ease-in-out',
];

// Padding for linked/unlinked cells
export const CELL_PADDING = {
  linked: 'px-2',
  unlinked: 'px-1.5',
};

// Triangle colors for different cell states (using Tailwind color classes)
export const TRIANGLE_COLOR_MAP = {
  editing: 'border-t-sky-400',
  hovered: 'border-t-sky-700', // Directly hovered cell
  active: 'border-t-slate-700',
  disabled: 'border-t-slate-200',
  default: null, // fallback to groupColor (hex)
};

// Style classes for each cell state (edit here for all cell appearance)
export const CELL_STYLE_MAP = {
  empty: ['bg-white', 'text-slate-400', 'border-slate-300'],
  regular: ['bg-white', 'text-slate-700', 'border-slate-300'],
  hover: ['bg-white', 'text-slate-900', 'border-sky-600', 'hover:bg-sky-100',],
  selected: ['font-bold', 'border-slate-700'],
  outFridge: ['bg-slate-100', 'border-dashed', 'border-slate-700', 'italic', 'text-slate-500', 'hover:bg-sky-100'],
  disabled: ['border-slate-200', 'text-slate-200','cursor-not-allowed'],
  selectedEmpty: ['bg-white', 'border-slate-700'],
  hoverEmpty: ['hover:bg-sky-100'],
  editing: ['bg-sky-50', 'border-sky-400', 'ring-2', 'ring-sky-200'],
  loading: ['text-slate-400', 'border-slate-300', 'loading-cell'],

  // Grouped cell styles (for any cell in a group)
  grouped: ['text-slate-700', 'border-slate-300', 'bg-white'],
  groupedHover: ['bg-slate-200', 'text-slate-900', 'border-slate-700', 'hover:bg-sky-100', 'hover:border-sky-600', 'hover:text-slate-900'],
  groupedSelected: ['font-bold', 'border-slate-700', 'bg-slate-200'],
};

/**
 * Get triangle color class based on cell state
 * @param {Object} params - Cell state parameters
 * @param {boolean} params.isEditing - Whether cell is being edited
 * @param {boolean} params.isHovered - Whether cell is hovered
 * @param {boolean} params.isSelected - Whether cell is selected
 * @param {boolean} params.groupHover - Whether cell's group is hovered
 * @param {boolean} params.isSelectedGroup - Whether cell's group is selected
 * @param {boolean} params.isDisabled - Whether cell is disabled
 * @param {string} params.groupColor - The group's color (fallback)
 * @returns {string} The triangle color class or inline style
 */
export function getTriangleColor({ 
  isEditing, 
  isHovered, 
  isSelected, 
  groupHover, 
  isSelectedGroup, 
  isDisabled, 
  groupColor,
  isLoading
}) {
  // Priority order: editing > active states > disabled/loading > default
  if (isEditing) {
    return TRIANGLE_COLOR_MAP.editing;
  }
  
  if (isHovered || isSelected || groupHover || isSelectedGroup) {
    return TRIANGLE_COLOR_MAP.active;
  }
  
  if (isDisabled || isLoading) {
    return TRIANGLE_COLOR_MAP.disabled;
  }
  
  // Default to group color (inline style for custom colors)
  return groupColor ? `bg-[${groupColor}]` : TRIANGLE_COLOR_MAP.default;
}

export function getTriangleClassAndStyle({
  isEditing,
  isHovered,        // TRUE only for the cell under the mouse
  isSelected,
  groupHover,
  isSelectedGroup,
  isDisabled,
  groupColor,
  isLoading
}) {
  if (isEditing) return { class: TRIANGLE_COLOR_MAP.editing, style: '' };
  if (isHovered) return { class: TRIANGLE_COLOR_MAP.hovered, style: '' };
  if (isSelected || groupHover || isSelectedGroup) return { class: TRIANGLE_COLOR_MAP.active, style: '' };
  if (isDisabled || isLoading) return { class: TRIANGLE_COLOR_MAP.disabled, style: '' };
  if (groupColor) return { class: '', style: `border-top-color: ${groupColor}` };
  return { class: '', style: '' };
}
