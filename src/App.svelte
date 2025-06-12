<script>
  import Cell from './components/table/Cell.svelte';
  import Table from './components/table/Table.svelte';
  import { tableConfigs, selectedCells, leftTableStore, middleTableStore, mainTableStore, getCellGroups, isLinkMode, selectedGroup } from './stores/tableStore';
  import { CELL_STATES } from './constants';
  import Header from './components/topbar/Header.svelte';
  import RowNumber from './components/table/RowNumber.svelte';
  import Button from './components/common/Button.svelte';
  
  // Track the next color index to use
  let nextColorIndex = 0;
  const groupColors = ['#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

  // Handle ESC and Enter keys for deselection
  function handleKeyDown(event) {
    // Ignore if focused in an input or textarea
    if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
    if (["Escape", "Delete", "Backspace"].includes(event.key)) {
      selectedCells.set(new Set());
      if ($isLinkMode) {
        isLinkMode.set(false);
      }
      if ($selectedGroup) {
        selectedGroup.set(null);
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }

  // Check if selected cells can be linked
  $: canLinkCells = (() => {
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

  $: cellGroups = getCellGroups($leftTableStore, $middleTableStore, $mainTableStore);
</script>

<main class="h-screen bg-sky-50 p-0 flex flex-col overflow-auto">
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="flex-1 flex flex-col" on:click={event => {
    if (!$isLinkMode && !event.target.closest('button, input, select, .cell, [role=\"button\"]')) {
      selectedCells.set(new Set());
    }
  }}>
    <Header title="Lab Tool" />
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
              fridge="left"
              tableName={tableConfigs.left.name}
            />
          </div>
          <div class="h-full flex flex-col w-full min-w-0" style="grid-column: 3 / 4; grid-row: 1;">
            <Table
              rows={tableConfigs.middle.rows}
              columns={tableConfigs.middle.columns}
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
                fridge={key}
                tableName={tableConfigs[key].name}
              />
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>
</main>