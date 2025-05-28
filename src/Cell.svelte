<script>
  import { createEventDispatcher } from 'svelte';
  import { CELL_STATES, COLORS } from './constants';
  import { getCellState, getBorderStyle, getPaddingStyle, getHoverBgColor } from './utils/cellUtils';
  import { renamingCell, selectedCells, leftTableStore, middleTableStore, mainTableStore } from './stores/tableStore';
  import { hoveredGroup } from './stores/hoverStore';

  const dispatch = createEventDispatcher();

  export let linked = false;         // Is this cell part of a group?
  export let state = CELL_STATES.EMPTY;        // 'empty', 'regular', 'hover', 'selected', 'hover-selected', 'renaming'
  export let groupName = '';         // Name of the group this cell belongs to (if any)
  export let groupColor = '';        // Color for this group (if any)
  export let text = '';              // Text inside the cell
  export let outFridge = false;      // Dashed border if true (default: false)
  export let cellKey = '';
  export let bgColor = '';

  let inputValue = '';               // Value for the renaming input field
  let inputEl;

  // Enforce that linked cells can never be empty
  $: if (linked && state === CELL_STATES.EMPTY) {
    state = CELL_STATES.REGULAR;
  }

  // Enforce that outFridge can never be true when state is empty
  $: outFridge = state === CELL_STATES.EMPTY ? false : outFridge;

  $: borderStyle = getBorderStyle(outFridge);
  $: paddingStyle = getPaddingStyle(linked);
  $: groupHover = linked && $hoveredGroup === groupName;
  $: hoverBgColor = getHoverBgColor(state, linked, groupHover);

  function handleMouseEnter() {
    if (state === CELL_STATES.EMPTY) {
      state = CELL_STATES.HOVER;
      return;
    }
    if (state === CELL_STATES.REGULAR) {
      state = CELL_STATES.HOVER;
    } else if (state === CELL_STATES.SELECTED) {
      state = CELL_STATES.HOVER_SELECTED;
    }
    if (linked) {
      hoveredGroup.set(groupName);
    }
  }

  function handleMouseLeave() {
    if (state === CELL_STATES.HOVER && text === '') {
      state = CELL_STATES.EMPTY;
      return;
    }
    if (state === CELL_STATES.HOVER) {
      state = CELL_STATES.REGULAR;
    } else if (state === CELL_STATES.HOVER_SELECTED) {
      state = CELL_STATES.SELECTED;
    }
    if (linked) {
      hoveredGroup.set(null);
    }
  }

  function handleMouseDown(event) {
    if (state === CELL_STATES.RENAMING) return;
    event.preventDefault();
    
    // If this is an empty cell, deselect all others first
    if (state === CELL_STATES.EMPTY || (state === CELL_STATES.HOVER && text === '')) {
      const selected = $selectedCells;
      selected.forEach(cellKey => {
        const [fridge] = cellKey.split('-');
        const store = fridge === 'left' ? leftTableStore : 
                     fridge === 'middle' ? middleTableStore : 
                     mainTableStore;
        store.updateCell(cellKey, { state: CELL_STATES.REGULAR });
      });
      selectedCells.set(new Set());
    }
    
    dispatch('startRenaming', { cellKey });
  }

  function handleClick() {
    if (state === CELL_STATES.RENAMING) return;

    // Empty cells can only be renamed, never selected
    if (state === CELL_STATES.EMPTY || (state === CELL_STATES.HOVER && text === '')) {
      selectedCells.set(new Set());  // Clear all selections
      dispatch('startRenaming', { cellKey });
      return;
    }

    // Get the appropriate store based on the cell key
    const [fridge] = cellKey.split('-');
    const store = fridge === 'left' ? leftTableStore : 
                 fridge === 'middle' ? middleTableStore : 
                 mainTableStore;
    
    // Only allow selection for non-empty, non-renaming cells
    if (state === CELL_STATES.HOVER || state === CELL_STATES.REGULAR) {
      state = CELL_STATES.SELECTED;
      store.updateCell(cellKey, { state: CELL_STATES.SELECTED });
      selectedCells.update(cells => {
        const newCells = new Set(cells);
        newCells.add(cellKey);
        return newCells;
      });
    } else if (state === CELL_STATES.HOVER_SELECTED || state === CELL_STATES.SELECTED) {
      state = CELL_STATES.REGULAR;
      store.updateCell(cellKey, { state: CELL_STATES.REGULAR });
      selectedCells.update(cells => {
        const newCells = new Set(cells);
        newCells.delete(cellKey);
        return newCells;
      });
    }
  }

  function handleKeyDown(event) {
    if (state === CELL_STATES.RENAMING) return;
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick();
    }
  }

  function handleInputSubmit() {
    if (inputValue.trim()) {
      text = inputValue.trim();
      state = CELL_STATES.REGULAR;
    } else {
      state = CELL_STATES.EMPTY;
    }
  }

  function handleInputKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default to avoid selection
      event.stopPropagation(); // Stop event from reaching parent div
      handleInputSubmit();
    } else if (event.key === 'Escape') {
      state = CELL_STATES.EMPTY;
    }
  }

  function handleWindowClick(event) {
    if (state === CELL_STATES.RENAMING) {
      // Check if click was inside THIS cell
      const cell = event.target.closest('.cell');
      if (cell && cell.getAttribute('data-cell-key') === cellKey) {
        return;
      }

      const [fridge] = cellKey.split('-');
      const store = fridge === 'left' ? leftTableStore : 
                   fridge === 'middle' ? middleTableStore : 
                   mainTableStore;
      
      handleInputSubmit();
      store.updateCell(cellKey, { text, state });
      dispatch('stopRenaming');
    }
  }

  $: if ($renamingCell === cellKey && (state === CELL_STATES.EMPTY || (state === CELL_STATES.HOVER && text === ''))) {
    if (state !== CELL_STATES.RENAMING) {
      state = CELL_STATES.RENAMING;
      inputValue = '';
    }
  } else if (state === CELL_STATES.RENAMING && $renamingCell !== cellKey) {
    dispatch('stopRenaming');
  }

  $: if (state === CELL_STATES.RENAMING && inputEl) {
    inputEl.focus();
  }
</script>

<svelte:window on:click={handleWindowClick}/>

<div
  tabindex="0"
  role="button"
  class="cell flex items-center w-full h-full relative text-left overflow-visible box-border border {borderStyle} {paddingStyle} {hoverBgColor}"
  data-cell-key={cellKey}
  class:border-slate-300={state === CELL_STATES.EMPTY || (state !== CELL_STATES.EMPTY && state !== CELL_STATES.HOVER && state !== CELL_STATES.HOVER_SELECTED && state !== CELL_STATES.RENAMING && state !== CELL_STATES.SELECTED && !outFridge)}
  class:border-slate-700={outFridge || state === CELL_STATES.SELECTED || state === CELL_STATES.HOVER_SELECTED}
  class:border-sky-600={state === CELL_STATES.HOVER || state === CELL_STATES.RENAMING}
  class:text-slate-500={state === CELL_STATES.EMPTY || outFridge}
  class:text-slate-700={state !== CELL_STATES.EMPTY && !outFridge}
  class:font-bold={(state === CELL_STATES.SELECTED || state === CELL_STATES.HOVER_SELECTED)}
  class:font-normal={!(state === CELL_STATES.SELECTED || state === CELL_STATES.HOVER_SELECTED)}
  class:italic={outFridge}
  style="{linked && state !== CELL_STATES.REGULAR ? `border-color: ${groupColor};` : ''} {groupColor ? `--hover-color: ${groupColor};` : ''}{hoverBgColor ? '' : ` background: ${bgColor};`}"
  on:mouseover={handleMouseEnter}
  on:mouseout={handleMouseLeave}
  on:mousedown={handleMouseDown}
  on:click={handleClick}
  on:keydown={handleKeyDown}
  on:focus={handleMouseEnter}
  on:blur={handleMouseLeave}
>
  {#if linked}
    <div class="absolute top-0 right-0 w-0 h-0 z-2" style="border-top: 1rem solid {groupColor}; border-left: 1rem solid transparent;"></div>
  {/if}
  {#if state === CELL_STATES.EMPTY || (state === CELL_STATES.HOVER && text === '')}
    <span class="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-[var(--cell-height)] text-center">---</span>
  {/if}
  {#if state === CELL_STATES.RENAMING}
    <input
      type="text"
      bind:value={inputValue}
      class="w-full h-full px-1 border-none focus:outline-none bg-transparent"
      on:blur={handleInputSubmit}
      on:keydown={handleInputKeydown}
      on:click|stopPropagation
      bind:this={inputEl}
    />
  {/if}
  {#if state !== CELL_STATES.EMPTY && state !== 'group-highlight' && state !== CELL_STATES.RENAMING && !(state === CELL_STATES.HOVER && text === '')}
    <span class="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-[var(--cell-height)] text-left">{text}</span>
  {/if}
</div>

<style>
  .cell {
    width: 100%;
    height: 100%;
    font-size: 12px;
  }
  .hover-bg {
    background-color: color-mix(in srgb, var(--hover-color) 20%, transparent);
  }
  .hover-bg-regular {
    background-color: color-mix(in srgb, var(--color-sky-600) 20%, transparent);
  }
</style>
