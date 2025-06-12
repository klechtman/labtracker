<script>
  import { createEventDispatcher, getContext } from 'svelte';
  import { CELL_STATES, GROUP_COLOR_HEX } from '../../constants';
  import { selectedCells, leftTableStore, middleTableStore, mainTableStore, isLinkMode, selectedGroup } from '../../stores/tableStore';
  import { hoveredGroup } from '../../stores/hoverStore';
  import { cn } from '../../lib/utils';
  import { updateCellName, getStoreByCellKey, getCellClass, getCellStyle } from '../../utils/cellUtils';

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
  $: isGroupSelectionMode = Boolean($selectedGroup);

  // Start editing when cell is selected and not in link mode or group selection mode
  $: if ($selectedCells.has(cellKey) && !$isLinkMode && !isEditing && !isSelectedGroup && !isGroupSelectionMode) {
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
  $: if (!$selectedCells.has(cellKey) && isEditing) {
    isEditing = false;
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
  $: isFromDifferentGroup = $isLinkMode && $selectedGroup && linked && groupName !== $selectedGroup;

  $: cellClass = getCellClass({ 
    state, 
    linked, 
    outFridge, 
    groupHover, 
    isSelected: $selectedCells.has(cellKey),
    isDisabled: ($isLinkMode && !text.trim() && !linked) || isFromDifferentGroup,
    isSelectedGroup
  });
  $: cellStyle = getCellStyle({ 
    state, 
    linked, 
    groupHover, 
    groupColor, 
    bgColor, 
    isSelected: $selectedCells.has(cellKey),
    isDisabled: ($isLinkMode && !text.trim() && !linked) || isFromDifferentGroup,
    isSelectedGroup
  });

  function setState(newState) {
    const store = getStoreByCellKey(cellKey);
    store.updateCell(cellKey, { state: newState });
  }

  function handleMouseEnter() {
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
    if (event.target === event.currentTarget) {
    event.preventDefault();
    }
  }

  function handleInput(event) {
    if ($isLinkMode) return;
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
      if (isEditing) {
        isEditing = false;
      } else {
        handleClick();
      }
    } else if (event.key === 'Escape' && isEditing) {
      isEditing = false;
      const store = getStoreByCellKey(cellKey);
      const currentCell = store.get(cellKey) || {};
      store.updateCell(cellKey, {
        ...currentCell,
        text: text, // Reset to original text
        state: text.trim() ? CELL_STATES.REGULAR : CELL_STATES.EMPTY
      });
    } else if (event.key === ' ' && !isEditing) {
      handleClick();
    }
  }

  function handleBlur(event) {
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
    // Stop event propagation to prevent the main click handler from firing
    if (event) event.stopPropagation();
    
    // Don't allow selection of empty cells in link mode
    if ($isLinkMode && !text.trim() && !linked) return;

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

<div
  tabindex="0"
  role="button"
  class={cellClass}
  data-cell-key={cellKey}
  style={`min-height: var(--cell-min-height, 32px); max-height: var(--cell-max-height, 48px); ${cellStyle}`}
  on:mouseover={!isGroupSelectionMode ? handleMouseEnter : undefined}
  on:mouseout={!isGroupSelectionMode ? handleMouseLeave : undefined}
  on:mousedown={!isGroupSelectionMode ? handleMouseDown : undefined}
  on:click={!isGroupSelectionMode ? handleClick : undefined}
  on:keydown={!isGroupSelectionMode ? handleKeyDown : undefined}
  on:focus={!isGroupSelectionMode ? handleMouseEnter : undefined}
  on:blur={!isGroupSelectionMode ? handleBlur : undefined}
  on:mouseenter={!isGroupSelectionMode ? () => setHoveredCol(col) : undefined}
  on:mouseleave={!isGroupSelectionMode ? () => setHoveredCol(null) : undefined}
  style:cursor={isGroupSelectionMode ? 'not-allowed' : undefined}
>
  {#if isTopCell && hoveredCol.value === col}
    <div class={cn(
      "absolute -top-8 left-0 w-full text-white py-[2px] rounded-none text-[0.9em] font-bold pointer-events-none z-20 box-border flex justify-center items-center",
      "bg-sky-800"
    )} style="background: var(--color-sky-800, #0369a1);">{col + 1}</div>
  {/if}
  {#if linked}
    <div class="absolute top-0 right-0 w-0 h-0 z-2" style="border-top: 1rem solid {groupColor}; border-left: 1rem solid transparent;"></div>
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
    />
  {:else if (state === CELL_STATES.EMPTY || (state === CELL_STATES.HOVER && text === '')) && !$selectedCells.has(cellKey)}
    <span class="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-[var(--cell-height)] text-center">---</span>
  {:else if state !== CELL_STATES.EMPTY && state !== 'group-highlight' && !(state === CELL_STATES.HOVER && text === '')}
    <span class="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-[var(--cell-height)] text-left">{text}</span>
  {/if}
</div>
