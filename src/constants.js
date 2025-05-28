export const CELL_STATES = {
  EMPTY: 'empty',
  REGULAR: 'regular',
  HOVER: 'hover',
  SELECTED: 'selected',
  HOVER_SELECTED: 'hover-selected',
  RENAMING: 'renaming'
};

export const COLORS = {
  BORDER: {
    DEFAULT: 'border-slate-300',
    SELECTED: 'border-slate-700',
    HOVER: 'border-sky-600'
  },
  TEXT: {
    EMPTY: 'text-slate-500',
    REGULAR: 'text-slate-700'
  },
  BACKGROUND: {
    EVEN: 'white',
    ODD: 'var(--color-sky-50)'
  }
};

export const STYLES = {
  MIN_CELL_HEIGHT: '32px',
  MAX_CELL_HEIGHT: '48px',
  FONT: {
    FAMILY: 'Montserrat',
    SIZE: {
      CELL: '12px',
      HEADER: '14px'
    }
  }
}; 