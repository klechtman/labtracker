<script>
  import { createEventDispatcher, getContext } from 'svelte';
  import { CELL_STATES, COLORS } from '../constants';
  import { renamingCell, selectedCells, leftTableStore, middleTableStore, mainTableStore } from '../stores/tableStore';
  import { hoveredGroup } from '../stores/hoverStore';
  import { cn } from '../lib/utils';

  const dispatch = createEventDispatcher();

  const hoveredCol = getContext('hoveredCol');
  const setHoveredCol = getContext('setHoveredCol');

  export let linked = false;         // Is this cell part of a group?
  export let state = CELL_STATES.EMPTY;        // 'empty', 'regular', 'hover', 'selected', 'hover-selected', 'renaming'
  export let groupName = '';         // Name of the group this cell belongs to (if any)
  export let groupColor = '';        // Color for this group (if any)
  export let text = '';              // Text inside the cell
  export let outFridge = false;      // Dashed border if true (default: false)
  export let cellKey = '';
  export let bgColor = '';
  export let isTopCell = false;
  export let col = null;

  let inputValue = '';               // Value for the renaming input field
  let inputEl;

  // Enforce that linked cells can never be empty
  $: if (linked && state === CELL_STATES.EMPTY) {
    state = CELL_STATES.REGULAR;
  }

  // Enforce that outFridge can never be true when state is empty
  $: outFridge = state === CELL_STATES.EMPTY ? false : outFridge;

  $: groupHover = linked && $hoveredGroup === groupName;

  // Helper to get the correct store by cellKey
  function getStoreByCellKey(cellKey) {
    const [fridge] = cellKey.split('-');
    return fridge === 'left' ? leftTableStore : fridge === 'middle' ? middleTableStore : mainTableStore;
  }

  // Use local state for internal logic
  let localState = state;

  // Keep local text for renaming
  let localText = text;

  // Derived outFridge value
  $: effectiveOutFridge = localState === CELL_STATES.EMPTY ? false : outFridge;

  // Keep localState in sync with prop/state changes
  $: if (state !== localState) localState = state;
  $: if (text !== localText) localText = text;

  // --- Cell class logic ---
  $: cellClass = cn(
    'cell flex items-center w-full h-full min-h-[32px] max-h-[48px] min-w-0 relative text-left overflow-visible box-border border',
    {
      'border-dashed': effectiveOutFridge,
      'border-solid': !effectiveOutFridge,
      'px-2': linked,
      'px-1.5': !linked,
      'border-slate-300': localState === CELL_STATES.EMPTY || (localState !== CELL_STATES.EMPTY && localState !== CELL_STATES.HOVER && localState !== CELL_STATES.HOVER_SELECTED && localState !== CELL_STATES.RENAMING && localState !== CELL_STATES.SELECTED && !effectiveOutFridge),
      'border-slate-700': effectiveOutFridge || localState === CELL_STATES.SELECTED || localState === CELL_STATES.HOVER_SELECTED,
      'border-sky-600': localState === CELL_STATES.HOVER || localState === CELL_STATES.RENAMING,
      'text-slate-500': localState === CELL_STATES.EMPTY || effectiveOutFridge,
      'text-slate-700': localState !== CELL_STATES.EMPTY && !effectiveOutFridge,
      'font-bold': localState === CELL_STATES.SELECTED || localState === CELL_STATES.HOVER_SELECTED,
      'font-normal': !(localState === CELL_STATES.SELECTED || localState === CELL_STATES.HOVER_SELECTED),
      'italic': effectiveOutFridge,
      'bg-sky-200': !linked && (localState === CELL_STATES.HOVER || localState === CELL_STATES.HOVER_SELECTED || localState === CELL_STATES.RENAMING)
    }
  );

  // --- Cell style logic ---
  const GROUP_COLOR_HEX = {
    'group-green': '#10b981',
    'group-yellow': '#f59e0b',
    'group-indigo': '#6366f1',
    'group-pink': '#ec4899',
    'group-purple': '#8b5cf6',
  };
  function getGroupColorHex(colorName) {
    return GROUP_COLOR_HEX[colorName] || colorName;
  }
  $: cellStyle = (() => {
    let style = '';
    const groupColorHex = getGroupColorHex(groupColor);
    if (linked && (localState === CELL_STATES.HOVER || localState === CELL_STATES.HOVER_SELECTED || localState === CELL_STATES.RENAMING || groupHover)) {
      style += `background-color: color-mix(in srgb, ${groupColorHex} 15%, white);`;
    } else if (!linked && (localState === CELL_STATES.HOVER || localState === CELL_STATES.HOVER_SELECTED || localState === CELL_STATES.RENAMING)) {
      // Do not set background, let Tailwind class apply
    } else {
      style += ` background: ${bgColor};`;
    }
    if (linked && localState !== CELL_STATES.REGULAR) {
      style += `border-color: ${groupColorHex};`;
    }
    if (groupColorHex) {
      style += `--hover-color: ${groupColorHex}`;
    }
    return style;
  })();

  // --- State transition helpers ---
  function setState(newState) {
    localState = newState;
    const store = getStoreByCellKey(cellKey);
    store.updateCell(cellKey, { state: newState });
  }
  function setText(newText) {
    localText = newText;
    const store = getStoreByCellKey(cellKey);
    store.updateCell(cellKey, { text: newText });
  }

  function handleMouseEnter() {
    if (localState === CELL_STATES.EMPTY) {
      setState(CELL_STATES.HOVER);
      return;
    }
    if (localState === CELL_STATES.REGULAR) {
      setState(CELL_STATES.HOVER);
    } else if (localState === CELL_STATES.SELECTED) {
      setState(CELL_STATES.HOVER_SELECTED);
    }
    if (linked) {
      hoveredGroup.set(groupName);
    }
  }

  function handleMouseLeave() {
    if (localState === CELL_STATES.HOVER && localText === '') {
      setState(CELL_STATES.EMPTY);
      return;
    }
    if (localState === CELL_STATES.HOVER) {
      setState(CELL_STATES.REGULAR);
    } else if (localState === CELL_STATES.HOVER_SELECTED) {
      setState(CELL_STATES.SELECTED);
    }
    if (linked) {
      hoveredGroup.set(null);
    }
  }

  function handleMouseDown(event) {
    if (localState === CELL_STATES.RENAMING) return;
    event.preventDefault();
    // If this is an empty cell, deselect all others first
    if (localState === CELL_STATES.EMPTY || (localState === CELL_STATES.HOVER && localText === '')) {
      const selected = $selectedCells;
      selected.forEach(cellKey => {
        const store = getStoreByCellKey(cellKey);
        store.updateCell(cellKey, { state: CELL_STATES.REGULAR });
      });
      selectedCells.set(new Set());
    }
    dispatch('startRenaming', { cellKey });
  }

  function handleClick() {
    if (localState === CELL_STATES.RENAMING) return;
    // Empty cells can only be renamed, never selected
    if (localState === CELL_STATES.EMPTY || (localState === CELL_STATES.HOVER && localText === '')) {
      selectedCells.set(new Set());  // Clear all selections
      dispatch('startRenaming', { cellKey });
      return;
    }
    const store = getStoreByCellKey(cellKey);
    // Only allow selection for non-empty, non-renaming cells
    if (localState === CELL_STATES.HOVER || localState === CELL_STATES.REGULAR) {
      setState(CELL_STATES.SELECTED);
      selectedCells.update(cells => {
        const newCells = new Set(cells);
        newCells.add(cellKey);
        return newCells;
      });
    } else if (localState === CELL_STATES.HOVER_SELECTED || localState === CELL_STATES.SELECTED) {
      setState(CELL_STATES.REGULAR);
      selectedCells.update(cells => {
        const newCells = new Set(cells);
        newCells.delete(cellKey);
        return newCells;
      });
    }
  }

  function handleKeyDown(event) {
    if (localState === CELL_STATES.RENAMING) return;
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick();
    }
  }

  function handleInputSubmit() {
    if (inputValue.trim()) {
      setText(inputValue.trim());
      setState(CELL_STATES.REGULAR);
    } else {
      setState(CELL_STATES.EMPTY);
    }
  }

  function handleInputKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default to avoid selection
      event.stopPropagation(); // Stop event from reaching parent div
      handleInputSubmit();
    } else if (event.key === 'Escape') {
      setState(CELL_STATES.EMPTY);
    }
  }

  function handleWindowClick(event) {
    if (localState === CELL_STATES.RENAMING) {
      // Check if click was inside THIS cell
      const cell = event.target.closest('.cell');
      if (cell && cell.getAttribute('data-cell-key') === cellKey) {
        return;
      }
      handleInputSubmit();
      dispatch('stopRenaming');
    }
  }

  $: if ($renamingCell === cellKey && (localState === CELL_STATES.EMPTY || (localState === CELL_STATES.HOVER && localText === ''))) {
    if (localState !== CELL_STATES.RENAMING) {
      setState(CELL_STATES.RENAMING);
      inputValue = '';
    }
  } else if (localState === CELL_STATES.RENAMING && $renamingCell !== cellKey) {
    dispatch('stopRenaming');
  }

  $: if (localState === CELL_STATES.RENAMING && inputEl) {
    inputEl.focus();
  }
</script>

<svelte:window on:click={handleWindowClick}/>

<div
  tabindex="0"
  role="button"
  class={cellClass}
  data-cell-key={cellKey}
  style={`min-height: var(--cell-min-height, 32px); max-height: var(--cell-max-height, 48px); ${cellStyle}`}
  on:mouseover={handleMouseEnter}
  on:mouseout={handleMouseLeave}
  on:mousedown={handleMouseDown}
  on:click={handleClick}
  on:keydown={handleKeyDown}
  on:focus={handleMouseEnter}
  on:blur={handleMouseLeave}
  on:mouseenter={() => setHoveredCol(col)}
  on:mouseleave={() => setHoveredCol(null)}
>
  {#if isTopCell && $hoveredCol === col}
    <div class={cn(
      "absolute -top-8 left-0 w-full text-white py-[2px] rounded-none text-[0.9em] font-bold pointer-events-none z-20 box-border flex justify-center items-center",
      "bg-sky-800"
    )} style="background: var(--color-sky-800, #0369a1);">{col + 1}</div>
  {/if}
  {#if linked}
    <div class="absolute top-0 right-0 w-0 h-0 z-2" style="border-top: 1rem solid {groupColor}; border-left: 1rem solid transparent;"></div>
  {/if}
  {#if localState === CELL_STATES.EMPTY || (localState === CELL_STATES.HOVER && localText === '')}
    <span class="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-[var(--cell-height)] text-center">---</span>
  {/if}
  {#if localState === CELL_STATES.RENAMING}
    <input
      type="text"
      bind:value={inputValue}
      class={cn(
        "w-full h-full px-1 border-none focus:outline-none bg-transparent"
      )}
      on:blur={handleInputSubmit}
      on:keydown={handleInputKeydown}
      on:click|stopPropagation
      bind:this={inputEl}
    />
  {/if}
  {#if localState !== CELL_STATES.EMPTY && localState !== 'group-highlight' && localState !== CELL_STATES.RENAMING && !(localState === CELL_STATES.HOVER && localText === '')}
    <span class="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-[var(--cell-height)] text-left">{localText}</span>
  {/if}
</div>
