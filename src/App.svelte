<script>
  import Cell from './Cell.svelte';
  import Table from './Table.svelte';
  import { tableConfigs, renamingCell, selectedCells, leftTableStore, middleTableStore, mainTableStore } from './stores/tableStore';
  import { CELL_STATES } from './constants';
  
  // Create arrays for rows and columns for all tables
  const mainTableRows = Array.from({ length: 21 }, (_, i) => i);
  const mainTableColumns = Array.from({ length: 10 }, (_, i) => i);
  const mainTableColumnRowCounts = [10, 7, 7, 7, 7, 7, 10, 21, 21, 21];
  const leftTableRows = Array.from({ length: 21 }, (_, i) => i);
  const leftTableColumns = Array.from({ length: 5 }, (_, i) => i);
  const middleTableRows = Array.from({ length: 7 }, (_, i) => i);
  const middleTableColumns = Array.from({ length: 2 }, (_, i) => i);

  // Table names
  const leftTableName = "Cytomat5";
  const middleTableName = "Cytomat2";
  const mainTableName = "Cytomat10 Hotel";

  // Track which cell is being renamed
  function handleStartRenaming(event) {
    const { cellKey } = event.detail;
    renamingCell.set(cellKey);
  }

  function handleStopRenaming() {
    renamingCell.set(null);
  }

  // Track the next color index to use
  let nextColorIndex = 0;
  const groupColors = ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

  // Check if selected cells can be linked
  $: canLinkCells = (() => {
    const selected = $selectedCells;
    if (selected.size < 2) return false;

    let existingGroup = null;
    let hasUnlinkedCell = false;
    
    for (const cellKey of selected) {
      const [fridge] = cellKey.split('-');
      const store = fridge === 'left' ? leftTableStore : 
                   fridge === 'middle' ? middleTableStore : 
                   mainTableStore;
      
      const cellData = store.get(cellKey) || {};
      
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
    
    // Can link if we found an unlinked cell, even if all other cells are in the same group
    return hasUnlinkedCell;
  })();

  // Handle linking selected cells
  function handleLinkCells() {
    const selected = $selectedCells;
    if (selected.size < 2 || !canLinkCells) return;

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
      groupName = `Group ${Date.now()}`;
      groupColor = groupColors[nextColorIndex];
      nextColorIndex = (nextColorIndex + 1) % groupColors.length;
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
</script>

<main class="h-screen bg-sky-50 p-0 flex flex-col overflow-hidden">
  <header class="h-[52px] bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
    <div class="h-full flex items-center justify-between px-4">
      <h1 class="text-xl font-semibold">Lab Tool</h1>
      <button
        class="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
        on:click={handleLinkCells}
        disabled={!canLinkCells}
      >
        Link Selected Cells ({$selectedCells.size})
      </button>
    </div>
  </header>

  <div class="flex-1 flex flex-col justify-end pt-[52px] overflow-hidden">
    <div class="h-[calc(100vh-52px)] overflow-x-auto w-full p-4">
      <div class="tables-row" style="display: grid; grid-template-columns: 5fr 2fr 10fr; gap: 16px; min-width: 1200px; align-items: end; height: 100%;">
        <!-- Left Table: 21 rows, 5 columns -->
        <div class="h-full flex flex-col justify-end">
          <Table
            rows={tableConfigs.left.rows}
            columns={tableConfigs.left.columns}
            renamingCell={$renamingCell}
            handleStartRenaming={handleStartRenaming}
            on:stopRenaming={handleStopRenaming}
            fridge="left"
            tableName={tableConfigs.left.name}
          />
        </div>
        <!-- Middle Table: 7 rows, 2 columns -->
        <div class="h-full flex flex-col justify-end">
          <Table
            rows={tableConfigs.middle.rows}
            columns={tableConfigs.middle.columns}
            renamingCell={$renamingCell}
            handleStartRenaming={handleStartRenaming}
            on:stopRenaming={handleStopRenaming}
            fridge="middle"
            tableName={tableConfigs.middle.name}
          />
        </div>
        <!-- Main Table: 21 rows, 10 columns -->
        <div class="h-full flex flex-col justify-end">
          <Table
            rows={tableConfigs.main.rows}
            columns={tableConfigs.main.columns}
            renamingCell={$renamingCell}
            handleStartRenaming={handleStartRenaming}
            on:stopRenaming={handleStopRenaming}
            fridge="main"
            tableName={tableConfigs.main.name}
          />
        </div>
      </div>
    </div>
  </div>
</main>

<style>
  /* Your component styles here */
  .grid-cols-17 {
    display: grid;
    grid-template-columns: repeat(17, 1fr);
  }

  :global(.table-container) {
    display: grid;
    width: 100%;
    gap: 1px;
    grid-auto-rows: min(24px);
  }

  :global(.table-container[data-columns="5"]) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  :global(.table-container[data-columns="2"]) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :global(.table-container[data-columns="10"]) {
    grid-template-columns: repeat(10, minmax(0, 1fr));
  }

  :global(.cell) {
    width: 100%;
    height: 100%;
    min-height: 32px;
    max-height: 48px;
    min-width: 0;
  }

  @media (max-width: 1300px) {
    .tables-row {
      grid-template-columns: 5fr 2fr !important;
      min-width: 750px !important;
      height: 200% !important; /* Double the vertical space */
    }
    .tables-row > div:last-child {
      grid-column: 1 / -1;
    }
  }
</style>