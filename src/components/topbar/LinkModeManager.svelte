<script>
import Button from '../common/Button.svelte';
import Modal from '../common/Modal.svelte';
import addlink from '../icons/addlink.svelte';
import X from '../icons/X.svelte';
import { groupColorsHex } from '../../constants';
import { selectedCells, leftTableStore, middleTableStore, mainTableStore, isLinkMode, selectedGroup, selectedCellData } from '../../stores/tableStore';
import { getStoreByCellKey } from '../../utils/cellUtils';
import { CELL_STATES } from '../../constants';
import { createEventDispatcher } from 'svelte';

const dispatch = createEventDispatcher();

let showLinkGroupModal = false;
let newGroupName = '';
let linkingCells = [];
let nextColorIndex = 0;
let nextGroupNumber = 1;

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
  } else {
    isLinkMode.update(mode => !mode);
    if (!$isLinkMode) {
      selectedCells.set(new Set());
    }
  }
}

function handleModalCancel() {
  showLinkGroupModal = false;
  selectedCells.set(new Set());
  isLinkMode.set(false);
}

function handleModalAccept() {
  const groupName = newGroupName.trim();
  const groupColor = groupColorsHex[nextColorIndex];
  nextColorIndex = (nextColorIndex + 1) % groupColorsHex.length;
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
  isLinkMode.set(false);
  showLinkGroupModal = false;
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
</script>

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
          <div class="relative w-full max-w-xs">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-slate-200 border border-slate-300" style="background-color: {groupColorsHex[nextColorIndex]}"></span>
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