export const CELL_STATES = {
  EMPTY: 'empty',
  REGULAR: 'regular',
  HOVER: 'hover'
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
    DEFAULT: 'white'
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

export const groupColors = [
  'group-green',
  'group-yellow',
  'group-indigo',
  'group-pink',
  'group-purple',
];

export const GROUP_COLOR_HEX = {
  'group-green': '#10b981',
  'group-yellow': '#f59e0b',
  'group-indigo': '#6366f1',
  'group-pink': '#ec4899',
  'group-purple': '#8b5cf6',
};

// Table configurations and group color config centralized here
export const tableConfigs = {
  left: {
    name: "Cytomat5",
    rows: 21,
    columns: 5
  },
  middle: {
    name: "Cytomat2",
    rows: 7,
    columns: 2
  },
  main: {
    name: "Cytomat10 Hotel",
    rows: [10, 7, 7, 7, 7, 7, 10, 21, 21, 21],
    columns: 10
  }
};

// For easy cycling of hex values
export const groupColorsHex = [
  '#10b981', // green
  '#f59e0b', // yellow
  '#6366f1', // indigo
  '#ec4899', // pink
  '#8b5cf6', // purple
]; 