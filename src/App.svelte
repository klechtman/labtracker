<script>
  import Cell from './components/Cell.svelte';
  import Table from './components/Table.svelte';
  import { tableConfigs, renamingCell, selectedCells, leftTableStore, middleTableStore, mainTableStore } from './stores/tableStore';
  import { CELL_STATES } from './constants';
  import Header from './components/Header.svelte';
  import HeaderButton from './components/HeaderButton.svelte';
  
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

  // Create an array of table configs for rendering
  const tableOrder = ['left', 'middle', 'main'];
  const tableGridColumns = '5fr 2fr 10fr';
</script>

<main class="h-screen bg-sky-50 p-0 flex flex-col overflow-auto">
  <Header title="Lab Tool">
    <HeaderButton
      slot="header-button"
      onClick={handleLinkCells}
      disabled={!canLinkCells}
      count={$selectedCells.size}
    />
  </Header>

  <div class="flex-1 flex flex-col justify-end pt-20 p-5">
    <div class="tables-row" style={`display: grid; grid-template-columns: ${tableGridColumns}; gap: 16px; min-width: 1200px; align-items: end; height: 100%;`}>
      {#each tableOrder as key}
        <div class="h-full flex flex-col justify-end">
          <Table
            rows={tableConfigs[key].rows}
            columns={tableConfigs[key].columns}
            renamingCell={$renamingCell}
            handleStartRenaming={handleStartRenaming}
            on:stopRenaming={handleStopRenaming}
            fridge={key}
            tableName={tableConfigs[key].name}
          />
        </div>
      {/each}
    </div>
  </div>
</main>

<style>
  /* Your component styles here */
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