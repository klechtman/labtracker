<script>
    import { cn } from '../../lib/utils';
    import CellInfoBar from './CellInfoBar.svelte';
    import GroupInfoBar from './GroupInfoBar.svelte';
    import Button from '../common/Button.svelte';
    import Modal from '../common/Modal.svelte';
    import addlink from '../icons/addlink.svelte';
    import X from '../icons/X.svelte';
    import { selectedCells, leftTableStore, middleTableStore, mainTableStore, getCellGroups, isLinkMode, selectedCellData, selectedGroup, isGroupMode } from '../../stores/tableStore';
    import { getStoreByCellKey } from '../../utils/cellUtils';
    import { CELL_STATES } from '../../constants';
    import { canLinkCells } from '../../logic/buttonLogic';
    import { groupColors, groupColorsHex } from '../../constants';
    import { unlinkCell, eraseCell } from '../../logic/groupLogic';
    import LinkModeManager from './LinkModeManager.svelte';
    import { localStorage } from '../../lib/localStorage';
  
    // Toggle Fridge handler
    function handleToggleFridge() {
      const selected = $selectedCells;
      if (selected.size === 0) return;
      const cellKey = Array.from(selected)[0];
      const store = getStoreByCellKey(cellKey);
      const cellData = store.get(cellKey) || {};
      const newOutFridgeState = !cellData.outFridge;
      
      if (cellData.text && cellData.text.trim()) {
        store.updateCell(cellKey, {
          ...cellData,
          outFridge: newOutFridgeState,
          state: CELL_STATES.REGULAR
        });
        // Clear selection
        selectedCells.set(new Set());
      }
    }
  
    // Helper to get plate names from selected cells
    function getSelectedPlateNames() {
      const names = [];
      $selectedCells.forEach(cellKey => {
        const store = getStoreByCellKey(cellKey);
        const cellData = store.get(cellKey) || {};
        names.push(cellData.text || cellKey);
      });
      return names;
    }
  
    // Link Cells handler
    let nextColorIndex = 0;
    let nextGroupNumber = 1;
    $: canLink = (() => {
      // If we're in link mode, use the existing logic
      if ($isLinkMode) {
        return $selectedCellData && $selectedCellData.text && $selectedCellData.text.trim();
      }
      
      // If we're in group mode, we can always enter link mode
      if ($selectedGroup) return true;
      
      // Count cells with content across all tables
      let cellsWithContent = 0;
      const allStores = [
        { data: $leftTableStore },
        { data: $middleTableStore },
        { data: $mainTableStore }
      ];
      
      allStores.forEach(({ data }) => {
        Object.values(data).forEach(cell => {
          if (cell.text && cell.text.trim()) {
            cellsWithContent++;
          }
        });
      });
      
      // If there are fewer than 2 cells with content, disable the button
      if (cellsWithContent < 2) return false;
      
      // If a cell is selected, check if it has content
      if ($selectedCellData) {
        return $selectedCellData.text && $selectedCellData.text.trim();
      }
      
      // If no cell is selected but there are enough cells with content, enable the button
      return true;
    })();

    // Check if selected cells can be linked
    $: canLinkSelectedCells = (() => {
      const selected = $selectedCells;
      if (selected.size < 2) return false;

      let existingGroup = null;
      let hasUnlinkedCell = false;
      let hasEmptyCell = false;
      
      for (const cellKey of selected) {
        const [fridge] = cellKey.split('-');
        const store = fridge === 'left' ? leftTableStore : 
                     fridge === 'middle' ? middleTableStore : 
                     mainTableStore;
        
        const cellData = store.get(cellKey) || {};
        
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
    })();

    function handleLinkCells(event) {
      // If this was triggered by a keyboard event, check if it was ESC
      if (event?.type === 'keydown' && event.key === 'Escape') {
        selectedCells.set(new Set());
        isLinkMode.set(false);
        return;
      }

      // If we're in group mode, select all cells in the group and enter link mode
      if ($selectedGroup) {
        const groupCells = new Set();
        const allStores = [
          { store: leftTableStore, data: $leftTableStore },
          { store: middleTableStore, data: $middleTableStore },
          { store: mainTableStore, data: $mainTableStore }
        ];
        
        allStores.forEach(({ data }) => {
          Object.entries(data).forEach(([key, cell]) => {
            if (cell.groupName === $selectedGroup) {
              groupCells.add(key);
            }
          });
        });
        
        selectedCells.set(groupCells);
        // Don't clear selectedGroup here - keep it selected in the group bar
        isLinkMode.set(true);
        isGroupMode.set(false);
        return;
      }

      if ($isLinkMode && $selectedCells.size >= 2) {
        if (!canLinkSelectedCells) {
          selectedCells.set(new Set());
          isLinkMode.set(false);
          return;
        }

        let existingGroup = null;
        let existingGroupColor = null;
        $selectedCells.forEach(cellKey => {
          const [fridge] = cellKey.split('-');
          const store = fridge === 'left' ? leftTableStore : 
                       fridge === 'middle' ? middleTableStore : 
                       mainTableStore;
          const cellData = store.get(cellKey) || {};
          if (cellData.linked) {
            existingGroup = cellData.groupName;
            existingGroupColor = cellData.groupColor;
          }
        });

        if (!existingGroup) {
          // New group: show modal
          return;
        }
        // Existing group: link as before
        let groupName = existingGroup;
        let groupColor = existingGroupColor;
        $selectedCells.forEach(cellKey => {
          const [fridge] = cellKey.split('-');
          const store = fridge === 'left' ? leftTableStore : 
                       fridge === 'middle' ? middleTableStore : 
                       mainTableStore;
          const currentCell = store.get(cellKey) || {};
          store.updateCell(cellKey, {
            ...currentCell,
            linked: true,
            groupName,
            groupColor,
            state: CELL_STATES.REGULAR
          });
        });
        selectedCells.set(new Set());
        isLinkMode.set(false);
        // Don't clear selected group when linking is completed - keep it selected
      } else {
        // Toggle link mode
        isLinkMode.update(mode => !mode);
        // Clear selection when entering link mode
        if (!$isLinkMode) {
          selectedCells.set(new Set());
          isGroupMode.set(false);
        }
      }
    }
  
    // Add keyboard event handler for the main window
    function handleKeyDown(event) {
      // Ignore if focused in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
      
      // Check if any modal is open
      const isModalOpen = document.querySelector('.modal-overlay') !== null;
      if (isModalOpen) return;

      if (event.key === 'Escape' && $isLinkMode) {
        handleLinkCells(event);
      } else if (event.key === 'Enter' && $isLinkMode && canLink && !$selectedGroup && $selectedCells.size >= 2) {
        handleLinkCells(event);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
    }
  
    // New reactive variable
    $: cellGroups = getCellGroups(leftTableStore.value, middleTableStore.value, mainTableStore.value);
  
    $: canFridge = $selectedCellData && $selectedCellData.text && $selectedCellData.text.trim();
    $: canUnlink = $selectedCellData && $selectedCellData.linked;
  
    // Unlink handler
    function handleUnlink() {
      const selected = $selectedCells;
      if (selected.size === 0) return;
      const cellKey = Array.from(selected)[0];
      const store = getStoreByCellKey(cellKey);
      const cellData = store.get(cellKey) || {};
      
      if (cellData.linked) {
        // Get all cells in the same group by iterating over the store values directly
        const groupName = cellData.groupName;
        const groupCells = [];
        const allStores = [
          { store: leftTableStore, data: $leftTableStore },
          { store: middleTableStore, data: $middleTableStore },
          { store: mainTableStore, data: $mainTableStore }
        ];
        allStores.forEach(({ store, data }) => {
          Object.entries(data).forEach(([key, cell]) => {
            if (cell.linked && cell.groupName === groupName) {
              groupCells.push({ key, store });
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
  
    // Erase handler
    function handleErase() {
      const selected = $selectedCells;
      if (selected.size === 0) return;
      const cellKey = Array.from(selected)[0];
      const store = getStoreByCellKey(cellKey);
      const cellData = store.get(cellKey) || {};
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

    // Function to clear localStorage and reload the app
    function handleClearData() {
      localStorage.clear();
      window.location.reload();
    }
  </script>
  
  <header class={cn(
    "h-14 bg-white shadow-sm fixed top-0 left-0 right-0 z-10"
  )}>
    <div class={cn(
      "h-full flex items-center justify-between px-12 gap-4"
    )}>
      <div class="flex items-center gap-6 min-w-fit">
        <CellInfoBar />
      </div>
      <div class="flex items-center justify-center flex-1 min-w-fit">
        <GroupInfoBar />
      </div>
      <div class="flex items-center gap-4 min-w-fit">
        <LinkModeManager />
        <Button on:click={handleClearData} color="red" size="sm">Clear Data</Button>
      </div>
    </div>
  </header> 