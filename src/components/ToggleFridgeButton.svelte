<script>
  import { cn } from '../lib/utils';
  import { selectedCells, leftTableStore, middleTableStore, mainTableStore } from '../stores/tableStore';
  import { getStoreByCellKey } from '../utils/cellUtils';
  import { CELL_STATES } from '../constants';

  // Check if any selected cells can be toggled (non-empty cells)
  $: canToggleFridge = (() => {
    const selected = $selectedCells;
    if (selected.size === 0) return false;

    let hasInFridge = false;
    let hasOutFridge = false;
    let hasNonEmptyCell = false;

    for (const cellKey of selected) {
      const store = getStoreByCellKey(cellKey);
      const cellData = store.get(cellKey) || {};
      
      // Skip empty cells
      if (!cellData.text || !cellData.text.trim()) continue;
      
      hasNonEmptyCell = true;
      if (cellData.outFridge) {
        hasOutFridge = true;
      } else {
        hasInFridge = true;
      }

      // If we find both in-fridge and out-fridge cells, we can't toggle
      if (hasInFridge && hasOutFridge) return false;
    }

    // Can toggle if we have at least one non-empty cell and they're all in the same state
    return hasNonEmptyCell && !(hasInFridge && hasOutFridge);
  })();

  // Handle toggling the fridge status for selected cells
  function handleToggleFridge() {
    const selected = $selectedCells;
    if (selected.size === 0) return;

    // Get the current state of the first selected cell to determine toggle direction
    const firstCellKey = Array.from(selected)[0];
    const firstStore = getStoreByCellKey(firstCellKey);
    const firstCellData = firstStore.get(firstCellKey) || {};
    const newOutFridgeState = !firstCellData.outFridge;

    // Update all selected cells
    selected.forEach(cellKey => {
      const store = getStoreByCellKey(cellKey);
      const cellData = store.get(cellKey) || {};
      
      // Only toggle non-empty cells
      if (cellData.text && cellData.text.trim()) {
        store.updateCell(cellKey, {
          ...cellData,
          outFridge: newOutFridgeState,
          state: CELL_STATES.REGULAR // Reset state to regular
        });
      }
    });

    // Clear selection
    selectedCells.set(new Set());
  }
</script>

<button
  class={cn(
    "px-4 py-2 text-white rounded",
    "bg-sky-600 hover:bg-sky-700",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  )}
  on:click={handleToggleFridge}
  disabled={!canToggleFridge}
>
  Toggle In/Out Fridge
</button> 