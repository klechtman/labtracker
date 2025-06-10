<script>
  import { createEventDispatcher, getContext } from 'svelte';
  import { CELL_STATES, GROUP_COLOR_HEX } from '../constants';
  import { selectedCells, leftTableStore, middleTableStore, mainTableStore } from '../stores/tableStore';
  import { hoveredGroup } from '../stores/hoverStore';
  import { cn } from '../lib/utils';
  import { updateCellName, getStoreByCellKey, getCellClass, getCellStyle } from '../utils/cellUtils';

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

  // Enforce that linked cells can never be empty
  $: if (linked && state === CELL_STATES.EMPTY) {
    state = CELL_STATES.REGULAR;
  }

  // Enforce that outFridge can never be true when state is empty
  $: outFridge = state === CELL_STATES.EMPTY ? false : outFridge;

  // Enforce that empty cells can never be linked
  $: if (!text.trim() && linked) {
    const store = getStoreByCellKey(cellKey);
    store.updateCell(cellKey, { linked: false, groupName: '', groupColor: '' });
  }

  $: groupHover = linked && $hoveredGroup === groupName;

  // Ensure empty cells stay empty when they have no text
  $: if (!text.trim() && state !== CELL_STATES.EMPTY && state !== CELL_STATES.HOVER) {
    setState(CELL_STATES.EMPTY);
  }

  // Get cell class and style using utility functions
  $: cellClass = getCellClass({ state, linked, outFridge, groupHover, isSelected: $selectedCells.has(cellKey) });
  $: cellStyle = getCellStyle({ state, linked, groupHover, groupColor, bgColor, isSelected: $selectedCells.has(cellKey) });

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
    event.preventDefault();
  }

  function handleClick() {
    if (state === CELL_STATES.EMPTY || (state === CELL_STATES.HOVER && !text.trim())) {
      const selected = $selectedCells;
      selected.forEach(cellKey => {
        const store = getStoreByCellKey(cellKey);
        store.updateCell(cellKey, { state: CELL_STATES.REGULAR });
      });
      selectedCells.set(new Set([cellKey]));
      // Focus the input after a short delay to ensure the DOM has updated
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]');
        if (input) input.focus();
      }, 0);
      return;
    }

    if ($selectedCells.has(cellKey)) {
      selectedCells.update(cells => {
        const newCells = new Set(cells);
        newCells.delete(cellKey);
        return newCells;
      });
      return;
    }

    selectedCells.update(cells => {
      const newCells = new Set(
        Array.from(cells).filter(key => {
          const store = getStoreByCellKey(key);
          const cell = store.get(key) || {};
          return cell.text && cell.text.trim();
        })
      );
      newCells.add(cellKey);
      return newCells;
    });
    
    // Focus the input after a short delay to ensure the DOM has updated
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]');
      if (input) input.focus();
    }, 0);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      handleClick();
    }
  }
</script>

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
  {#if (state === CELL_STATES.EMPTY || (state === CELL_STATES.HOVER && text === '')) && !$selectedCells.has(cellKey)}
    <span class="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-[var(--cell-height)] text-center">---</span>
  {/if}
  {#if state !== CELL_STATES.EMPTY && state !== 'group-highlight' && !(state === CELL_STATES.HOVER && text === '')}
    <span class="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-[var(--cell-height)] text-left">{text}</span>
  {/if}
</div>
