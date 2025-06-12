<script>
  import { leftTableStore, middleTableStore, mainTableStore, getCellGroups, selectedGroup, isLinkMode } from '../../stores/tableStore';
  import linked from '../icons/linked.svelte';
  import { GROUP_COLOR_HEX } from '../../constants';
  import Button from '../common/Button.svelte';
  import rename from '../icons/rename.svelte';
  import unlink from '../icons/unlink.svelte';
  import erase from '../icons/erase.svelte';
  import { onMount } from 'svelte';
  import { CELL_STATES } from '../../constants';

  let showDropdown = false;
  let cellGroups = {};
  let renamingGroup = false;
  let renameValue = '';
  let renameInput;

  // Update cellGroups reactively
  $: cellGroups = getCellGroups($leftTableStore ?? {}, $middleTableStore ?? {}, $mainTableStore ?? {});

  function getGroupColor(color) {
    if (!color) return '#cbd5e1';
    return GROUP_COLOR_HEX[color] || color;
  }

  function selectGroup(groupName) {
    if (groupName === 'linked-plates' || $selectedGroup === groupName) {
      selectedGroup.set(null);
      showDropdown = false;
      return;
    }
    selectedGroup.set(groupName);
    showDropdown = false;
  }

  function handleDropdownToggle() {
    if (Object.keys(cellGroups).length === 0) return;
    showDropdown = !showDropdown;
  }

  // Clear selected group when no groups exist
  $: if (Object.keys(cellGroups).length === 0) {
    selectedGroup.set(null);
  }

  function startRename() {
    if ($selectedGroup && cellGroups[$selectedGroup]) {
      renamingGroup = true;
      renameValue = $selectedGroup;
      setTimeout(() => {
        if (renameInput) {
          renameInput.focus();
          renameInput.select();
        }
      }, 0);
    }
  }

  function handleRenameInput(e) {
    renameValue = e.target.value;
  }

  function finishRename() {
    const oldName = $selectedGroup;
    const newName = renameValue.trim();
    if (!newName || newName === oldName) {
      renamingGroup = false;
      return;
    }
    // Update all cells in all stores
    const allStores = [
      { store: leftTableStore, data: $leftTableStore },
      { store: middleTableStore, data: $middleTableStore },
      { store: mainTableStore, data: $mainTableStore }
    ];
    allStores.forEach(({ store, data }) => {
      Object.entries(data).forEach(([key, cell]) => {
        if (cell.groupName === oldName) {
          store.updateCell(key, {
            ...cell,
            groupName: newName
          });
        }
      });
    });
    selectedGroup.set(null);
    renamingGroup = false;
    showDropdown = false;
  }

  function unlinkAllInGroup() {
    const group = $selectedGroup;
    if (!group) return;
    const allStores = [
      { store: leftTableStore, data: $leftTableStore },
      { store: middleTableStore, data: $middleTableStore },
      { store: mainTableStore, data: $mainTableStore }
    ];
    allStores.forEach(({ store, data }) => {
      Object.entries(data).forEach(([key, cell]) => {
        if (cell.groupName === group) {
          store.updateCell(key, {
            ...cell,
            linked: false,
            groupName: '',
            groupColor: ''
          });
        }
      });
    });
    selectedGroup.set(null);
    showDropdown = false;
  }

  function deleteAllInGroup() {
    const group = $selectedGroup;
    if (!group) return;
    const allStores = [
      { store: leftTableStore, data: $leftTableStore },
      { store: middleTableStore, data: $middleTableStore },
      { store: mainTableStore, data: $mainTableStore }
    ];
    allStores.forEach(({ store, data }) => {
      Object.entries(data).forEach(([key, cell]) => {
        if (cell.groupName === group) {
          store.updateCell(key, {
            text: '',
            linked: false,
            groupName: '',
            groupColor: '',
            outFridge: false,
            state: CELL_STATES.EMPTY
          });
        }
      });
    });
    selectedGroup.set(null);
    showDropdown = false;
  }
</script>

<div class="flex items-center gap-3">
  <span class="font-bold text-sky-800 text-lg select-none inline-block">
    Groups:
  </span>
  <div class="relative group-dropdown">
    <button
      class="flex items-center gap-2 border rounded px-2 py-1 bg-white min-w-[160px] hover:bg-slate-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      on:click={handleDropdownToggle}
      type="button"
      disabled={Object.keys(cellGroups).length === 0 || $isLinkMode}
    >
      {#if $selectedGroup && cellGroups[$selectedGroup]}
        {#if renamingGroup}
          <span class="w-5 h-5 rounded inline-block border border-slate-300 mr-1" style="background-color: {getGroupColor(cellGroups[$selectedGroup].color)}"></span>
          <input
            bind:this={renameInput}
            class="px-0.5 py-0.5 w-28 text-sm font-normal outline-none bg-transparent"
            style="border: none; box-shadow: none; font-size: 1rem; min-width: 80px; max-width: 160px;"
            value={renameValue}
            on:input={handleRenameInput}
            on:keydown={(e) => e.key === 'Enter' && finishRename()}
            on:blur={finishRename}
          />
        {:else}
          <span class="w-5 h-5 rounded inline-block border border-slate-300 mr-1" style="background-color: {getGroupColor(cellGroups[$selectedGroup].color)}"></span>
          <span>{$selectedGroup}</span>
        {/if}
      {:else}
        <svelte:component this={linked} class="w-5 h-5 text-sky-500" />
        <span class="text-slate-500">Linked plates</span>
      {/if}
      <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
    </button>
    {#if showDropdown}
      <div
        role="menu"
        tabindex="0"
        class="absolute left-0 mt-1 w-full bg-white border border-slate-200 rounded shadow z-10 py-2 max-h-60 overflow-auto"
        on:click|self={() => showDropdown = false}
        on:keydown={(e) => e.key === 'Escape' && (showDropdown = false)}
      >
        <div
          role="menuitem"
          tabindex="0"
          class="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-slate-100 w-full text-left"
          on:click={() => selectGroup('linked-plates')}
          on:keydown={(e) => e.key === 'Enter' && selectGroup('linked-plates')}
        >
          <svelte:component this={linked} class="w-5 h-5 text-sky-500" />
          <span class="text-slate-500">Linked plates</span>
        </div>
        {#each Object.entries(cellGroups) as [groupName, group]}
          <div
            role="menuitem"
            tabindex="0"
            class="flex items-center gap-2 px-3 py-1 cursor-pointer hover:bg-slate-100 w-full text-left"
            on:click={() => selectGroup(groupName)}
            on:keydown={(e) => e.key === 'Enter' && selectGroup(groupName)}
          >
            <span class="w-5 h-5 rounded border border-slate-300" style="background-color: {getGroupColor(group.color)}"></span>
            <span>{groupName}</span>
          </div>
        {/each}
        {#if Object.keys(cellGroups).length === 0}
          <div class="px-3 py-1 text-slate-400">No groups</div>
        {/if}
      </div>
    {/if}
  </div>
  <Button 
      icon={rename} 
      color="purple"
      disabled={!$selectedGroup || $isLinkMode}
      on:click={startRename}
    />
    <Button 
      icon={unlink} 
      color="orange"
      disabled={!$selectedGroup || $isLinkMode}
      on:click={unlinkAllInGroup}
    />
    <Button 
      icon={erase} 
      color="red"
      disabled={!$selectedGroup || $isLinkMode}
      on:click={deleteAllInGroup}
    />
</div> 