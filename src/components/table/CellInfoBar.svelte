<script>
  import { selectedCells, leftTableStore, middleTableStore, mainTableStore, isLinkMode } from '../../stores/tableStore';
  import { getStoreByCellKey, parseCellKey } from '../../utils/cellUtils';
  import { GROUP_COLOR_HEX } from '../../constants';
  import { CELL_STATES } from '../../constants';

  let cellData = {};
  let cellKey = null;

  // This block will re-run whenever the selection or any table store changes
  $: {
    const selected = Array.from($selectedCells || []);
    cellKey = selected.length > 0 ? selected[0] : null;
    if (cellKey) {
      let storeData;
      if (cellKey.startsWith('left')) storeData = $leftTableStore;
      else if (cellKey.startsWith('middle')) storeData = $middleTableStore;
      else storeData = $mainTableStore;
      cellData = storeData[cellKey] || {};
    } else {
      cellData = {};
    }
  }

  function handleInput(event) {
    if ($isLinkMode || !cellKey) return;
    const newValue = event.target.value;
    const store = getStoreByCellKey(cellKey);
    if (!store) return;
    store.updateCell(cellKey, {
      text: newValue,
      state: newValue.trim() ? CELL_STATES.REGULAR : CELL_STATES.EMPTY
    });
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.target.blur();
    }
  }

  function getCellPosition(cellKey) {
    if (!cellKey) return '';
    const { fridge, row, col } = parseCellKey(cellKey);
    let tableTitle = '';
    if (fridge === 'left') tableTitle = 'Cytomat5';
    else if (fridge === 'middle') tableTitle = 'Cytomat2';
    else tableTitle = 'Cytomat10 Hotel';
    return `${tableTitle} Shelf ${row + 1} - ${col + 1}`;
  }

  function getGroupColor(color) {
    if (!color) return '#cbd5e1';
    return GROUP_COLOR_HEX[color] || color;
  }
</script>

<div class="flex items-center gap-3">
  <span class="font-bold text-sky-800 text-lg select-none w-[220px] inline-block">
    {#if cellKey}
      {getCellPosition(cellKey)}
    {:else}
      No cell selected
    {/if}
  </span>
  <div class="flex items-center gap-2 cell-info-bar">
    <span class="w-6 h-6 rounded bg-slate-200 border border-slate-300 flex items-center justify-center" style="background-color: {getGroupColor(cellData.groupColor)}"></span>
    <input
      type="text"
      class="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white min-w-[160px] disabled:bg-slate-100 disabled:cursor-not-allowed"
      placeholder="Plate name"
      value={cellData.text || ''}
      on:input={handleInput}
      on:keydown={handleKeyDown}
      disabled={$isLinkMode || !cellKey}
    />
  </div>
</div> 