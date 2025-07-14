import { leftTableStore, middleTableStore, mainTableStore, groupOrderStore } from '../stores/tableStore';
import { tableConfigs, groupColorsHex, CELL_STATES } from '../constants';
import { getCellKey } from '../utils/cellUtils';

// Generate random sample data
const sampleTexts = [
  'Sample 1', 'Sample 2', 'Sample 3', 'Sample 4', 'Sample 5',
  'Test A', 'Test B', 'Test C', 'Test D', 'Test E',
  'Control X', 'Control Y', 'Control Z',
  'Experiment 1', 'Experiment 2', 'Experiment 3',
  'Culture A', 'Culture B', 'Culture C',
  'Strain X', 'Strain Y', 'Strain Z',
  'Media 1', 'Media 2', 'Media 3',
  'Buffer A', 'Buffer B', 'Buffer C',
  'Reagent 1', 'Reagent 2', 'Reagent 3',
  'Solution X', 'Solution Y', 'Solution Z'
];

// Get random text from sample texts
function getRandomText() {
  return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
}

function getAllRenderedCellKeys() {
  const keys = [];
  // Left table
  for (let row = 0; row < tableConfigs.left.rows; row++) {
    for (let col = 0; col < tableConfigs.left.columns; col++) {
      keys.push(getCellKey('left', row, col));
    }
  }
  // Middle table
  for (let row = 0; row < tableConfigs.middle.rows; row++) {
    for (let col = 0; col < tableConfigs.middle.columns; col++) {
      keys.push(getCellKey('middle', row, col));
    }
  }
  // Main table (hotel layout)
  for (let col = 0; col < tableConfigs.main.columns; col++) {
    const colRows = tableConfigs.main.rows[col] || 0;
    for (let row = 0; row < colRows; row++) {
      keys.push(getCellKey('main', row, col));
    }
  }
  return keys;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Get store by cell key
function getStoreByCellKey(cellKey) {
  const [fridge] = cellKey.split('-');
  if (fridge === 'left') return leftTableStore;
  if (fridge === 'middle') return middleTableStore;
  return mainTableStore;
}

// Populate the app with random data
export function populateApp() {
  console.log('Starting population of app (rendered cells only)...');
  const allCellKeys = getAllRenderedCellKeys();
  const totalCells = allCellKeys.length;
  const cellsToFill = Math.floor(totalCells * 0.7); // 70% of rendered cells
  console.log(`Total rendered cells: ${totalCells}`);
  console.log(`Cells to fill (70%): ${cellsToFill}`);
  
  // Shuffle all rendered cell keys
  const shuffledKeys = shuffleArray(allCellKeys);
  
  // Take the first 70% of rendered cells to fill
  const cellsToFillKeys = shuffledKeys.slice(0, cellsToFill);
  
  // Now shuffle the 70% again and pick 90 for groups
  const shuffledFillKeys = shuffleArray(cellsToFillKeys);
  const cellsForGroups = shuffledFillKeys.slice(0, 90); // 30 groups of 3
  const remainingCells = shuffledFillKeys.slice(90); // rest of filled cells
  
  // Reset stores first
  leftTableStore.reset();
  middleTableStore.reset();
  mainTableStore.reset();
  groupOrderStore.reset();
  
  // Create 30 groups
  for (let groupIndex = 0; groupIndex < 30; groupIndex++) {
    const groupStartIndex = groupIndex * 3;
    const groupCells = cellsForGroups.slice(groupStartIndex, groupStartIndex + 3);
    const groupName = `Group${groupIndex + 1}`;
    const groupColor = groupColorsHex[groupIndex];
    
    // Fill each cell in the group
    groupCells.forEach(cellKey => {
      const store = getStoreByCellKey(cellKey);
      store.updateCell(cellKey, {
        text: getRandomText(),
        linked: true,
        groupName,
        groupColor,
        outFridge: false,
        state: CELL_STATES.REGULAR
      });
    });
  }
  
  // Fill remaining cells (unlinked)
  remainingCells.forEach(cellKey => {
    const store = getStoreByCellKey(cellKey);
    store.updateCell(cellKey, {
      text: getRandomText(),
      linked: false,
      groupName: '',
      groupColor: '',
      outFridge: false,
      state: CELL_STATES.REGULAR
    });
  });
  
  // Update group order store to reflect the groups we created
  groupOrderStore.setNextColorIndex(30);
  groupOrderStore.setNextGroupNumber(31);
  
  console.log(`Populated app with ${cellsToFill} filled cells:`);
  console.log(`- 30 groups of 3 cells each (90 cells)`);
  console.log(`- ${remainingCells.length} unlinked filled cells`);
  console.log(`- ${totalCells - cellsToFill} empty cells`);
} 

export { getAllRenderedCellKeys }; 