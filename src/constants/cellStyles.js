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
  'transition-colors',
  'duration-150',
];

// Padding for linked/unlinked cells
export const CELL_PADDING = {
  linked: 'px-2',
  unlinked: 'px-1.5',
};

// Style classes for each cell state (edit here for all cell appearance)
export const CELL_STYLE_MAP = {
  empty: ['bg-white', 'text-slate-400', 'border-slate-200'],
  regular: ['bg-white', 'text-slate-700', 'border-slate-200'],
  hover: ['bg-white', 'text-slate-900', 'border-sky-600', 'hover:bg-sky-200',],
  selected: ['font-bold', 'border-slate-700'],
  outFridge: ['bg-slate-100', 'border-dashed', 'border-slate-700', 'italic', 'text-slate-500', 'hover:bg-sky-100'],
  disabled: ['bg-white', 'opacity-50', 'cursor-not-allowed'],
  selectedEmpty: ['bg-white', 'border-slate-700'],
  hoverEmpty: ['hover:bg-sky-100'],
  editing: ['bg-sky-100', 'border-sky-400', 'ring-2', 'ring-sky-200'],

  // Grouped cell styles (for any cell in a group)
  grouped: ['text-slate-700', 'border-slate-200', 'bg-white'],
  groupedHover: ['bg-sky-200', 'text-sky-700', 'border-sky-300', 'hover:bg-sky-200', 'hover:border-sky-600', 'hover:text-slate-900'],
  groupedSelected: ['font-bold', 'border-slate-700', 'bg-slate-200'],
};
