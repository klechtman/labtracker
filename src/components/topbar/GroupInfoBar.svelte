<script>
  import X from '../icons/X.svelte';
  import { leftTableStore, middleTableStore, mainTableStore, getCellGroups, selectedGroup, isLinkMode } from '../../stores/tableStore';
  import linked from '../icons/linked.svelte';
  import { GROUP_COLOR_HEX } from '../../constants';
  import Button from '../common/Button.svelte';
  import InputField from '../common/InputField.svelte';
  import unlink from '../icons/unlink.svelte';
  import erase from '../icons/erase.svelte';
  import { onMount } from 'svelte';
  import { CELL_STATES } from '../../constants';
  import { clickOutside } from '../../lib/clickOutside.js';
  import Modal from '../common/Modal.svelte';
  import check from '../icons/check.svelte';
  import { unlinkAllInGroup, deleteAllInGroup } from '../../logic/groupLogic';

  let showDropdown = false;
  let cellGroups = {};
  let renameValue = '';
  let renameInput;
  let ignoreNextBlur = false;
  let showGroupActionModal = false;
  let groupActionType = null; // 'unlink' or 'delete'
  let renamingGroupBar = false;
  let renameHover = false;

  // Update cellGroups reactively
  $: cellGroups = getCellGroups($leftTableStore ?? {}, $middleTableStore ?? {}, $mainTableStore ?? {});

  // Watch for link mode changes
  $: if ($isLinkMode && $selectedGroup) {
    // When entering link mode, ensure the current group is selected
    selectedGroup.set($selectedGroup);
  }

  function getGroupColor(color) {
    if (!color) return '#cbd5e1';
    return GROUP_COLOR_HEX[color] || color;
  }

  function selectGroup(groupName) {
    if (groupName === 'linked-plates') {
      selectedGroup.set(null);
      showDropdown = false;
      return;
    }
    // If clicking the same group, just close the dropdown
    if ($selectedGroup === groupName) {
      showDropdown = false;
      return;
    }
    selectedGroup.set(groupName);
    showDropdown = false;
  }

  function handleDropdownToggle() {
    if (Object.keys(cellGroups).length === 0 || renamingGroupBar) return;
    showDropdown = !showDropdown;
  }

  // Clear selected group when no groups exist
  $: if (Object.keys(cellGroups).length === 0) {
    selectedGroup.set(null);
  }

  function startRenameBar() {
    if ($selectedGroup && cellGroups[$selectedGroup]) {
      renamingGroupBar = true;
      renameValue = $selectedGroup;
      setTimeout(() => {
        if (renameInput) {
          renameInput.focus();
          renameInput.select();
        }
      }, 0);
    }
  }

  function handleRenameBarInput(e) {
    renameValue = e.target.value;
  }

  function handleRenameBarBlur() {
    finishRenameBar();
  }

  function finishRenameBar() {
    const oldName = $selectedGroup;
    const newName = renameValue.trim();
    if (!newName || newName === oldName) {
      renamingGroupBar = false;
      renameHover = false;
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
    selectedGroup.set(newName);
    renamingGroupBar = false;
    renameHover = false;
  }

  function cancelRenameBar() {
    renamingGroupBar = false;
    renameValue = '';
    renameHover = false;
  }

  function deselectGroup(e) {
    e.stopPropagation();
    selectedGroup.set(null);
    showDropdown = false; // Also close dropdown if it's open
  }

  function handleGroupAction() {
    if (groupActionType === 'unlink') {
      unlinkAllInGroup(
        $selectedGroup,
        $leftTableStore,
        $middleTableStore,
        $mainTableStore,
        renamingGroupBar,
        selectedGroup,
        (v) => { showDropdown = v; }
      );
    } else if (groupActionType === 'delete') {
      deleteAllInGroup(
        $selectedGroup,
        $leftTableStore,
        $middleTableStore,
        $mainTableStore,
        renamingGroupBar,
        selectedGroup,
        (v) => { showDropdown = v; }
      );
    }
    showGroupActionModal = false;
    groupActionType = null;
  }
</script>

<div class="flex items-center gap-3">
  <span class="font-title text-sky-800 select-none inline-block">
    Groups:
  </span>
  <div class="relative group-dropdown">
    {#if renamingGroupBar}
       <div
        class="relative flex items-center gap-2 border rounded px-2 py-1 bg-sky-100 w-[200px] h-[34px] ring-2 ring-sky-400"
      >
        <span
          class="w-5 h-5 rounded border border-slate-300 flex-shrink-0"
          style="background-color: {getGroupColor(cellGroups[$selectedGroup].color)};"
        ></span>
        <input
          bind:this={renameInput}
          class="w-full h-full bg-transparent border-none outline-none p-0"
          value={renameValue}
          on:input={handleRenameBarInput}
          on:keydown={(e) => {
              if (e.key === 'Enter') finishRenameBar();
              if (e.key === 'Escape') cancelRenameBar();
          }}
          on:blur={handleRenameBarBlur}
        />
      </div>
    {:else}
      <div
        role="button"
        tabindex="0"
        class="relative flex items-center gap-2 border rounded px-2 py-1 bg-white hover:bg-slate-50 w-[200px] h-[34px] {renameHover ? 'rename-hover' : ''}"
        class:opacity-50={Object.keys(cellGroups).length === 0 || $isLinkMode}
        class:cursor-not-allowed={Object.keys(cellGroups).length === 0 || $isLinkMode}
        aria-disabled={Object.keys(cellGroups).length === 0 || $isLinkMode}
        on:click={handleDropdownToggle}
        on:mousedown={() => { ignoreNextBlur = true; }}
        on:keydown={(e) => { if (!e.target.classList.contains('rename-area') && (e.key === ' ' || e.key === 'Enter')) handleDropdownToggle() }}
      >
        <span
          class="w-5 h-5 rounded border border-slate-300 flex-shrink-0"
          style="background-color: {$selectedGroup ? getGroupColor(cellGroups[$selectedGroup]?.color) : '#cbd5e1'};"
        ></span>
        
        <span class="flex-1 min-w-0 text-left">
          {#if $selectedGroup && cellGroups[$selectedGroup]}
            <span
              class="rename-area cursor-text"
              role="button"
              tabindex="-1"
              on:mouseenter={() => renameHover = true}
              on:mouseleave={() => renameHover = false}
              on:click|stopPropagation={startRenameBar}
              on:keydown|stopPropagation={(e) => { if (e.key === 'Enter' || e.key === ' ') startRenameBar() }}
              title="Click to rename group"
            >
              <span class="truncate">{$selectedGroup}</span>
            </span>
          {:else}
            <span class="text-slate-500 truncate">No group selected</span>
          {/if}
        </span>

        <div class="flex items-center">
          {#if $selectedGroup}
            <span
              role="button"
              tabindex="0"
              class="p-0.5 rounded hover:bg-slate-200"
              on:click|stopPropagation={deselectGroup}
              on:keydown|stopPropagation={(e) => { if(e.key === ' ' || e.key === 'Enter') deselectGroup(e) }}
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
    {/if}

    {#if showDropdown}
      <div
        use:clickOutside={() => showDropdown = false}
        role="menu"
        tabindex="0"
        class="absolute left-0 mt-1 w-[200px] bg-white border border-slate-200 rounded shadow z-10 py-2 max-h-60 overflow-auto"
        on:click|self={() => showDropdown = false}
        on:keydown={(e) => e.key === 'Escape' && (showDropdown = false)}
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
        {#each Object.entries(cellGroups) as [groupName, group]}
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
        {#if Object.keys(cellGroups).length === 0}
          <div class="px-3 py-1 text-slate-400">No groups</div>
        {/if}
      </div>
    {/if}
  </div>
    <Button 
      icon={unlink} 
      color="amber"
      disabled={!$selectedGroup || renamingGroupBar}
      on:click={() => { groupActionType = 'unlink'; showGroupActionModal = true; }}
    />
    <Button 
      icon={erase} 
      color="red"
      disabled={!$selectedGroup || renamingGroupBar}
      on:click={() => { groupActionType = 'delete'; showGroupActionModal = true; }}
    />
</div>

{#if showGroupActionModal}
  <Modal
    icon={groupActionType === 'unlink' ? unlink : erase}
    color={groupActionType === 'unlink' ? 'amber' : 'red'}
    cancelText="Cancel"
    acceptText={groupActionType === 'unlink' ? 'Unlink' : 'Delete'}
    acceptColor={groupActionType === 'unlink' ? 'amber' : 'red'}
    cancelIcon={X}
    acceptIcon={groupActionType === 'unlink' ? unlink : erase}
    on:cancel={() => { showGroupActionModal = false; groupActionType = null; }}
    on:accept={handleGroupAction}
  >
    <div>
      {#if groupActionType === 'unlink'}
        Are you sure you want to unlink this group?
      {:else if groupActionType === 'delete'}
        Are you sure you want to delete this group?
      {/if}
    </div>
  </Modal>
{/if} 

<style>
  .rename-area {
    cursor: text;
    user-select: none;
  }
  .rename-hover {
    background: #e0f2fe !important;
  }
</style> 