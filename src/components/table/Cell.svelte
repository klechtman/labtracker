<script>
  import { createEventDispatcher, getContext } from 'svelte';
  import { CELL_STATES, GROUP_COLOR_HEX } from '../../constants';
  import { selectedCells, leftTableStore, middleTableStore, mainTableStore, isLinkMode, selectedGroup, isGroupMode, isAnyCellEditing, loadingCells, undoAffectedCells } from '../../stores/tableStore';
  import { hoveredGroup } from '../../stores/hoverStore';
  import { cn } from '../../lib/utils';
  import { updateCellName, getStoreByCellKey, getCellClass, getCellStyle, parseCellKey } from '../../utils/cellUtils';
  import { getTriangleColor, getTriangleClassAndStyle } from '../../constants/cellStyles';
  import Tooltip from '../common/Tooltip.svelte';

  const dispatch = createEventDispatcher();

  const hoveredCol = getContext('hoveredCol');
  const setHoveredCol = getContext('setHoveredCol');

  export let linked = false;         // Is this cell part of a group?
  export let state = CELL_STATES.EMPTY;        // 'empty', 'regular', 'hover'
  export let groupName = '';         // Name of the group this cell belongs to (if any)
  export let groupColor = '';        // Color for this group (if any)
  export let text = '';              // Text inside the cell
  export let outFridge = false;      // Dashed border if true (default: false)
  export let cellKey = '';
  export let bgColor = '';
  export let isTopCell = false;
  export let col = null;

  $: isSelectedGroup = linked && $selectedGroup === groupName;
  $: isUndoAffected = $undoAffectedCells.has(cellKey);

  // Make text reactive to store changes
  $: {
    const store = getStoreByCellKey(cellKey);
    if (store) {
      const cellData = store.get(cellKey) || {};
      text = cellData.text || '';
    }
  }

  let isEditing = false;
  let inputElement;
  let isBlurFromTopBar = false;

  // Add a computed variable to lock down interaction if a group is selected
  $: isGroupSelectionMode = Boolean($selectedGroup) && !$isLinkMode;

  // Stop editing when link mode is activated - this ensures cells in renaming mode enter selected mode
  $: if ($isLinkMode && isEditing) {
    isEditing = false;
  }

  // Start editing when cell is selected and not in link mode or group selection mode
  $: if ($selectedCells.has(cellKey) && !$isLinkMode && !isEditing && !isGroupSelectionMode && !$loadingCells.has(cellKey)) {
    isEditing = true;
    setTimeout(() => {
      if (inputElement) {
        inputElement.focus();
        if (!text.trim()) {
          inputElement.select();
        } else {
          inputElement.selectionStart = inputElement.selectionEnd = text.length;
        }
      }
    }, 0);
  }

  // Stop editing when cell is deselected
  $: if ((!$selectedCells.has(cellKey) || $loadingCells.has(cellKey)) && isEditing) {
    isEditing = false;
  }

  // Update the global editing state when this cell's editing state changes
  $: if (isEditing) {
    isAnyCellEditing.set(true);
  } else {
    // When this cell stops editing, set the global state to false
    // The next cell that starts editing will set it back to true
    isAnyCellEditing.set(false);
  }

  // Enforce that outFridge can never be true when state is empty
  $: outFridge = state === CELL_STATES.EMPTY ? false : outFridge;

  // Enforce that empty cells can never be linked
  $: if (!text.trim() && linked) {
    const store = getStoreByCellKey(cellKey);
    store.updateCell(cellKey, { linked: false, groupName: '', groupColor: '' });
  }

  $: groupHover = linked && $hoveredGroup === groupName;

  // Get cell class and style using utility functions
  $: isDisabled = ($isLinkMode && !text.trim() && !linked) || ($isGroupMode && linked && groupName !== $selectedGroup) || ($isGroupMode && !linked) || ($isLinkMode && linked && (!$selectedGroup || groupName !== $selectedGroup)) || $loadingCells.has(cellKey);
  
  $: cellClass = getCellClass({ 
    state: $loadingCells.has(cellKey) ? CELL_STATES.LOADING : state, 
    linked, 
    outFridge, 
    groupHover, 
    isSelected: $selectedCells.has(cellKey),
    isDisabled,
    isSelectedGroup,
    isEditing
  });
  $: cellStyle = getCellStyle({ 
    state: $loadingCells.has(cellKey) ? CELL_STATES.LOADING : state, 
    linked, 
    groupHover, 
    groupColor, 
    bgColor, 
    isSelected: $selectedCells.has(cellKey),
    isDisabled,
    isSelectedGroup,
    isEditing,
    outFridge
  });

  $: triangleResult = getTriangleClassAndStyle({
    isEditing,
    isHovered: state === CELL_STATES.HOVER,
    isSelected: $selectedCells.has(cellKey),
    groupHover,
    isSelectedGroup,
    isDisabled,
    groupColor,
    isLoading: $loadingCells.has(cellKey)
  });
  $: triangleClass = triangleResult.class;
  $: triangleStyle = triangleResult.style;

  // Function to get full cell name for tooltip
  function getFullCellName() {
    if (!cellKey) return '';
    const { fridge, row, col } = parseCellKey(cellKey);
    let tableTitle = '';
    if (fridge === 'left') tableTitle = 'Cytomat5';
    else if (fridge === 'middle') tableTitle = 'Cytomat2';
    else tableTitle = 'Cytomat10';
    return `${tableTitle} Shelf ${row + 1} - ${col + 1}`;
  }

  // Function to get tooltip text
  function getTooltipText() {
    if (isDisabled) return '';
    
    let tooltip = getFullCellName();
    if (text.trim()) {
      tooltip += `\n${text}`;
    }
    if (groupName) {
      tooltip += `\n${groupName}`;
    }
    return tooltip;
  }

  // Computed tooltip text
  $: tooltipText = getTooltipText();

  function setState(newState) {
    if ($loadingCells.has(cellKey)) return;
    const store = getStoreByCellKey(cellKey);
    store.updateCell(cellKey, { state: newState });
  }

  function handleMouseEnter() {
    if ($loadingCells.has(cellKey)) return;
    if (state === CELL_STATES.EMPTY) {
      setState(CELL_STATES.HOVER);
      return;
    }
    if (state === CELL_STATES.REGULAR) {
      setState(CELL_STATES.HOVER);
    }
    if (linked) {
      hoveredGroup.set(groupName);
    }
  }

  function handleMouseLeave() {
    if ($loadingCells.has(cellKey)) return;
    if (state === CELL_STATES.HOVER && !text.trim()) {
      setState(CELL_STATES.EMPTY);
      return;
    }
    if (state === CELL_STATES.HOVER) {
      setState(CELL_STATES.REGULAR);
    }
    if (linked) {
      hoveredGroup.set(null);
    }
  }

  function handleMouseDown(event) {
    if ($loadingCells.has(cellKey)) return;
    if (event.target === event.currentTarget) {
    event.preventDefault();
    }
  }

  function handleInput(event) {
    if ($isLinkMode || $isGroupMode || $loadingCells.has(cellKey)) return;
    const newValue = event.target.value;
    const store = getStoreByCellKey(cellKey);
    if (!store) return;
    store.updateCell(cellKey, {
      text: newValue,
      state: newValue.trim() ? CELL_STATES.REGULAR : CELL_STATES.EMPTY
    });
  }

  function handleKeyDown(event) {
    if ($loadingCells.has(cellKey)) return;
    if ((event.key === 'Enter' || event.key === 'Escape') && isEditing) {
      isEditing = false;
      // No need to reset cell value for Enter, only for Escape, but for simplicity, keep the same logic for both
      const store = getStoreByCellKey(cellKey);
      const currentCell = store.get(cellKey) || {};
      store.updateCell(cellKey, {
        ...currentCell,
        text: text, // Reset to original text (harmless for Enter)
        state: text.trim() ? CELL_STATES.REGULAR : CELL_STATES.EMPTY
      });
      // Deselect the cell
      selectedCells.update(set => {
        const newSet = new Set(set);
        newSet.delete(cellKey);
        return newSet;
      });
    } else if (event.key === ' ' && !isEditing) {
      handleClick();
    }
  }

  function handleBlur(event) {
    if ($loadingCells.has(cellKey)) return;
    // Check if the related target is the top bar input
    const topBarInput = document.querySelector('.cell-info-bar input');
    if (event.relatedTarget === topBarInput) {
      isBlurFromTopBar = true;
      return;
    }

    if (isEditing && !isBlurFromTopBar) {
      isEditing = false;
    }
    isBlurFromTopBar = false;
  }

  function handleClick(event) {
    if ($loadingCells.has(cellKey)) return;
    // Stop event propagation to prevent the main click handler from firing
    if (event) event.stopPropagation();
    
    // Don't allow selection of empty cells in link mode
    if ($isLinkMode && !text.trim() && !linked) return;
    
    // Don't allow selection of cells not in the selected group when in group mode
    if ($isGroupMode && !linked) return;
    
    // Don't allow selection of cells from other groups when in group mode
    if ($isGroupMode && linked && groupName !== $selectedGroup) return;
    
    // Don't allow selection of linked cells in link mode (unless they're in the selected group)
    if ($isLinkMode && linked && (!$selectedGroup || groupName !== $selectedGroup)) return;

    selectedCells.update(set => {
      const newSet = new Set(set);
      
      // In link mode, allow toggling selection
      if ($isLinkMode) {
        if (newSet.has(cellKey)) {
          newSet.delete(cellKey);
        } else {
          newSet.add(cellKey);
        }
        return newSet;
      }

      // For non-link mode, just select the cell (no deselection)
      newSet.clear();
      newSet.add(cellKey);
      return newSet;
    });

    // Start editing immediately on click if not in link mode
    if (!$isLinkMode) {
      isEditing = true;
      // Focus the input element after a brief delay to ensure it's mounted
      setTimeout(() => {
        if (inputElement) {
          inputElement.focus();
          // Only select all text if the cell is empty
          if (!text.trim()) {
            inputElement.select();
          } else {
            // Place cursor at the end for non-empty cells
            inputElement.selectionStart = inputElement.selectionEnd = text.length;
          }
        }
      }, 0);
    }
  }
</script>

<Tooltip 
  text={tooltipText}
  disabled={isDisabled}
>
  <div
    tabindex="0"
    role="button"
    class={cn(
      "relative w-16 h-16 border border-slate-300 flex items-center justify-center cursor-pointer select-none",
      cellClass,
      isUndoAffected ? "undo-animation" : ""
    )}
    data-cell-key={cellKey}
    style={cellStyle}
    on:mouseover={!isGroupSelectionMode && !$loadingCells.has(cellKey) ? handleMouseEnter : undefined}
    on:mouseout={!isGroupSelectionMode && !$loadingCells.has(cellKey) ? handleMouseLeave : undefined}
    on:mousedown={!isGroupSelectionMode && !$loadingCells.has(cellKey) ? handleMouseDown : undefined}
    on:click={!isGroupSelectionMode && !$loadingCells.has(cellKey) ? handleClick : undefined}
    on:keydown={!isGroupSelectionMode && !$loadingCells.has(cellKey) ? handleKeyDown : undefined}
    on:focus={!isGroupSelectionMode && !$loadingCells.has(cellKey) ? handleMouseEnter : undefined}
    on:blur={!isGroupSelectionMode && !$loadingCells.has(cellKey) ? handleBlur : undefined}
    on:mouseenter={!isGroupSelectionMode && !$loadingCells.has(cellKey) ? () => setHoveredCol(col) : undefined}
    on:mouseleave={!isGroupSelectionMode && !$loadingCells.has(cellKey) ? () => setHoveredCol(null) : undefined}
    style:cursor={isGroupSelectionMode || $loadingCells.has(cellKey) ? 'not-allowed' : undefined}
    aria-disabled={$loadingCells.has(cellKey) ? 'true' : undefined}
  >
  {#if isTopCell && hoveredCol.value === col}
    <div class={cn(
      "absolute -top-8 left-0 w-full text-white py-[2px] rounded-none text-[0.9em] font-bold pointer-events-none z-20 box-border flex justify-center items-center",
      "bg-sky-800"
    )} style="background: var(--color-sky-800, #0369a1);">{col + 1}</div>
  {/if}
  

  {#if linked}
    <div
      class="absolute top-0 right-0 w-0 h-0 z-2 border-t-[16px] border-l-[16px] border-l-transparent {triangleClass}"
      style={triangleStyle}
    ></div>
  {/if}
  {#if isEditing}
    <input
      bind:this={inputElement}
      type="text"
      class="w-full h-full px-1 bg-transparent border-none outline-none"
      value={text}
      on:input={handleInput}
      on:keydown={handleKeyDown}
      on:blur={handleBlur}
      on:click|stopPropagation
    />
  {:else if ($loadingCells.has(cellKey) || state === CELL_STATES.EMPTY || (state === CELL_STATES.HOVER && text === '')) && !$selectedCells.has(cellKey)}
    <span class="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-[var(--cell-height)] text-center">---</span>
  {:else if state !== CELL_STATES.EMPTY && state !== 'group-highlight' && !$loadingCells.has(cellKey) && !(state === CELL_STATES.HOVER && text === '')}
    <span class="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-[var(--cell-height)] text-left">{text}</span>
  {/if}
  </div>
</Tooltip>

<style>
  .undo-animation {
    animation: undoFadeOut 2s ease-out;
  }
  
  @keyframes undoFadeOut {
    0% {
      background-color: #e0f2fe;
      border-color: #7dd3fc;
      font-size: inherit;
      line-height: inherit;
    }
    100% {
      background-color: white;
      border-color: #cbd5e1;
      font-size: inherit;
      line-height: inherit;
    }
  }
</style>
