<script>
  import { selectedCells, leftTableStore, middleTableStore, mainTableStore, isLinkMode, selectedCellData } from '../../stores/tableStore';
  import { getStoreByCellKey, parseCellKey } from '../../utils/cellUtils';
  import { GROUP_COLOR_HEX } from '../../constants';
  import { CELL_STATES } from '../../constants';
  import Button from '../common/Button.svelte';
  import InputField from '../common/InputField.svelte';
  import incubator from '../icons/incubator.svelte';
  import unlink from '../icons/unlink.svelte';
  import erase from '../icons/erase.svelte';

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
    else tableTitle = 'Cytomat10';
    return `${tableTitle} Shelf ${row + 1} - ${col + 1}`;
  }

  function getGroupColor(color) {
    if (!color) return '#cbd5e1';
    return GROUP_COLOR_HEX[color] || color;
  }

  // Toggle Fridge handler
  function handleToggleFridge() {
    const selected = $selectedCells;
    if (selected.size === 0) return;
    const cellKey = Array.from(selected)[0];
    const store = getStoreByCellKey(cellKey);
    const cellData = store.get(cellKey) || {};
    const newOutFridgeState = !cellData.outFridge;
    if (cellData.text && cellData.text.trim()) {
      store.updateCell(cellKey, {
        ...cellData,
        outFridge: newOutFridgeState,
        state: CELL_STATES.REGULAR
      });
      selectedCells.set(new Set());
    }
  }

  // Unlink handler
  function handleUnlink() {
    const selected = $selectedCells;
    if (selected.size === 0) return;
    const cellKey = Array.from(selected)[0];
    const store = getStoreByCellKey(cellKey);
    const cellData = store.get(cellKey) || {};
    if (cellData.linked) {
      const groupName = cellData.groupName;
      const groupCells = [];
      const allStores = [
        { store: leftTableStore, data: $leftTableStore },
        { store: middleTableStore, data: $middleTableStore },
        { store: mainTableStore, data: $mainTableStore }
      ];
      allStores.forEach(({ store, data }) => {
        Object.entries(data).forEach(([key, cell]) => {
          if (cell.linked && cell.groupName === groupName) {
            groupCells.push({ key, store });
          }
        });
      });
      if (groupCells.length <= 2) {
        groupCells.forEach(({ key, store }) => {
          const currentCell = store.get(key) || {};
          store.updateCell(key, {
            ...currentCell,
            linked: false,
            groupName: '',
            groupColor: '',
            state: CELL_STATES.REGULAR
          });
        });
      } else {
        store.updateCell(cellKey, {
          ...cellData,
          linked: false,
          groupName: '',
          groupColor: '',
          state: CELL_STATES.REGULAR
        });
      }
      selectedCells.set(new Set());
    }
  }

  // Erase handler
  function handleErase() {
    const selected = $selectedCells;
    if (selected.size === 0) return;
    const cellKey = Array.from(selected)[0];
    const store = getStoreByCellKey(cellKey);
    const cellData = store.get(cellKey) || {};
    store.updateCell(cellKey, {
      text: '',
      linked: false,
      groupName: '',
      groupColor: '',
      outFridge: false,
      state: CELL_STATES.EMPTY
    });
    selectedCells.set(new Set());
  }

  $: canFridge = $selectedCellData && $selectedCellData.text && $selectedCellData.text.trim();
  $: canUnlink = $selectedCellData && $selectedCellData.linked;
</script>

<div class="flex items-center gap-3">
  <span class="font-title select-none w-[180px] inline-block">
    {#if cellKey}
      {getCellPosition(cellKey)}
    {:else}
      No cell selected
    {/if}
  </span>
  <div class="flex items-center gap-2 cell-info-bar">
    <InputField
      type="input"
      value={cellData.text || ''}
      placeholder="Plate name"
      disabled={$isLinkMode || !cellKey}
      iconColor={getGroupColor(cellData.groupColor)}
      on:input={handleInput}
      on:keydown={handleKeyDown}
      extraClasses="w-auto min-w-[160px]"
    />
    <Button 
      icon={incubator} 
      color="purple" 
      on:click={handleToggleFridge} 
      disabled={!canFridge || $isLinkMode}
    />
    <Button 
      icon={unlink} 
      color="amber" 
      on:click={handleUnlink}
      disabled={!canUnlink || $isLinkMode}
    />
    <Button 
      icon={erase} 
      color="red" 
      on:click={handleErase}
      disabled={!canFridge || $isLinkMode}
    />
  </div>
</div> 