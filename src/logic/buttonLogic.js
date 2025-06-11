import { selectedCells, leftTableStore, middleTableStore, mainTableStore } from '../stores/tableStore';
import { getStoreByCellKey } from '../utils/cellUtils';
import { CELL_STATES } from '../constants';

export function canLinkCells(selected) {
  // If no cells are selected, allow entering link mode
  if (selected.size === 0) return true;
  
  // If a cell is selected, check if it has content
  const cellKey = Array.from(selected)[0];
  const store = getStoreByCellKey(cellKey);
  const cellData = store.get(cellKey) || {};
  
  // Allow linking if the cell has content
  if (cellData.text && cellData.text.trim()) {
    // If we're already in link mode, check if we can add more cells
    if (selected.size >= 2) {
      let existingGroup = null;
      let hasUnlinkedCell = false;
      
      for (const key of selected) {
        const [fridge] = key.split('-');
        const store = fridge === 'left' ? leftTableStore : 
                     fridge === 'middle' ? middleTableStore : 
                     mainTableStore;
        
        const cellData = store.get(key) || {};
        if (cellData.linked) {
          if (existingGroup && existingGroup !== cellData.groupName) {
            return false;
          } else {
            existingGroup = cellData.groupName;
          }
        } else {
          hasUnlinkedCell = true;
        }
      }
      return hasUnlinkedCell;
    }
    return true;
  }
  
  return false;
} 