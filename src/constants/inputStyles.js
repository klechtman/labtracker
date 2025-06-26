// src/constants/inputStyles.js
// Beginner-friendly, fully consolidated input style config

// Base styles for all input components (array for easy editing)
export const INPUT_BASE_CLASS = [
  'relative',
  'flex',
  'items-center',
  'gap-2',
  'border',
  'rounded',
  'px-2',
  'py-1',
  'w-[200px]',
  'h-[34px]',
  'transition-colors',
  'duration-150',
];

// Style classes for each input state (edit here for all input appearance)
export const INPUT_STYLE_MAP = {
  button: ['bg-white', 'hover:bg-slate-50'],
  input: ['bg-sky-100', 'ring-2', 'ring-sky-400'],
  disabled: ['opacity-50', 'cursor-not-allowed'],
  renameHover: ['bg-sky-100'],
}; 