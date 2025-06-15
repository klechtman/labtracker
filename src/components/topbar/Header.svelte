<script>
    import { cn } from '../../lib/utils';
    import CellInfoBar from './CellInfoBar.svelte';
    import GroupInfoBar from './GroupInfoBar.svelte';
    import Button from '../common/Button.svelte';
    import Modal from '../common/Modal.svelte';
    import addlink from '../icons/addlink.svelte';
    import X from '../icons/X.svelte';
    import { selectedCells, leftTableStore, middleTableStore, mainTableStore, getCellGroups, isLinkMode, selectedCellData, selectedGroup } from '../../stores/tableStore';
    import { getStoreByCellKey } from '../../utils/cellUtils';
    import { CELL_STATES } from '../../constants';
    import { canLinkCells } from '../../logic/buttonLogic';
  
    let showLinkGroupModal = false;
    let newGroupName = '';
    let linkingCells = [];
  
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
    const groupColors = ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];
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
        selectedGroup.set(null);
        isLinkMode.set(true);
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
          linkingCells = Array.from($selectedCells);
          newGroupName = '';
          showLinkGroupModal = true;
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
      } else {
        // Toggle link mode
        isLinkMode.update(mode => !mode);
        // Clear selection when entering link mode
        if (!$isLinkMode) {
          selectedCells.set(new Set());
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
  
    function handleModalCancel() {
      showLinkGroupModal = false;
      selectedCells.set(new Set()); // Deselect
      isLinkMode.set(false); // Exit link mode when canceling from modal
    }
  
    function handleModalAccept() {
      // Actually link the cells as a new group
      const groupName = newGroupName.trim();
      const groupColor = groupColors[nextColorIndex];
      nextColorIndex = (nextColorIndex + 1) % groupColors.length;
      nextGroupNumber++;
      linkingCells.forEach(cellKey => {
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
      isLinkMode.set(false); // Exit link mode
      showLinkGroupModal = false;
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
        {#if $isLinkMode}
          <Button 
            icon={X} 
            color="sky" 
            on:click={() => {
              selectedCells.set(new Set());
              isLinkMode.set(false);
            }}
          >
            Cancel
          </Button>
        {/if}
        <Button 
          icon={addlink} 
          color={!canLink || ($isLinkMode && !canLinkSelectedCells) ? "emerald-600" : "emerald"} 
          on:click={handleLinkCells}
          disabled={!canLink || ($isLinkMode && !canLinkSelectedCells)}
        >
          {$isLinkMode ? 'Link Selected Cells' : 'Start Linking Cells'}
        </Button>
      </div>
    </div>
  </header>
  
  {#if showLinkGroupModal}
    <Modal
      icon={addlink}
      color="emerald"
      cancelText="Cancel"
      cancelIcon={X}
      acceptText="Link plates"
      acceptIcon={addlink}
      disabled={!newGroupName.trim()}
      on:cancel={handleModalCancel}
      on:accept={handleModalAccept}
      on:keydown={(e) => {
        if (e.key === 'Escape') {
          handleModalCancel();
        } else if (e.key === 'Enter' && newGroupName.trim()) {
          handleModalAccept();
        }
      }}
    >
      <div class="link-modal-content flex flex-col gap-4 w-full">
        <div class="w-full flex flex-col items-start">
          <label for="group-name-input" class="font-bold text-lg mb-1 w-full">Group Name</label>
          <div class="relative w-full max-w-xs">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-slate-200 border border-slate-300" style="background-color: {groupColors[nextColorIndex]}"></span>
            <input
              id="group-name-input"
              class="border rounded pl-10 pr-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white placeholder:text-slate-400"
              type="text"
              placeholder="Study, project, etc."
              bind:value={newGroupName}
              required
              on:keydown={(e) => {
                if (e.key === 'Enter' && newGroupName.trim()) {
                  handleModalAccept();
                }
              }}
            />
          </div>
        </div>
        <div class="w-full">
          <span class="font-bold">{linkingCells.length} Selected Plates:</span>
          <div class="mt-1 text-slate-700">
            {getSelectedPlateNames().join(', ')}
          </div>
        </div>
      </div>
    </Modal>
    <div
      class="fixed inset-0 bg-black/50 z-40 modal-overlay"
      role="button"
      tabindex="0"
      aria-label="Close modal"
      on:click|stopPropagation={handleModalCancel}
      on:keydown={(e) => (e.key === 'Escape' || e.key === 'Enter') && handleModalCancel()}
    ></div>
    <style>
      /* Only affect this modal instance */
      .link-modal-content {
        text-align: left !important;
        align-items: flex-start !important;
      }
      .link-modal-content input {
        text-align: left;
      }
    </style>
  {/if} 