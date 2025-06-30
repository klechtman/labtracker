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
  'cat1': '#F28C97',
  'cat2': '#E26A6A',
  'cat3': '#D8516B',
  'cat4': '#C75A68',
  'cat5': '#B75C5F',
  'cat6': '#A4494D',
  'cat7': '#F2C87A',
  'cat8': '#F2A65C',
  'cat9': '#E2B88C',
  'cat10': '#D8C35A',
  'cat11': '#D9A94F',
  'cat12': '#C29B3D',
  'cat13': '#6CA5E2',
  'cat14': '#6798D8',
  'cat15': '#5B8CD8',
  'cat16': '#5489C8',
  'cat17': '#4F79B8',
  'cat18': '#3F679E',
  'cat19': '#9BDA7F',
  'cat20': '#8CE297',
  'cat21': '#82C478',
  'cat22': '#74B464',
  'cat23': '#6CA574',
  'cat24': '#588F57',
  'cat25': '#B88CCB',
  'cat26': '#A68CE2',
  'cat27': '#9B74C8',
  'cat28': '#8861B8',
  'cat29': '#7A549B',
  'cat30': '#6B3E89',
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
  '#F28C97', // cat1
  '#E26A6A', // cat2
  '#D8516B', // cat3
  '#C75A68', // cat4
  '#B75C5F', // cat5
  '#A4494D', // cat6
  '#F2C87A', // cat7
  '#F2A65C', // cat8
  '#E2B88C', // cat9
  '#D8C35A', // cat10
  '#D9A94F', // cat11
  '#C29B3D', // cat12
  '#6CA5E2', // cat13
  '#6798D8', // cat14
  '#5B8CD8', // cat15
  '#5489C8', // cat16
  '#4F79B8', // cat17
  '#3F679E', // cat18
  '#9BDA7F', // cat19
  '#8CE297', // cat20
  '#82C478', // cat21
  '#74B464', // cat22
  '#6CA574', // cat23
  '#588F57', // cat24
  '#B88CCB', // cat25
  '#A68CE2', // cat26
  '#9B74C8', // cat27
  '#8861B8', // cat28
  '#7A549B', // cat29
  '#6B3E89', // cat30
]; 

// Cell-specific styles are now in cellStyles.js 