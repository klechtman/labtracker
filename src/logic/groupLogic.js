import { CELL_STATES } from '../constants';
import { selectedCells, leftTableStore, middleTableStore, mainTableStore, isLinkMode, selectedGroup } from '../stores/tableStore';

// This is the exact canLinkCells logic from App.svelte
export function canLinkCells($selectedCells, $leftTableStore, $middleTableStore, $mainTableStore, $isLinkMode, $selectedGroup) {
  const selected = $selectedCells;
  if (selected.size < 2) return false;

  let existingGroup = null;
  let hasUnlinkedCell = false;
  let hasEmptyCell = false;
  
  for (const cellKey of selected) {
    const [fridge] = cellKey.split('-');
    const store = fridge === 'left' ? $leftTableStore : 
                 fridge === 'middle' ? $middleTableStore : 
                 $mainTableStore;
    
    const cellData = store[cellKey] || {};
    
    // Check if any cell is empty
    if (!cellData.text || !cellData.text.trim()) {
      hasEmptyCell = true;
      break;
    }
    
    if (cellData.linked) {
      if (existingGroup && existingGroup !== cellData.groupName) {
        // Found cells from different groups - cannot link
        return false;
      } else {
        existingGroup = cellData.groupName;
      }
    } else {
      // Found an unlinked cell - can link
      hasUnlinkedCell = true;
    }
  }
  // Can link if we found an unlinked cell and no empty cells
  return hasUnlinkedCell && !hasEmptyCell;
}

// This is the exact handleLinkCells logic from App.svelte
export function handleLinkCells({
  $selectedCells, $leftTableStore, $middleTableStore, $mainTableStore, $isLinkMode, $selectedGroup, groupColorsHex, nextColorIndex, nextGroupNumber, setNextColorIndex, setNextGroupNumber
}) {
  const selected = $selectedCells;
  if (selected.size < 2 || !canLinkCells($selectedCells, $leftTableStore, $middleTableStore, $mainTableStore, $isLinkMode, $selectedGroup)) return;

  // Check if any selected cells are already in a group
  let existingGroup = null;
  let existingGroupColor = null;
  
  selected.forEach(cellKey => {
    const [fridge] = cellKey.split('-');
    const store = fridge === 'left' ? leftTableStore : 
                 fridge === 'middle' ? middleTableStore : 
                 mainTableStore;
    
    const cellData = store.get(cellKey) || {};
    
    if (cellData.linked) {
      // If we find a cell from a different group, prevent linking
      if (existingGroup && existingGroup !== cellData.groupName) {
        alert('Cannot link cells from different groups!');
        selectedCells.set(new Set());
        return;
      }
      existingGroup = cellData.groupName;
      existingGroupColor = cellData.groupColor;
    }
  });

  // If we found an existing group, use its properties
  let groupName, groupColor;
  if (existingGroup) {
    groupName = existingGroup;
    groupColor = existingGroupColor;
  } else {
    // Create new group with next color in sequence
    groupName = `Group${nextGroupNumber}`;
    setNextGroupNumber(nextGroupNumber + 1);
    groupColor = groupColorsHex[nextColorIndex];
    setNextColorIndex((nextColorIndex + 1) % groupColorsHex.length);
  }

  // Update all selected cells with the group info
  selected.forEach(cellKey => {
    const [fridge] = cellKey.split('-');
    const store = fridge === 'left' ? leftTableStore : 
                 fridge === 'middle' ? middleTableStore : 
                 mainTableStore;
    
    // Get current cell data to preserve existing properties
    const currentCell = store.get(cellKey) || {};
    
    // Update all cells, whether they were linked or not
    store.updateCell(cellKey, {
      ...currentCell,
      linked: true,
      groupName,
      groupColor,
      state: CELL_STATES.REGULAR // Reset state for all cells
    });
  });

  // Clear selection
  selectedCells.set(new Set());
}

// Unlink a single cell (from Header.svelte)
export function unlinkCell($selectedCells, getStoreByCellKey) {
  const selected = $selectedCells;
  if (selected.size === 0) return;
  const cellKey = Array.from(selected)[0];
  const store = getStoreByCellKey(cellKey);
  const cellData = store.get(cellKey) || {};
  if (cellData.linked) {
    // Get all cells in the same group by iterating over the store values directly
    const groupName = cellData.groupName;
    const groupCells = [];
    [leftTableStore, middleTableStore, mainTableStore].forEach(storeObj => {
      Object.entries(storeObj.get()).forEach(([key, cell]) => {
        if (cell.linked && cell.groupName === groupName) {
          groupCells.push({ key, store: storeObj });
        }
      });
    });
    // If unlinking would leave only one cell, unlink all cells in the group
    if (groupCells.length <= 2) {
      groupCells.forEach(({ key, store }) => {
        const currentCell = store.get(key) || {};
        store.updateCell(key, {
          ...currentCell,
          linked: false,
          groupName: '',
          groupColor: '',
          state: CELL_STATES.REGULAR
        });
      });
    } else {
      // Otherwise just unlink the selected cell
      store.updateCell(cellKey, {
        ...cellData,
        linked: false,
        groupName: '',
        groupColor: '',
        state: CELL_STATES.REGULAR
      });
    }
    // Clear selection
    selectedCells.set(new Set());
  }
}

// Erase a single cell (from Header.svelte)
export function eraseCell($selectedCells, getStoreByCellKey) {
  const selected = $selectedCells;
  if (selected.size === 0) return;
  const cellKey = Array.from(selected)[0];
  const store = getStoreByCellKey(cellKey);
  // Reset all properties to default
  store.updateCell(cellKey, {
    text: '',
    linked: false,
    groupName: '',
    groupColor: '',
    outFridge: false,
    state: CELL_STATES.EMPTY
  });
  // Clear selection
  selectedCells.set(new Set());
}

// Unlink all in group (from GroupInfoBar.svelte)
export function unlinkAllInGroup($selectedGroup, $leftTableStore, $middleTableStore, $mainTableStore, renamingGroupBar, selectedGroup, setShowDropdown) {
  const group = $selectedGroup;
  if (!group || renamingGroupBar) return;
  const allStores = [
    { store: leftTableStore, data: $leftTableStore },
    { store: middleTableStore, data: $middleTableStore },
    { store: mainTableStore, data: $mainTableStore }
  ];
  allStores.forEach(({ store, data }) => {
    Object.entries(data).forEach(([key, cell]) => {
      if (cell.groupName === group) {
        store.updateCell(key, {
          ...cell,
          linked: false,
          groupName: '',
          groupColor: ''
        });
      }
    });
  });
  selectedGroup.set(null);
  setShowDropdown(false);
}

// Delete all in group (from GroupInfoBar.svelte)
export function deleteAllInGroup($selectedGroup, $leftTableStore, $middleTableStore, $mainTableStore, renamingGroupBar, selectedGroup, setShowDropdown) {
  const group = $selectedGroup;
  if (!group || renamingGroupBar) return;
  const allStores = [
    { store: leftTableStore, data: $leftTableStore },
    { store: middleTableStore, data: $middleTableStore },
    { store: mainTableStore, data: $mainTableStore }
  ];
  allStores.forEach(({ store, data }) => {
    Object.entries(data).forEach(([key, cell]) => {
      if (cell.groupName === group) {
        store.updateCell(key, {
          text: '',
          linked: false,
          groupName: '',
          groupColor: '',
          outFridge: false,
          state: CELL_STATES.EMPTY
        });
      }
    });
  });
  selectedGroup.set(null);
  setShowDropdown(false);
} 