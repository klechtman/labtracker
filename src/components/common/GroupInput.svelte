<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import X from '../icons/X.svelte';
  import { INPUT_BASE_CLASS, INPUT_STYLE_MAP } from '../../constants/inputStyles';
  import { GROUP_COLOR_HEX } from '../../constants';

  const dispatch = createEventDispatcher();

  export let value = '';
  export let placeholder = 'No group selected';
  export let disabled = false;
  export let groups = {};
  export let isLinkMode = false;
  export let extraClasses = '';
  export let iconColor = '#cbd5e1';

  let showDropdown = false;
  let isRenaming = false;
  let renameValue = '';
  let renameInput;
  let renameHover = false;

  function getGroupColor(c) {
    if (!c) return '#cbd5e1';
    return GROUP_COLOR_HEX[c] || c;
  }

  function openDropdown() {
    if (Object.keys(groups).length === 0 || isLinkMode || isRenaming) return;
    showDropdown = true;
  }
  function closeDropdown() { showDropdown = false; }
  function toggleDropdown() {
    if (Object.keys(groups).length === 0 || isLinkMode || isRenaming) return;
    showDropdown = !showDropdown;
  }

  function startRename() {
    if (disabled || !value || !groups[value]) return;
    isRenaming = true;
    renameValue = value;
    setTimeout(() => {
      if (renameInput) {
        renameInput.focus();
        renameInput.select();
      }
    }, 0);
  }
  function finishRename() {
    const newName = renameValue.trim();
    if (!newName || newName === value) {
      isRenaming = false;
      renameHover = false;
      return;
    }
    dispatch('rename', { oldName: value, newName });
    isRenaming = false;
    renameHover = false;
  }
  function cancelRename() {
    isRenaming = false;
    renameValue = '';
    renameHover = false;
  }
  function handleRenameInput(e) { renameValue = e.target.value; }
  function handleRenameKeydown(e) {
    if (e.key === 'Enter') finishRename();
    if (e.key === 'Escape') cancelRename();
  }
  function handleRenameBlur() { finishRename(); }

  function handleDropdownKeydown(e) {
    if (e.key === 'Escape') closeDropdown();
    if (e.key === 'Enter' || e.key === ' ') toggleDropdown();
  }
  function handleTriggerClick(e) {
    if (!e.target.classList.contains('rename-area')) toggleDropdown();
  }
  function handleTriggerKeydown(e) {
    if (!e.target.classList.contains('rename-area')) {
      if (e.key === ' ' || e.key === 'Enter') toggleDropdown();
    }
  }
  function handleRenameAreaClick(e) { startRename(); }
  function handleRenameAreaKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') startRename();
  }
  function handleDeselect(e) {
    e.stopPropagation();
    dispatch('deselect');
    closeDropdown();
  }
  function selectGroup(groupName) {
    if (groupName === 'linked-plates') {
      dispatch('select', null);
      closeDropdown();
      return;
    }
    if (value === groupName) {
      closeDropdown();
      return;
    }
    dispatch('select', groupName);
    closeDropdown();
  }
</script>

<div class="relative group-dropdown">
  <div
    {...(!isRenaming ? { role: 'button', tabindex: '0' } : {})}
    class={[
      ...INPUT_BASE_CLASS,
      ...INPUT_STYLE_MAP.inputDefault,
      ...(isRenaming
        ? INPUT_STYLE_MAP.focus
        : []),
      ...(isRenaming
        ? INPUT_STYLE_MAP.hover
        : (renameHover ? [] : INPUT_STYLE_MAP.buttonHover)),
      disabled ? INPUT_STYLE_MAP.disabled.join(' ') : '',
      extraClasses,
      renameHover ? 'hover:bg-sky-100' : ''
    ].join(' ')}
    aria-disabled={Object.keys(groups).length === 0 || isLinkMode}
    on:click={handleTriggerClick}
    on:mousedown|stopPropagation
    on:keydown={handleTriggerKeydown}
  >
    <span
      class="w-5 h-5 rounded border border-slate-300 flex-shrink-0"
      style="background-color: {value ? getGroupColor(groups[value]?.color) : iconColor};"
    ></span>
    <span class="flex-1 min-w-0 text-left">
      {#if isRenaming}
        <input
          bind:this={renameInput}
          class="w-full h-full bg-transparent border-none outline-none p-0"
          value={renameValue}
          on:input={handleRenameInput}
          on:keydown={handleRenameKeydown}
          on:blur={handleRenameBlur}
        />
      {:else if value && groups[value]}
        <span
          class="rename-area cursor-text"
          role="button"
          tabindex="-1"
          on:mouseenter={() => renameHover = true}
          on:mouseleave={() => renameHover = false}
          on:mousedown|preventDefault
          on:mousedown|stopPropagation={handleRenameAreaClick}
          on:keydown|stopPropagation={handleRenameAreaKeydown}
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
          <X className="w-4 h-4 text-slate-600"/>
        </span>
      {/if}
      <svg class="w-4 h-4 ml-1 flex-shrink-0 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
  {#if showDropdown}
    <div
      role="menu"
      tabindex="0"
      class="absolute left-0 mt-1 w-[200px] bg-white border border-slate-200 rounded shadow z-10 py-2 max-h-60 overflow-auto"
      on:click|self={closeDropdown}
      on:keydown={handleDropdownKeydown}
    >
      <div
        role="menuitem"
        tabindex="0"
        class="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-slate-100 w-full text-left"
        on:click={() => selectGroup('linked-plates')}
        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectGroup('linked-plates')}
      >
        <span class="w-5 h-5 rounded border border-slate-300 flex-shrink-0" style="background-color: #cbd5e1;"></span>
        <span class="text-slate-500 truncate">No group selected</span>
      </div>
      {#each Object.entries(groups) as [groupName, group]}
        <div
          role="menuitem"
          tabindex="0"
          class="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-slate-100 w-full text-left"
          on:click={() => selectGroup(groupName)}
          on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectGroup(groupName)}
        >
          <span class="w-5 h-5 rounded border border-slate-300 flex-shrink-0" style="background-color: {getGroupColor(group.color)}"></span>
          <span class="truncate">{groupName}</span>
        </div>
      {/each}
      {#if Object.keys(groups).length === 0}
        <div class="px-3 py-1 text-slate-400">No groups</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .rename-area {
    cursor: text;
    user-select: none;
  }
</style> 