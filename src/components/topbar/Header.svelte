<script>
    import { cn } from '../../lib/utils';
    import CellInfoBar from './CellInfoBar.svelte';
    import GroupInfoBar from './GroupInfoBar.svelte';
    import Button from '../common/Button.svelte';
    import Modal from '../common/Modal.svelte';
    import addlink from '../icons/addlink.svelte';
    import unlink from '../icons/unlink.svelte';
    import { selectedCells, leftTableStore, middleTableStore, mainTableStore, getCellGroups, isLinkMode, selectedCellData, selectedGroup } from '../../stores/tableStore';
    import { getStoreByCellKey } from '../../utils/cellUtils';
    import { CELL_STATES } from '../../constants';
    import { canLinkCells } from '../../logic/buttonLogic';
  
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
  
    // Link Cells handler
    const groupColors = ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];
    let nextColorIndex = 0;
    let nextGroupNumber = 1;
    function handleLinkCells() {
      // If we're in link mode and have selected cells, perform the linking
      if ($isLinkMode && $selectedCells.size >= 2) {
        let existingGroup = null;
        let existingGroupColor = null;
        let affected = new Set();
        let abort = false;
        $selectedCells.forEach(cellKey => {
          const [fridge] = cellKey.split('-');
          const store = fridge === 'left' ? leftTableStore : 
                       fridge === 'middle' ? middleTableStore : 
                       mainTableStore;
          const cellData = store.get(cellKey) || {};
          if (cellData.linked) {
            if (existingGroup && existingGroup !== cellData.groupName) {
              alert('Cannot link cells from different groups!');
              abort = true;
              return;
            }
            existingGroup = cellData.groupName;
            existingGroupColor = cellData.groupColor;
          }
        });
        if (abort) {
          selectedCells.set(new Set());
          isLinkMode.set(false);
          return;
        }
        let groupName, groupColor;
        if (existingGroup) {
          groupName = existingGroup;
          groupColor = existingGroupColor;
        } else {
          groupName = `Group${nextGroupNumber}`;
          nextGroupNumber++;
          groupColor = groupColors[nextColorIndex];
          nextColorIndex = (nextColorIndex + 1) % groupColors.length;
        }
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
          affected.add(cellKey);
        });
        // Clear selection and exit link mode
        selectedCells.set(new Set());
        isLinkMode.set(false);
      } else {
        // Toggle link mode
        isLinkMode.update(mode => !mode);
        // Clear selection when entering link mode
        if (!$isLinkMode) {
          selectedCells.set(new Set());
        }
      }
    }
  
    // New reactive variable
    $: cellGroups = getCellGroups(leftTableStore.value, middleTableStore.value, mainTableStore.value);
  
    $: canFridge = $selectedCellData && $selectedCellData.text && $selectedCellData.text.trim();
    $: canLink = (() => {
      // If we're in link mode, use the existing logic
      if ($isLinkMode) {
        return $selectedCellData && $selectedCellData.text && $selectedCellData.text.trim();
      }
      
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
  
    let showTestModal = false;
    function handleTestCancel() { showTestModal = false; }
    function handleTestAccept() { showTestModal = false; }
  </script>
  
  <header class={cn(
    "h-14 bg-white shadow-sm fixed top-0 left-0 right-0 z-10"
  )}>
    <div class={cn(
      "h-full flex items-center justify-between px-12"
    )}>
      <div class="flex items-center gap-6">
        <CellInfoBar />
      </div>
      <div class="flex items-center justify-center flex-1">
        <GroupInfoBar />
      </div>
      <div class="flex items-center gap-4">
        <Button 
          icon={addlink} 
          color={$isLinkMode ? "green-600" : "green"} 
          on:click={handleLinkCells}
          disabled={!canLink || $selectedGroup}
        >
          {$isLinkMode ? 'Link Selected Cells' : 'Start Linking Cells'}
        </Button>
        <Button color="orange" on:click={() => showTestModal = true}>
          Test Modal
        </Button>
      </div>
    </div>
  </header>
  
  {#if showTestModal}
    <Modal
      icon={unlink}
      color="orange"
      cancelText="Cancel"
      acceptText="Unlink"
      on:cancel={handleTestCancel}
      on:accept={handleTestAccept}
    >
      Are you sure you want to unlink this plate/group?
    </Modal>
  {/if} 