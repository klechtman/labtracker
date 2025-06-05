<script>
  import Cell from './components/Cell.svelte';
  import Table from './components/Table.svelte';
  import { tableConfigs, renamingCell, selectedCells, leftTableStore, middleTableStore, mainTableStore } from './stores/tableStore';
  import { CELL_STATES } from './constants';
  import Header from './components/Header.svelte';
  import HeaderButton from './components/HeaderButton.svelte';
  import RowNumber from './components/RowNumber.svelte';
  
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

  let isSmallScreen = false;
  if (typeof window !== 'undefined') {
    const checkScreen = () => {
      isSmallScreen = window.innerWidth <= 1300;
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
  }

  // For row numbers
  const maxRows = 21; // global, as per your requirement
  $: globalRowNumbers = Array.from({ length: maxRows }, (_, i) => maxRows - i);
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

  <div class="flex-1 flex flex-col justify-end pt-28 pb-9 px-12">
    <div class="grid tables-row w-full min-w-0"
      style={`
        display: grid;
        gap: 48px;
        min-width: ${isSmallScreen ? '0' : '1200px'};
        align-items: end;
        height: ${isSmallScreen ? 'auto' : '100%'};
        grid-template-columns: ${isSmallScreen ? '32px 5fr 2fr' : '32px ' + tableGridColumns};
        grid-template-rows: ${isSmallScreen ? 'auto auto' : 'auto'};
      `}
    >
      {#if isSmallScreen}
        <!-- Row numbers for the top row (left and middle tables) -->
        <Table rowNumbersOnly={true} rows={maxRows} maxRows={maxRows} tableName="" />
        <div class="h-full flex flex-col w-full min-w-0" style="grid-column: 2 / 3; grid-row: 1;">
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
        <div class="h-full flex flex-col w-full min-w-0" style="grid-column: 3 / 4; grid-row: 1;">
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
        <!-- Row numbers for the bottom row (main table) -->
        <Table rowNumbersOnly={true} rows={maxRows} maxRows={maxRows} tableName="" />
        <div class="h-full flex flex-col w-full min-w-0" style="grid-column: 2 / 4; grid-row: 2;">
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
      {:else}
        <!-- Row numbers for the desktop layout -->
        <Table rowNumbersOnly={true} rows={maxRows} maxRows={maxRows} tableName="" />
        {#each tableOrder as key, i}
          <div class="h-full flex flex-col w-full min-w-0" style={`grid-column: ${i+2}; grid-row: 1;`}>
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
      {/if}
    </div>
  </div>
</main>