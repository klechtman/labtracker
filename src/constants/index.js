export const CELL_STATES = {
  EMPTY: 'empty',
  REGULAR: 'regular',
  HOVER: 'hover'
};

export const groupColors = [
  'cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6', 'cat7', 'cat8', 'cat9', 'cat10',
  'cat11', 'cat12', 'cat13', 'cat14', 'cat15', 'cat16', 'cat17', 'cat18', 'cat19', 'cat20',
  'cat21', 'cat22', 'cat23', 'cat24', 'cat25', 'cat26', 'cat27', 'cat28', 'cat29', 'cat30'
];

export const GROUP_COLOR_HEX = {
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
  '#FFC928', // cat1 - goldenrod
  '#D072A7', // cat2 - orchid
  '#CFE8B9', // cat3 - pale green
  '#682D6E', // cat4 - mulberry
  '#F4EAB0', // cat5 - ivory
  '#5D91A8', // cat6 - steel teal
  '#EB7A2D', // cat7 - princeton orange
  '#2E5B4D', // cat8 - dark slate gray
  '#D4B2D0', // cat9 - rosy mauve
  '#C9C176', // cat10 - old gold
  '#AF6175', // cat11 - dusty rose
  '#A8CB79', // cat12 - celadon
  '#F79B93', // cat13 - salmon pink
  '#8B4B2F', // cat14 - saddle brown
  '#78A16B', // cat15 - laurel green
  '#9C76B7', // cat16 - amethyst
  '#E9B7CE', // cat17 - soft pastel pink
  '#FBD6B4', // cat18 - peach
  '#9AA9D8', // cat19 - blue bell
  '#F9D7DD', // cat20 - pale pink
  '#B5643F', // cat21 - terra cotta
  '#3A599E', // cat22 - cobalt
  '#E4DAF4', // cat23 - lavender
  '#9F3B49', // cat24 - dark terra cotta
  '#D8AB31', // cat25 - saffron
  '#697A3F', // cat26 - olive green
  '#C6D9EB', // cat27 - light steel blue
  '#8F5A85', // cat28 - plum wine
  '#B35E6B', // cat29 - medium rich rose
  '#A27B2B', // cat30 - bronze
]; 

// Cell-specific styles are now in cellStyles.js 