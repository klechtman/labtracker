<script>
  import { selectedCells, leftTableStore, middleTableStore, mainTableStore } from '../stores/tableStore';
  import { parseCellKey, updateCellName, getCellName, getStoreByCellKey } from '../utils/cellUtils';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { GROUP_COLOR_HEX } from '../constants';

  let lastSelectedCellKey = null;
  let cellData = {};
  let inputValue = '';

  // Track previous selection and value for robust saving
  let previousSelectedCellKey = null;
  let previousInputValue = '';

  $: {
    const selected = Array.from($selectedCells);
    const newSelectedCellKey = selected.length > 0 ? selected[selected.length - 1] : null;

    // If the selection changed, save the previous input value
    if (previousSelectedCellKey && previousSelectedCellKey !== newSelectedCellKey) {
      const prevStore = getStoreByCellKey(previousSelectedCellKey);
      if (prevStore) {
        updateCellName(previousSelectedCellKey, previousInputValue, prevStore);
      }
    }

    lastSelectedCellKey = newSelectedCellKey;
    if (lastSelectedCellKey) {
      const store = getStoreByCellKey(lastSelectedCellKey);
      cellData = store ? get(store)[lastSelectedCellKey] || {} : {};
      inputValue = getCellName(lastSelectedCellKey, store);
    } else {
      cellData = {};
      inputValue = '';
    }

    // Update previous trackers
    previousSelectedCellKey = lastSelectedCellKey;
    previousInputValue = inputValue;
  }

  // Handle input changes
  function handleInput() {
    if (lastSelectedCellKey) {
      const store = getStoreByCellKey(lastSelectedCellKey);
      updateCellName(lastSelectedCellKey, inputValue, store);
      previousInputValue = inputValue; // keep tracker in sync
    }
  }

  // Handle input blur to ensure state is updated
  function handleInputBlur() {
    if (lastSelectedCellKey) {
      const store = getStoreByCellKey(lastSelectedCellKey);
      updateCellName(lastSelectedCellKey, inputValue, store);
      previousInputValue = inputValue;
    }
  }

  // Handle input keydown for Enter key
  function handleInputKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (lastSelectedCellKey) {
        const store = getStoreByCellKey(lastSelectedCellKey);
        updateCellName(lastSelectedCellKey, inputValue, store);
        previousInputValue = inputValue;
      }
    }
  }

  // Parse cellKey for display
  function getCellPosition(cellKey) {
    if (!cellKey) return '';
    const { fridge, row, col } = parseCellKey(cellKey);
    let tableTitle = '';
    if (fridge === 'left') tableTitle = 'Cytomax';
    else if (fridge === 'middle') tableTitle = 'Middle';
    else tableTitle = 'Main';
    return `${tableTitle} Shelf ${row + 1} Pos ${col + 1}`;
  }

  // Group color logic
  function getGroupColor(color) {
    if (!color) return '#cbd5e1'; // slate-300
    return GROUP_COLOR_HEX[color] || color;
  }
</script>

<div class="flex items-center gap-3">
  <span class="font-bold text-sky-800 text-lg select-none">
    {#if lastSelectedCellKey}
      {getCellPosition(lastSelectedCellKey)}
    {:else}
      No cell selected
    {/if}
  </span>
  <div class="flex items-center gap-2">
    <span class="w-6 h-6 rounded bg-slate-200 border border-slate-300 flex items-center justify-center" style="background-color: {getGroupColor(cellData.groupColor)}"></span>
    <input
      class="border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white min-w-[160px]"
      type="text"
      placeholder="Plate name"
      bind:value={inputValue}
      on:input={handleInput}
      on:blur={handleInputBlur}
      on:keydown={handleInputKeydown}
    />
  </div>
</div> 