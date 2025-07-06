<script>
import Button from '../common/Button.svelte';
import Modal from '../common/Modal.svelte';
import addlink from '../icons/addlink.svelte';
import X from '../icons/X.svelte';
import { groupColorsHex } from '../../constants';
import { selectedCells, leftTableStore, middleTableStore, mainTableStore, isLinkMode, selectedGroup, selectedCellData, isGroupMode, groupOrderStore } from '../../stores/tableStore';
import { getStoreByCellKey } from '../../utils/cellUtils';
import { CELL_STATES } from '../../constants';
import { createEventDispatcher } from 'svelte';
import InputField from '../common/InputField.svelte';

const dispatch = createEventDispatcher();

let showLinkGroupModal = false;
let newGroupName = '';
let linkingCells = [];

$: canLink = (() => {
  if ($isLinkMode) {
    return $selectedCellData && $selectedCellData.text && $selectedCellData.text.trim();
  }
  if ($selectedGroup) return true;
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
      
      // Add all selected cells to the selected group
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
  const groupColor = groupColorsHex[$groupOrderStore.nextColorIndex];
  groupOrderStore.incrementColorIndex();
  groupOrderStore.incrementGroupNumber();
  // Log after incrementing
  setTimeout(() => {
    console.log('AFTER INCREMENT $groupOrderStore:', $groupOrderStore);
  }, 100);
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
  console.log('DEBUG groupOrderStore:', $groupOrderStore);
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
    {$isLinkMode ? 'Group' : 'Create Group'}
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
            iconColor={groupColorsHex[$groupOrderStore.nextColorIndex]}
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