import { writable, derived } from 'svelte/store';
import { writable as svelteWritable } from 'svelte/store';

// Table configurations
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

// Create stores for each table's cells
const createTableStore = (tableId) => {
  const { subscribe, set, update } = writable({});
  
  return {
    subscribe,
    updateCell: (cellKey, data) => update(cells => ({
      ...cells,
      [cellKey]: { ...cells[cellKey], ...data }
    })),
    get: (cellKey) => {
      let result;
      subscribe(cells => {
        result = cells[cellKey];
      })();
      return result;
    },
    reset: () => set({})
  };
};

export const leftTableStore = createTableStore('left');
export const middleTableStore = createTableStore('middle');
export const mainTableStore = createTableStore('main');

// Store for the currently renaming cell
export const renamingCell = writable(null);

// Store for selected cells across all tables
export const selectedCells = writable(new Set());

// Derived store for cell groups
export const cellGroups = derived(
  [leftTableStore, middleTableStore, mainTableStore],
  ([$left, $middle, $main]) => {
    const groups = {};
    [...Object.entries($left), ...Object.entries($middle), ...Object.entries($main)]
      .forEach(([key, cell]) => {
        if (cell.groupName) {
          if (!groups[cell.groupName]) {
            groups[cell.groupName] = {
              color: cell.groupColor,
              cells: []
            };
          }
          groups[cell.groupName].cells.push(key);
        }
      });
    return groups;
  }
);

// Store for the currently hovered row (for global row number highlighting)
export const hoveredRow = svelteWritable(null); 