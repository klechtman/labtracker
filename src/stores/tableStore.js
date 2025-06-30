import { writable, derived } from 'svelte/store';
import { tableConfigs } from '../constants';

// Create stores for each table's cells
const createTableStore = () => {
  const { subscribe, set, update } = writable({});
  return {
    subscribe,
    updateCell: (cellKey, data) => update(cells => ({
      ...cells,
      [cellKey]: { ...cells[cellKey], ...data }
    })),
    get: (cellKey) => {
      let value;
      const unsubscribe = subscribe(v => value = v);
      unsubscribe();
      return value[cellKey];
    },
    reset: () => set({}),
    set,
  };
};

export const leftTableStore = createTableStore();
export const middleTableStore = createTableStore();
export const mainTableStore = createTableStore();

// Store for selected cells across all tables
export const selectedCells = writable(new Set());
export const isLinkMode = writable(false);
export const isGroupMode = writable(false);

// Svelte 5: cellGroups as a function to be used in Svelte components
export function getCellGroups(left, middle, main) {
  const groups = {};
  for (const [key, cell] of [
    ...Object.entries(left || {}),
    ...Object.entries(middle || {}),
    ...Object.entries(main || {})
  ]) {
    if (cell.groupName) {
      if (!groups[cell.groupName]) {
        groups[cell.groupName] = {
          color: cell.groupColor,
          cells: []
        };
      }
      groups[cell.groupName].cells.push(key);
    }
  }
  return groups;
}

// Store for the currently hovered row (for global row number highlighting)
export const hoveredRow = writable(null);

export const selectedCellData = derived(
  [selectedCells, leftTableStore, middleTableStore, mainTableStore],
  ([$selectedCells, $leftTableStore, $middleTableStore, $mainTableStore]) => {
    if ($selectedCells.size === 0) return null;
    const cellKey = Array.from($selectedCells)[0];
    if (!cellKey) return null;
    const [fridge] = cellKey.split('-');
    let store;
    if (fridge === 'left') store = $leftTableStore;
    else if (fridge === 'middle') store = $middleTableStore;
    else store = $mainTableStore;
    return store[cellKey] || null;
  }
);

// Store for the currently selected group (for group highlighting)
export const selectedGroup = writable(null);