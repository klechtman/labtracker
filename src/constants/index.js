export const CELL_STATES = {
  EMPTY: 'empty',
  REGULAR: 'regular',
  HOVER: 'hover'
};

// Single source of truth for colors
const COLOR_DEFINITIONS = {
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

// Derived formats - all from the same source
export const groupColors = Object.keys(COLOR_DEFINITIONS);
export const GROUP_COLOR_HEX = COLOR_DEFINITIONS;
export const groupColorsHex = Object.values(COLOR_DEFINITIONS);

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

 

// Cell-specific styles are now in cellStyles.js 