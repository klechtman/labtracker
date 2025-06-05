<script>
  import Cell from './Cell.svelte';
  import { tableConfigs, leftTableStore, middleTableStore, mainTableStore, hoveredRow } from '../stores/tableStore';
  import { getCellKey } from '../utils/cellUtils';
  import { createEventDispatcher } from 'svelte';
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import RowNumber from './RowNumber.svelte';

  const dispatch = createEventDispatcher();

  export let rows = 21;
  export let columns = 10;
  export let renamingCell = null;
  export let handleStartRenaming;
  export let fridge = 'main';
  export let tableName = '';
  export let rowNumbersOnly = false;

  // Get the appropriate store based on fridge
  $: store = fridge === 'left' ? leftTableStore :
            fridge === 'middle' ? middleTableStore :
            mainTableStore;

  // Generate row and column arrays
  $: colArr = Array.from({ length: columns }, (_, i) => i);

  // Calculate maxRows across all tables
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
</script>

<div class="flex flex-col justify-end h-full">
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
    <div class="grid flex-grow w-full gap-px" data-columns={columns} style="grid-template-rows: repeat({maxRows}, 1fr); grid-template-columns: repeat({columns}, minmax(0, 1fr)); margin-left: 0;">
      {#each Array.from({ length: maxRows }, (_, row) => maxRows - row - 1) as row}
        {#each colArr as col}
          {#if (!Array.isArray(rows) && row < rows) || (Array.isArray(rows) && row < rows[col])}
            {@const cellKey = getCellKey(fridge, row, col)}
            {@const cellData = $store[cellKey] || {}}
            <div class="relative" data-col={col} role="presentation"
              on:mouseenter={() => hoveredRow.set(row + 1)}
              on:mouseleave={() => hoveredRow.set(null)}
            >
              <Cell 
                state={cellData.state || "empty"}
                outFridge={cellData.outFridge || false}
                linked={cellData.linked || false}
                groupName={cellData.groupName || ""}
                groupColor={cellData.groupColor || ""}
                text={cellData.text || ""}
                cellKey={cellKey}
                renamingCell={renamingCell}
                on:startRenaming={handleStartRenaming}
                on:stopRenaming
                bgColor={row % 2 === 0 ? 'white' : 'var(--color-sky-50)'}
                isTopCell={row === (Array.isArray(rows) ? rows[col] : rows) - 1}
                col={col}
              />
            </div>
          {:else}
            <div class="cell" data-col={col} role="presentation"></div>
          {/if}
        {/each}
      {/each}
    </div>
    <div class="mt-2 flex flex-col">
      {#if tableName}
        <div class="h-0.5 bg-sky-800 mb-1"></div>
      {/if}
      <div class="font-bold text-base text-sky-800 min-h-[28px]">{tableName}</div>
    </div>
  {/if}
</div> 