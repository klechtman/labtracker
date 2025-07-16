import { writable, derived } from 'svelte/store';
import { tableConfigs, groupColorsHex } from '../constants';
import { localStorage } from '../lib/localStorage';

// Create stores for each table's cells with localStorage persistence
const createTableStore = (storeName) => {
  // Load initial data from localStorage
  const savedData = localStorage.load();
  const initialData = savedData?.[storeName] || {};
  
  const { subscribe, set, update } = writable(initialData);
  
  // Subscribe to changes and save to localStorage
  subscribe(value => {
    const currentData = localStorage.load() || {};
    currentData[storeName] = value;
    localStorage.save(currentData);
  });
  
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

export const leftTableStore = createTableStore('leftTable');
export const middleTableStore = createTableStore('middleTable');
export const mainTableStore = createTableStore('mainTable');

// Store for group order tracking with localStorage persistence
const createGroupOrderStore = () => {
  // Load initial data from localStorage
  const savedData = localStorage.load();
  const initialData = {
    nextColorIndex: savedData?.nextColorIndex || 0,
    nextGroupNumber: savedData?.nextGroupNumber || 1
  };
  
  const { subscribe, set, update } = writable(initialData);
  
  // Subscribe to changes and save to localStorage
  subscribe(value => {
    const currentData = localStorage.load() || {};
    currentData.nextColorIndex = value.nextColorIndex;
    currentData.nextGroupNumber = value.nextGroupNumber;
    localStorage.save(currentData);
  });
  
  return {
    subscribe,
    setNextColorIndex: (index) => update(data => ({ ...data, nextColorIndex: index })),
    setNextGroupNumber: (number) => update(data => ({ ...data, nextGroupNumber: number })),
    incrementColorIndex: () => {
      update(store => {
        const newIndex = (store.nextColorIndex + 1) % 6;
        return { ...store, nextColorIndex: newIndex };
      });
    },
    
    incrementGroupNumber: () => {
      update(store => {
        const newNumber = store.nextGroupNumber + 1;
        return { ...store, nextGroupNumber: newNumber };
      });
    },
    reset: () => set({ nextColorIndex: 0, nextGroupNumber: 1 }),
    set,
  };
};

export const groupOrderStore = createGroupOrderStore();

// Store for selected cells across all tables (do NOT persist)
export const selectedCells = writable(new Set());
export const isLinkMode = writable(false);
export const isGroupMode = writable(false);

// Temporary store for loading state (not persisted)
export const loadingCells = writable(new Set());

// Store for tracking cells affected by undo actions (for animation)
export const undoAffectedCells = writable(new Set());
// Store for tracking cells affected by action performed (for animation)
export const actionAffectedCells = writable(new Set());

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

// Store for the currently selected group (for group highlighting)
export const selectedGroup = writable(null);

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

// Store to track if any cell is currently being edited
export const isAnyCellEditing = writable(false);