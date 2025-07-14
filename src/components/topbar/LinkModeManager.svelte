<script>
import Button from '../common/Button.svelte';
import Modal from '../common/Modal.svelte';
import addlink from '../icons/addlink.svelte';
import X from '../icons/X.svelte';
import { groupColorsHex } from '../../constants';
import { selectedCells, leftTableStore, middleTableStore, mainTableStore, isLinkMode, selectedGroup, selectedCellData, isGroupMode, groupOrderStore } from '../../stores/tableStore';
import { getStoreByCellKey, triggerAnimation } from '../../utils/cellUtils';
import { CELL_STATES } from '../../constants';
import InputField from '../common/InputField.svelte';
import { toastStore } from '../../stores/toastStore';

let showLinkGroupModal = false;
let newGroupName = '';
let linkingCells = [];
let previewGroupColor = '';

$: canLink = (() => {
  if ($isLinkMode) {
    return $selectedCellData && $selectedCellData.text && $selectedCellData.text.trim();
  }
  if ($selectedGroup) return true;
  
  // If a cell is selected and it's linked, disable the button
  if ($selectedCellData && $selectedCellData.linked) {
    return false;
  }
  
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
  if (cellsWithContent < 2) return false;
  if ($selectedCellData) {
    return $selectedCellData.text && $selectedCellData.text.trim();
  }
  return true;
})();

$: canLinkSelectedCells = (() => {
  const selected = $selectedCells;
  if (selected.size < 2) return false;
  
  // If we have a selected group, we can always link (adding cells to the group)
  if ($selectedGroup) return true;
  
  let existingGroup = null;
  let hasUnlinkedCell = false;
  let hasEmptyCell = false;
  for (const cellKey of selected) {
    const [fridge] = cellKey.split('-');
    const store = fridge === 'left' ? leftTableStore : 
                 fridge === 'middle' ? middleTableStore : 
                 mainTableStore;
    const cellData = store.get(cellKey) || {};
    if (!cellData.text || !cellData.text.trim()) {
      hasEmptyCell = true;
      break;
    }
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
  return hasUnlinkedCell && !hasEmptyCell;
})();

function handleLinkCells(event) {
  if (event?.type === 'keydown' && event.key === 'Escape') {
    selectedCells.set(new Set());
    isLinkMode.set(false);
    return;
  }
  if ($selectedGroup && !$isLinkMode) {
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
    
    // If we have a selected group, add all selected cells to that group
    if ($selectedGroup) {
      const groupName = $selectedGroup; // Capture group name before clearing
      
      // Get the group color from the selected group
      let groupColor = null;
      const allStores = [
        { data: $leftTableStore },
        { data: $middleTableStore },
        { data: $mainTableStore }
      ];
      allStores.forEach(({ data }) => {
        Object.values(data).forEach(cell => {
          if (cell.groupName === $selectedGroup) {
            groupColor = cell.groupColor;
          }
        });
      });
      
      // Capture original states for undo and count cells that will be added
      const originalStates = [];
      let cellsAdded = 0;
      $selectedCells.forEach(cellKey => {
        const [fridge] = cellKey.split('-');
        const store = fridge === 'left' ? leftTableStore : 
                     fridge === 'middle' ? middleTableStore : 
                     mainTableStore;
        const currentCell = store.get(cellKey) || {};
        
        // Only count cells that aren't already in this group
        if (currentCell.groupName !== $selectedGroup) {
          cellsAdded++;
        }
        
        originalStates.push({
          key: cellKey,
          store,
          linked: currentCell.linked,
          groupName: currentCell.groupName,
          groupColor: currentCell.groupColor,
          text: currentCell.text,
          outFridge: currentCell.outFridge,
          state: currentCell.state
        });
      });
      
      // Add all selected cells to the selected group
      const cellKeysToAnimate = Array.from($selectedCells);
      $selectedCells.forEach(cellKey => {
        const [fridge] = cellKey.split('-');
        const store = fridge === 'left' ? leftTableStore : 
                     fridge === 'middle' ? middleTableStore : 
                     mainTableStore;
        const currentCell = store.get(cellKey) || {};
        store.updateCell(cellKey, {
          ...currentCell,
          linked: true,
          groupName: $selectedGroup,
          groupColor,
          state: CELL_STATES.REGULAR
        });
      });
      selectedCells.set(new Set());
      isLinkMode.set(false);
      isGroupMode.set(false);
      selectedGroup.set(null);
      
      // Trigger animation for affected cells
      triggerAnimation(cellKeysToAnimate);
      
      // Show toast with undo functionality
      toastStore.add({
        icon: addlink,
        color: 'emerald',
        text: `Added ${cellsAdded} plates to group "${groupName}"`,
        duration: 4000,
        undoAction: undoAddToGroup,
        undoData: { originalStates, groupName }
      });
      return;
    }
    
    // Handle regular link mode (no group selected)
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
      linkingCells = Array.from($selectedCells);
      newGroupName = '';
      showLinkGroupModal = true;
      return;
    }
    let groupName = existingGroup;
    let groupColor = existingGroupColor;
    
    // Capture original states for undo
    const originalStates = [];
    const cellKeysToAnimate = Array.from($selectedCells);
    $selectedCells.forEach(cellKey => {
      const [fridge] = cellKey.split('-');
      const store = fridge === 'left' ? leftTableStore : 
                   fridge === 'middle' ? middleTableStore : 
                   mainTableStore;
      const currentCell = store.get(cellKey) || {};
      originalStates.push({
        key: cellKey,
        store,
        linked: currentCell.linked,
        groupName: currentCell.groupName,
        groupColor: currentCell.groupColor,
        text: currentCell.text,
        outFridge: currentCell.outFridge,
        state: currentCell.state
      });
    });
    
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
    isGroupMode.set(false);
    selectedGroup.set(null);
    // Don't clear selected group when linking is completed - keep it selected
    
    // Trigger animation for affected cells
    triggerAnimation(cellKeysToAnimate);
    
    // Show toast with undo functionality
    toastStore.add({
      icon: addlink,
      color: 'emerald',
      text: `Added ${$selectedCells.size} plates to group "${groupName}"`,
      duration: 4000,
      undoAction: undoAddToGroup,
      undoData: { originalStates, groupName }
    });
  } else {
    isLinkMode.update(mode => !mode);
    if (!$isLinkMode) {
      selectedCells.set(new Set());
      isGroupMode.set(false);
    }
  }
}

function handleModalCancel() {
  showLinkGroupModal = false;
  selectedCells.set(new Set());
  isLinkMode.set(false);
  isGroupMode.set(false);
  selectedGroup.set(null);
  // Don't clear selected group when cancelling modal - keep it selected
}

function handleModalAccept() {
  const groupName = newGroupName.trim();
  // Check for duplicate group name
  const allStores = [$leftTableStore, $middleTableStore, $mainTableStore];
  const groupExists = allStores.some(store =>
    Object.values(store).some(cell => cell.groupName === groupName)
  );
  if (groupExists) {
    alert('A group with this name already exists. Please choose a different name.');
    return;
  }
  
  // Capture original states for undo
  const originalStates = [];
  linkingCells.forEach(cellKey => {
    const [fridge] = cellKey.split('-');
    const store = fridge === 'left' ? leftTableStore : 
                 fridge === 'middle' ? middleTableStore : 
                 mainTableStore;
    const currentCell = store.get(cellKey) || {};
    originalStates.push({
      key: cellKey,
      store,
      linked: currentCell.linked,
      groupName: currentCell.groupName,
      groupColor: currentCell.groupColor,
      text: currentCell.text,
      outFridge: currentCell.outFridge,
      state: currentCell.state
    });
  });
  
  // Get color from current index, then increment for next time
  const currentIndex = $groupOrderStore.nextColorIndex;
  const groupColor = groupColorsHex[currentIndex % groupColorsHex.length];
  groupOrderStore.incrementColorIndex();
  groupOrderStore.incrementGroupNumber();
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
  isLinkMode.set(false);
  isGroupMode.set(false);
  selectedGroup.set(null);
  showLinkGroupModal = false;
  // Don't clear selected group when linking is completed via modal - keep it selected
  
  // Trigger animation for affected cells
  triggerAnimation(linkingCells);
  
  // Show toast with undo functionality
  toastStore.add({
    icon: addlink,
    color: 'emerald',
    text: `Created group "${groupName}" with ${linkingCells.length} plates`,
    duration: 4000,
    undoAction: undoCreateGroup,
    undoData: { originalStates, groupName, groupColor }
  });
}

function undoCreateGroup(undoData) {
  const { originalStates, groupName, groupColor } = undoData;
  
  // Restore original states
  originalStates.forEach(({ key, store, linked, groupName: originalGroupName, groupColor: originalGroupColor, text, outFridge, state }) => {
    const currentCell = store.get(key) || {};
    store.updateCell(key, {
      ...currentCell,
      linked,
      groupName: originalGroupName,
      groupColor: originalGroupColor,
      text,
      outFridge,
      state
    });
  });
  
  // Show confirmation toast
  toastStore.add({
    icon: addlink,
    color: 'emerald',
    text: `Undid creation of group "${groupName}"`,
    duration: 2000
  });
}

function undoAddToGroup(undoData) {
  const { originalStates, groupName } = undoData;
  
  // Restore original states
  originalStates.forEach(({ key, store, linked, groupName: originalGroupName, groupColor: originalGroupColor, text, outFridge, state }) => {
    const currentCell = store.get(key) || {};
    store.updateCell(key, {
      ...currentCell,
      linked,
      groupName: originalGroupName,
      groupColor: originalGroupColor,
      text,
      outFridge,
      state
    });
  });
  
  // Show confirmation toast
  toastStore.add({
    icon: addlink,
    color: 'emerald',
    text: `Removed plates from group "${groupName}"`,
    duration: 2000
  });
}

function handleKeyDown(event) {
  if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
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

function getSelectedPlateNames() {
  const names = [];
  $selectedCells.forEach(cellKey => {
    const store = getStoreByCellKey(cellKey);
    const cellData = store.get(cellKey) || {};
    names.push(cellData.text || cellKey);
  });
  return names;
}

$: if (showLinkGroupModal) {
  previewGroupColor = groupColorsHex[$groupOrderStore.nextColorIndex % groupColorsHex.length];
}
</script>

<div class="flex items-center gap-2">
  {#if $isLinkMode}
    <Button 
      icon={X} 
      color="sky" 
      on:click={() => {
        selectedCells.set(new Set());
        isLinkMode.set(false);
        isGroupMode.set(false);
        // Don't clear selected group when cancelling - keep it selected
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
    {$isLinkMode ? 'Group' : ($isGroupMode ? 'Add to Group' : 'Create Group')}
  </Button>

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
          <label for="group-name-input" class="font-title mb-1 w-full">Group Name</label>
          <InputField
            type="input"
            placeholder="Study, project, etc."
            bind:value={newGroupName}
            iconColor={previewGroupColor}
            on:keydown={(e) => {
              if (e.key === 'Enter' && newGroupName.trim()) {
                handleModalAccept();
              }
            }}
            extraClasses="w-full max-w-xs"
            renameMode={true}
          />
        </div>
        <div class="w-full">
          <span class="font-title">{linkingCells.length} Selected Plates:</span>
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
</div> 