<script>
  import Cell from './Cell.svelte';
  import { tableConfigs, leftTableStore, middleTableStore, mainTableStore, hoveredRow, selectedCells, isLinkMode } from '../../stores/tableStore';
  import { getCellKey } from '../../utils/cellUtils';
  import { createEventDispatcher } from 'svelte';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import RowNumber from './RowNumber.svelte';
  import ColumnNumber from './ColumnNumber.svelte';

  const dispatch = createEventDispatcher();

  export let rows = 21;
  export let columns = 10;
  export let fridge = 'main';
  export let tableName = '';
  export let rowNumbersOnly = false;

  let store;
  $: store = fridge === 'left' ? leftTableStore :
            fridge === 'middle' ? middleTableStore :
            mainTableStore;

  $: colArr = Array.from({ length: columns }, (_, i) => i);

  $: allTableRows = [
    Array.isArray(tableConfigs.left.rows) ? Math.max(...tableConfigs.left.rows) : tableConfigs.left.rows,
    Array.isArray(tableConfigs.middle.rows) ? Math.max(...tableConfigs.middle.rows) : tableConfigs.middle.rows,
    Array.isArray(tableConfigs.main.rows) ? Math.max(...tableConfigs.main.rows) : tableConfigs.main.rows
  ];
  $: maxRows = Math.max(...allTableRows);

  const hoveredCol = writable(null);
  function setHoveredCol(col) { hoveredCol.set(col); }
  setContext('hoveredCol', hoveredCol);
  setContext('setHoveredCol', setHoveredCol);

  // Function to get the topmost rendered cell row for a column
  function getTopmostCellRow(col) {
    if (Array.isArray(rows)) {
      return rows[col] - 1;
    }
    return rows - 1;
  }

  function handleTableClick(event) {
    // Don't deselect if we're in link mode
    if ($isLinkMode) return;

    // Only deselect if the click is directly on the table container
    if (event.target === event.currentTarget) {
      selectedCells.set(new Set());
    }
  }
</script>

<div class="flex flex-col justify-end h-full" role="presentation" on:click={handleTableClick}>
  {#if rowNumbersOnly}
    <div class="grid flex-grow w-full gap-px" style="grid-template-rows: repeat({maxRows}, 1fr); grid-template-columns: 1fr; margin-left: 0;">
      {#each Array.from({ length: maxRows }, (_, i) => maxRows - i) as n}
        <RowNumber number={n} />
      {/each}
      {#if !tableName}
        <div class="h-1"></div>
      {/if}
      <div class="mt-2 flex flex-col min-h-[28px]">
        {#if tableName}
          <div class="h-0.5 bg-sky-800 mb-1"></div>
          <div class="font-bold text-base text-sky-800">{tableName}</div>
        {/if}
      </div>
    </div>
  {:else}
    <div class="grid flex-grow w-full gap-px relative" data-columns={columns} style="grid-template-rows: repeat({maxRows}, 1fr); grid-template-columns: repeat({columns}, minmax(0, 1fr)); margin-left: 0;">
      {#each Array.from({ length: maxRows }, (_, row) => maxRows - row - 1) as row}
        {#each colArr as col}
          {#if (!Array.isArray(rows) && row < rows) || (Array.isArray(rows) && row < rows[col])}
            {@const cellKey = getCellKey(fridge, row, col)}
            {@const cellData = $store[cellKey] || {}}
            <div class="relative" data-col={col} role="presentation"
              on:mouseenter={() => {
                hoveredRow.set(row + 1);
                setHoveredCol(col);
              }}
              on:mouseleave={() => {
                hoveredRow.set(null);
                setHoveredCol(null);
              }}
            >
              <Cell 
                state={cellData.state || "empty"}
                outFridge={cellData.outFridge || false}
                linked={cellData.linked || false}
                groupName={cellData.groupName || ""}
                groupColor={cellData.groupColor || ""}
                text={cellData.text || ""}
                cellKey={cellKey}
                bgColor={row % 2 === 0 ? 'white' : 'var(--color-sky-50)'}
                isTopCell={row === (Array.isArray(rows) ? rows[col] : rows) - 1}
                col={col}
              />
            </div>
          {:else}
            <div class="relative" data-col={col} role="presentation"></div>
          {/if}
        {/each}
      {/each}
      
      {#if $hoveredCol !== null}
        {@const topRow = getTopmostCellRow($hoveredCol)}
        <div class="absolute" style="
          top: calc(({maxRows} - {topRow} - 1) * (100% / {maxRows}));
          left: calc({$hoveredCol} * (100% / {columns}));
          width: calc(100% / {columns});
          transform: translateY(-100%);
          padding-bottom: 2px;
        ">
          <ColumnNumber number={$hoveredCol + 1} />
        </div>
      {/if}
    </div>
    <div class="mt-2 flex flex-col">
      {#if tableName}
        <div class="h-0.5 bg-sky-800 mb-1"></div>
      {/if}
      <div class="font-bold text-base text-sky-800 min-h-[28px]">{tableName}</div>
    </div>
  {/if}
</div> 