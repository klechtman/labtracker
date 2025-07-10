<script>
  import Cell from './components/table/Cell.svelte';
  import Table from './components/table/Table.svelte';
  import { selectedCells, leftTableStore, middleTableStore, mainTableStore, getCellGroups, isLinkMode, selectedGroup, groupOrderStore } from './stores/tableStore';
  import { isMobileMenuOpen, isSmallScreen } from './stores/mobileMenuStore';
  import { CELL_STATES } from './constants';
  import Header from './components/topbar/Header.svelte';
  import FloatingDataBar from './components/topbar/FloatingDataBar.svelte';
  import RowNumber from './components/table/RowNumber.svelte';
  import Button from './components/common/Button.svelte';
  import { groupColors, groupColorsHex } from './constants';
  import { tableConfigs } from './constants';
  import { canLinkCells } from './logic/groupLogic';

  // Handle ESC and Enter keys for deselection
  function handleKeyDown(event) {
    // Ignore if focused in an input or textarea
    if (['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
    
    // Check if any modal is open by looking for the modal overlay
    const isModalOpen = document.querySelector('.modal-overlay') !== null;
    if (isModalOpen) return; // Don't handle any keys if modal is open
    
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

  // Create an array of table configs for rendering
  const tableOrder = ['left', 'middle', 'main'];
  const tableGridColumns = '5fr 2fr 10fr';

  // Calculate minimum width for the entire grid
  const totalColumns = tableConfigs.left.columns + tableConfigs.middle.columns + tableConfigs.main.columns;
  const minGridWidth = totalColumns * 60 + 200; // 60px per column + extra space for gaps, row numbers, etc.



  // For row numbers
  const maxRows = 21; // global, as per your requirement
  $: globalRowNumbers = Array.from({ length: maxRows }, (_, i) => maxRows - i);

  $: cellGroups = getCellGroups($leftTableStore, $middleTableStore, $mainTableStore);
</script>


  <main class="bg-sky-50 p-0 flex flex-col min-h-screen" style="min-width: 600px;">
    <div class="sticky top-0 z-10 bg-sky-50 w-full" style={`min-width: ${$isSmallScreen ? Math.max(400, tableConfigs.left.columns * 60 + tableConfigs.middle.columns * 60 + 100) + 'px' : minGridWidth + 'px'};`}>
      <Header title="Lab Tool" />
    </div>
    <FloatingDataBar />
    <div class="pt-16 pb-7 px-9 flex flex-col" style="flex: 1 1 0%">  <!-- Make this a flex column container -->
      <div
        class="grid tables-row w-full min-w-0 {$isSmallScreen ? 'gap-y-12' : ''} { !$isSmallScreen ? 'flex-1' : '' }"
        style={`
          display: grid;
          min-width: ${$isSmallScreen ? Math.max(400, tableConfigs.left.columns * 60 + tableConfigs.middle.columns * 60 + 100) + 'px' : minGridWidth + 'px'};
          align-items: end;
          grid-template-columns: ${
            $isSmallScreen
              ? '32px 4px minmax(300px, 5fr) 36px minmax(120px, 2fr)'
              : '32px 4px minmax(300px, 5fr) 36px minmax(120px, 2fr) 36px minmax(600px, 10fr)'
          };
          grid-template-rows: ${$isSmallScreen ? 'auto auto' : 'auto'};
        `}
      >
        {#if $isSmallScreen}
          <!-- Row numbers for the top row (left and middle tables) -->
          <Table rowNumbersOnly={true} rows={maxRows} maxRows={maxRows} tableName="" style="grid-column: 1;" isDesktop={false} />
          <div class="flex flex-col w-full min-w-0" style="grid-column: 3; min-width: {tableConfigs.left.columns * 60}px;">
            <Table
              rows={tableConfigs.left.rows}
              columns={tableConfigs.left.columns}
              fridge="left"
              tableName={tableConfigs.left.name}
              isDesktop={false}
            />
          </div>
          <div class="flex flex-col w-full min-w-0" style="grid-column: 5; min-width: {tableConfigs.middle.columns * 60}px;">
            <Table
              rows={tableConfigs.middle.rows}
              columns={tableConfigs.middle.columns}
              fridge="middle"
              tableName={tableConfigs.middle.name}
              isDesktop={false}
            />
          </div>
          <!-- Row numbers for the bottom row (main table) -->
          <Table rowNumbersOnly={true} rows={maxRows} maxRows={maxRows} tableName="" style="grid-column: 1; grid-row: 2;" isDesktop={false} />
          <div class="flex flex-col w-full min-w-0" style="grid-column: 3 / 6; grid-row: 2; min-width: {tableConfigs.main.columns * 60}px;">
            <Table
              rows={tableConfigs.main.rows}
              columns={tableConfigs.main.columns}
              fridge="main"
              tableName={tableConfigs.main.name}
              isDesktop={false}
            />
          </div>
        {:else}
          <!-- Row numbers for the desktop layout -->
          <Table rowNumbersOnly={true} rows={maxRows} maxRows={maxRows} tableName="" style="grid-column: 1;" isDesktop={true} />
          <div class="flex flex-col w-full min-w-0 h-full" style="grid-column: 3; min-width: {tableConfigs.left.columns * 60}px;">
            <Table
              rows={tableConfigs.left.rows}
              columns={tableConfigs.left.columns}
              fridge="left"
              tableName={tableConfigs.left.name}
              isDesktop={true}
            />
          </div>
          <div class="flex flex-col w-full min-w-0 h-full" style="grid-column: 5; min-width: {tableConfigs.middle.columns * 60}px;">
            <Table
              rows={tableConfigs.middle.rows}
              columns={tableConfigs.middle.columns}
              fridge="middle"
              tableName={tableConfigs.middle.name}
              isDesktop={true}
            />
          </div>
          <div class="flex flex-col w-full min-w-0 h-full" style="grid-column: 7; min-width: {tableConfigs.main.columns * 60}px;">
            <Table
              rows={tableConfigs.main.rows}
              columns={tableConfigs.main.columns}
              fridge="main"
              tableName={tableConfigs.main.name}
              isDesktop={true}
            />
          </div>
        {/if}
      </div>
    </div>
  </main>