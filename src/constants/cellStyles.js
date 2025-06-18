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
  empty: ['bg-white', 'text-slate-500', 'border-slate-300'],
  regular: ['bg-white', 'text-slate-700', 'border-slate-300'],
  hover: ['bg-white', 'text-slate-700', 'border-sky-600', 'hover:bg-sky-100'],
  selected: ['font-bold', 'border-slate-700'],
  outFridge: ['bg-white', 'border-dashed', 'border-slate-700', 'italic', 'text-slate-500', 'hover:bg-sky-100'],
  disabled: ['bg-white', 'opacity-50', 'cursor-not-allowed'],
  selectedGroup: ['bg-sky-100'],
  selectedEmpty: ['bg-white', 'border-slate-700'],
  hoverEmpty: ['hover:bg-sky-100'],
};
