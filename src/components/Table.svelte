<script>
  import Cell from './Cell.svelte';
  import { tableConfigs, leftTableStore, middleTableStore, mainTableStore } from '../stores/tableStore';
  import { STYLES } from '../constants';
  import { getCellKey } from '../utils/cellUtils';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let rows = 21;
  export let columns = 10;
  export let renamingCell = null;
  export let handleStartRenaming;
  export let fridge = 'main';
  export let tableName = '';

  // Get the appropriate store based on fridge
  $: store = fridge === 'left' ? leftTableStore :
            fridge === 'middle' ? middleTableStore :
            mainTableStore;

  // Generate row and column arrays
  $: rowArr = Array.isArray(rows) ? null : Array.from({ length: rows }, (_, i) => i);
  $: colArr = Array.from({ length: columns }, (_, i) => i);

  // Calculate maxRows across all tables
  $: allTableRows = [
    Array.isArray(tableConfigs.left.rows) ? Math.max(...tableConfigs.left.rows) : tableConfigs.left.rows,
    Array.isArray(tableConfigs.middle.rows) ? Math.max(...tableConfigs.middle.rows) : tableConfigs.middle.rows,
    Array.isArray(tableConfigs.main.rows) ? Math.max(...tableConfigs.main.rows) : tableConfigs.main.rows
  ];
  $: maxRows = Math.max(...allTableRows);

  let hoveredCol = null;
</script>

<div class="table-outer h-full flex flex-col justify-end">
  <div class="table-container flex-grow" data-columns={columns} style="grid-template-rows: repeat({maxRows}, 1fr);" class:col-hover-0={hoveredCol === 0} class:col-hover-1={hoveredCol === 1} class:col-hover-2={hoveredCol === 2} class:col-hover-3={hoveredCol === 3} class:col-hover-4={hoveredCol === 4} class:col-hover-5={hoveredCol === 5} class:col-hover-6={hoveredCol === 6} class:col-hover-7={hoveredCol === 7} class:col-hover-8={hoveredCol === 8} class:col-hover-9={hoveredCol === 9}>
    {#each Array.from({ length: maxRows }, (_, row) => maxRows - row - 1) as row}
      {#each colArr as col}
        {#if (!Array.isArray(rows) && row < rows) || (Array.isArray(rows) && row < rows[col])}
          {@const cellKey = getCellKey(fridge, row, col)}
          {@const cellData = $store[cellKey] || {}}
          <div class="cell-wrapper" data-col={col} style="position: relative;"
            role="presentation"
            on:mouseenter={() => hoveredCol = col}
            on:mouseleave={() => hoveredCol = null}>
            {#if row === (Array.isArray(rows) ? rows[col] : rows) - 1}
              <div class="col-number col-number-{col}">{col + 1}</div>
            {/if}
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
            />
          </div>
        {:else}
          <div class="cell" data-col={col}
            role="presentation"
            on:mouseenter={() => hoveredCol = col}
            on:mouseleave={() => hoveredCol = null}></div>
        {/if}
      {/each}
    {/each}
  </div>
  <div class="table-footer">
    <div class="footer-line"></div>
    <div class="table-header">{tableName}</div>
  </div>
</div>

<style>
.table-outer {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.table-container {
  display: grid;
  gap: 1px;
}

.table-container[data-columns="5"] {
  grid-template-columns: repeat(5, 1fr);
}

.table-container[data-columns="2"] {
  grid-template-columns: repeat(2, 1fr);
}

.table-container[data-columns="10"] {
  grid-template-columns: repeat(10, 1fr);
}

.table-footer {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
}

.footer-line {
  height: 2px;
  background-color: var(--color-sky-800);
  margin-bottom: 4px;
}

.table-header {
  font-family: var(--font-family);
  font-weight: 700;
  font-size: var(--font-size-header);
  color: var(--color-sky-800);
}

.cell-wrapper {
  position: relative;
}

.col-number {
  position: absolute;
  top: -1.7em;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-sky-800, #0369a1);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: bold;
  display: none;
  pointer-events: none;
  z-index: 2;
}

.col-hover-0 .col-number-0,
.col-hover-1 .col-number-1,
.col-hover-2 .col-number-2,
.col-hover-3 .col-number-3,
.col-hover-4 .col-number-4,
.col-hover-5 .col-number-5,
.col-hover-6 .col-number-6,
.col-hover-7 .col-number-7,
.col-hover-8 .col-number-8,
.col-hover-9 .col-number-9 {
  display: block;
}
</style> 