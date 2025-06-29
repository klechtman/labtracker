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
  inputDefault: ['bg-white', 'border-slate-300'], // regular state
  focus: ['focus-within:bg-sky-50', 'focus-within:ring-1', 'focus-within:ring-sky-400', 'focus-within:border-sky-400'], // focus state using Tailwind focus variants
  hover: ['hover:bg-sky-100'],
  buttonHover: ['hover:bg-slate-50'], // separate hover for button (dropdown trigger)
  disabled: ['opacity-50', 'cursor-not-allowed'],
  renameHover: ['hover:bg-sky-100'],
}; 