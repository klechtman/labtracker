<script>
  import { createEventDispatcher } from 'svelte';
  import X from '../icons/X.svelte';
  import { INPUT_BASE_CLASS, INPUT_STYLE_MAP } from '../../constants/inputStyles';

  const dispatch = createEventDispatcher();

  export let type = 'button'; // 'input' or 'button'
  export let value = '';
  export let placeholder = '';
  export let disabled = false;
  export let iconColor = '#cbd5e1';
  export let extraClasses = '';
  export let showDropdown = false;
  export let renameHover = false;
  export let isRenaming = false;
  export let renameValue = '';
  export let renameInput;
  export let ignoreNextBlur = false;

  function getInputClasses() {
    let classes = [...INPUT_BASE_CLASS];
    
    if (isRenaming) {
      classes = classes.concat(INPUT_STYLE_MAP.input);
    } else {
      classes = classes.concat(INPUT_STYLE_MAP.button);
      if (renameHover) {
        classes = classes.concat(INPUT_STYLE_MAP.renameHover);
      }
    }
    
    if (disabled) {
      classes = classes.concat(INPUT_STYLE_MAP.disabled);
    }
    
    if (extraClasses) {
      classes.push(extraClasses);
    }
    
    return classes.join(' ');
  }

  function handleInput(e) {
    dispatch('input', e);
  }

  function handleKeydown(e) {
    if (isRenaming) {
      if (e.key === 'Enter') {
        dispatch('finishRename');
      } else if (e.key === 'Escape') {
        dispatch('cancelRename');
      }
    } else {
      dispatch('keydown', e);
    }
  }

  function handleBlur(e) {
    dispatch('blur', e);
  }

  function handleClick(e) {
    dispatch('click', e);
  }

  function handleMousedown(e) {
    dispatch('mousedown', e);
  }

  function handleRenameClick(e) {
    dispatch('renameClick', e);
  }

  function handleRenameKeydown(e) {
    dispatch('renameKeydown', e);
  }

  function handleRenameMouseenter() {
    dispatch('renameMouseenter');
  }

  function handleRenameMouseleave() {
    dispatch('renameMouseleave');
  }

  function handleDeselect(e) {
    dispatch('deselect', e);
  }
</script>

<div class={getInputClasses()}>
  <!-- Icon/Color Square -->
  <span
    class="w-5 h-5 rounded border border-slate-300 flex-shrink-0"
    style="background-color: {iconColor};"
  ></span>

  {#if isRenaming}
    <input
      bind:this={renameInput}
      class="w-full h-full bg-transparent border-none outline-none p-0"
      value={renameValue}
      on:input={handleInput}
      on:keydown={handleKeydown}
      on:blur={handleBlur}
    />
  {:else}
    <div
      role="button"
      tabindex="0"
      class="w-full h-full flex items-center justify-between bg-transparent border-none outline-none p-0"
      class:cursor-not-allowed={disabled}
      aria-disabled={disabled}
      on:click={handleClick}
      on:mousedown={handleMousedown}
      on:keydown={handleKeydown}
    >
      <span class="flex-1 min-w-0 text-left">
        {#if value}
          <span
            class="rename-area cursor-text"
            role="button"
            tabindex="-1"
            on:mouseenter={handleRenameMouseenter}
            on:mouseleave={handleRenameMouseleave}
            on:click|stopPropagation={handleRenameClick}
            on:keydown|stopPropagation={handleRenameKeydown}
            title="Click to rename group"
          >
            <span class="truncate">{value}</span>
          </span>
        {:else}
          <span class="text-slate-500 truncate">{placeholder}</span>
        {/if}
      </span>

      <div class="flex items-center">
        {#if value}
          <span
            role="button"
            tabindex="0"
            class="p-0.5 rounded hover:bg-slate-200"
            on:click|stopPropagation={handleDeselect}
            on:keydown|stopPropagation={(e) => { if(e.key === ' ' || e.key === 'Enter') handleDeselect(e) }}
            title="Deselect group"
          >
            <X class="w-4 h-4 text-slate-600"/>
          </span>
        {/if}

        <svg class="w-4 h-4 ml-1 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  {/if}
</div>

<style>
  .rename-area {
    cursor: text;
    user-select: none;
  }
</style> 