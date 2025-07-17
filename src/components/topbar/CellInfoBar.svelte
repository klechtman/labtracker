<script>
  import { selectedCells, leftTableStore, middleTableStore, mainTableStore, isLinkMode, selectedCellData, isAnyCellEditing } from '../../stores/tableStore';
  import { getStoreByCellKey, parseCellKey, triggerAnimation, triggerActionAnimation } from '../../utils/cellUtils';
  import { GROUP_COLOR_HEX } from '../../constants';
  import { CELL_STATES } from '../../constants';
  import Button from '../common/Button.svelte';
  import InputField from '../common/InputField.svelte';
  import Tooltip from '../common/Tooltip.svelte';
  import { toastStore } from '../../stores/toastStore';
  import outfridge from '../icons/outfridge.svelte';
  import unlink from '../icons/unlink.svelte';
  import erase from '../icons/erase.svelte';
  import X from '../icons/X.svelte';
  import undo from '../icons/undo.svelte';

  let cellData = {};
  let cellKey = null;
  let originalValue = null;
  let lastValue = '';

  // This block will re-run whenever the selection or any table store changes
  $: {
    const selected = Array.from($selectedCells || []);
    // In link mode, don't show any selected cell in the info bar
    cellKey = ($isLinkMode || selected.length === 0) ? null : selected[0];
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

  $: if (cellKey && originalValue === null) {
    // Track original value when a cell is selected for editing
    const store = getStoreByCellKey(cellKey);
    if (store) {
      const cell = store.get(cellKey) || {};
      originalValue = cell.text;
      lastValue = cell.text || '';
    }
  }
  $: if (!cellKey && originalValue !== null) {
    originalValue = null;
    lastValue = '';
  }

  function handleInput(event) {
    if ($isLinkMode || !cellKey) return;
    const newValue = event.target.value;
    const store = getStoreByCellKey(cellKey);
    if (!store) return;
    // If cell is being emptied and wasn't empty before, show toast
    if (newValue.trim() === '' && lastValue && lastValue.trim() !== '' && originalValue && originalValue.trim() !== '') {
      const undoData = { cellKey, store, prevText: originalValue };
      toastStore.add({
        icon: erase,
        color: 'red',
        text: getCellPosition(cellKey) + ' is now empty',
        undoAction: (data) => {
          const { cellKey, store, prevText } = data;
          store.updateCell(cellKey, { text: prevText, state: prevText.trim() ? CELL_STATES.REGULAR : CELL_STATES.EMPTY });
        },
        undoData
      });
    }
    store.updateCell(cellKey, {
      text: newValue,
      state: newValue.trim() ? CELL_STATES.REGULAR : CELL_STATES.EMPTY
    });
    lastValue = newValue;
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.target.blur();
      selectedCells.set(new Set());
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

  // Unlink handler
  function handleUnlink() {
    const selected = $selectedCells;
    if (selected.size === 0) return;
    const cellKey = Array.from(selected)[0];
    const store = getStoreByCellKey(cellKey);
    const cellData = store.get(cellKey) || {};
    if (cellData.linked) {
      // Store the original state for undo
      const originalState = {
        cellKey,
        store,
        linked: cellData.linked,
        groupName: cellData.groupName,
        groupColor: cellData.groupColor,
        state: cellData.state
      };
      
      // Show toast using centralized system
      toastStore.add({
        icon: unlink,
        color: 'amber',
        text: `Unlinked ${cellData.text || 'this cell'} from ${cellData.groupName}`,
        undoAction: undoUnlink,
        undoData: originalState
      });
      
      // Perform the unlink action immediately
      performUnlink();
    }
  }

  function undoUnlink(originalState) {
    const { cellKey, store, linked, groupName, groupColor, state } = originalState;
    const currentCell = store.get(cellKey) || {};
    
    // Restore the original linked state
    store.updateCell(cellKey, {
      ...currentCell,
      linked,
      groupName,
      groupColor,
      state
    });
    
    // Show confirmation toast
    toastStore.add({
      icon: unlink,
      color: 'emerald',
      text: `Restored ${currentCell.text || 'this cell'} to ${groupName}`,
      duration: 2000
    });
  }

  function performUnlink() {
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
        // Trigger animation for all cells in the group
        triggerActionAnimation(groupCells.map(({ key }) => key));
      } else {
        store.updateCell(cellKey, {
          ...cellData,
          linked: false,
          groupName: '',
          groupColor: '',
          state: CELL_STATES.REGULAR
        });
        // Trigger animation for the single cell
        triggerActionAnimation([cellKey]);
      }
      selectedCells.set(new Set());
    }
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
      // Store the original state for undo
      const originalState = {
        cellKey,
        store,
        outFridge: cellData.outFridge,
        state: cellData.state
      };
      
      store.updateCell(cellKey, {
        ...cellData,
        outFridge: newOutFridgeState,
        state: CELL_STATES.REGULAR
      });
      
      // Show appropriate toast based on the new state
      const toastText = newOutFridgeState 
        ? `${cellData.text} has been taken out`
        : `${cellData.text} has been returned`;
      
      toastStore.add({
        icon: outfridge,
        color: 'sky',
        text: toastText,
        undoAction: undoOutFridge,
        undoData: originalState
      });
      
      selectedCells.set(new Set());
    }
  }

  function undoOutFridge(originalState) {
    const { cellKey, store, outFridge, state } = originalState;
    const currentCell = store.get(cellKey) || {};
    
    // Restore the original outfridge state
    store.updateCell(cellKey, {
      ...currentCell,
      outFridge,
      state
    });
    
    // Show confirmation toast
    const undoText = outFridge 
      ? `${currentCell.text} has been taken out`
      : `${currentCell.text} has been returned`;
    
    toastStore.add({
              icon: outfridge,
      color: 'sky',
      text: undoText,
      duration: 2000
    });
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
  
  // Tooltip text for purple button
  $: purpleButtonTooltip = $selectedCellData && $selectedCellData.outFridge ? "Return plate" : "Take plate out";
</script>

<div class="grid grid-flow-col items-end gap-2">
  <div class="w-[170px] min-w-[170px] h-[34px] flex items-center relative">
    <span class="font-title select-none block w-full">
      {#if cellKey}
        {getCellPosition(cellKey)}
      {:else}
        No cell selected
      {/if}
    </span>
  </div>
  <div class="grid grid-flow-col items-center gap-2 cell-info-bar">
    <InputField
      type="input"
      bind:value={cellData.text}
      placeholder="Plate name"
      disabled={$isLinkMode || !cellKey}
      iconColor={getGroupColor(cellData.groupColor)}
      isHighlighted={$isAnyCellEditing}
      renameMode={$isAnyCellEditing}
      on:input={handleInput}
      on:keydown={handleKeyDown}
      extraClasses="w-[220px] min-w-[220px]"
    />
    <Tooltip text={purpleButtonTooltip} disabled={!canFridge || $isLinkMode}>
      <Button 
        icon={outfridge} 
        color="sky" 
        on:click={handleToggleFridge} 
        disabled={!canFridge || $isLinkMode}
      />
    </Tooltip>
    <Tooltip text="Unlink plate from group" disabled={!canUnlink || $isLinkMode}>
      <Button 
        icon={unlink} 
        color="amber" 
        on:click={handleUnlink}
        disabled={!canUnlink || $isLinkMode}
      />
    </Tooltip>
  </div>
</div>
