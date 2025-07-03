// src/constants/inputStyles.js
// Beginner-friendly, fully consolidated input style config

export const INPUT_STYLES = {
  base: [
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
  ],
  default: ['bg-white', 'border-slate-300', 'hover:bg-sky-100'],
  focus: ['focus-within:bg-sky-50', 'focus-within:ring-2', 'focus-within:ring-sky-200', 'focus-within:border-sky-400', 'hover:bg-sky-100'],
  highlight: ['bg-sky-50', 'ring-2', 'ring-sky-200', 'border-sky-400', 'hover:bg-sky-100'],
  renameHover: ['hover:bg-sky-100'],
  button: ['bg-white', 'hover:bg-slate-100'],
  disabled: ['opacity-50', 'hover:bg-slate-100', 'cursor-not-allowed'],
}; 