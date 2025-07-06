<script>
  import X from '../icons/X.svelte';
  import { leftTableStore, middleTableStore, mainTableStore, getCellGroups, selectedGroup, isLinkMode, isGroupMode } from '../../stores/tableStore';
  import Button from '../common/Button.svelte';
  import unlink from '../icons/unlink.svelte';
  import erase from '../icons/erase.svelte';
  import Modal from '../common/Modal.svelte';
  import GroupInput from '../common/GroupInput.svelte';

  // Add mobile prop to conditionally hide "Groups:" text
  export let mobile = false;

  let showGroupActionModal = false;
  let groupActionType = null; // 'unlink' or 'delete'

  // Update cellGroups reactively
  $: cellGroups = getCellGroups($leftTableStore ?? {}, $middleTableStore ?? {}, $mainTableStore ?? {});

  // Watch for link mode changes - removed problematic logic

  // Activate/deactivate group mode based on group selection
  $: if ($selectedGroup) {
    isGroupMode.set(true);
  } else {
    isGroupMode.set(false);
  }

  // Clear selected group when no groups exist
  $: if (Object.keys(cellGroups).length === 0) {
    selectedGroup.set(null);
  }

  function handleRename({ detail }) {
    const { oldName, newName } = detail;
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
  }

  function handleSelect(e) {
    if (e.detail == null) {
      selectedGroup.set(null);
    } else {
      selectedGroup.set(e.detail);
    }
  }

  function handleDeselect() {
    selectedGroup.set(null);
  }

  function handleGroupAction() {
    if (groupActionType === 'unlink') {
      import('../../logic/groupLogic').then(({ unlinkAllInGroup }) => {
        unlinkAllInGroup(
          $selectedGroup,
          $leftTableStore,
          $middleTableStore,
          $mainTableStore,
          false,
          selectedGroup,
          () => {}
        );
      });
    } else if (groupActionType === 'delete') {
      import('../../logic/groupLogic').then(({ deleteAllInGroup }) => {
        deleteAllInGroup(
          $selectedGroup,
          $leftTableStore,
          $middleTableStore,
          $mainTableStore,
          false,
          selectedGroup,
          () => {}
        );
      });
    }
    showGroupActionModal = false;
    groupActionType = null;
  }
</script>

<div class="flex items-center gap-2">
  {#if !mobile}
    <span class="font-title text-sky-800 select-none inline-block">
      Groups:
    </span>
  {/if}
  <GroupInput
    value={$selectedGroup || ''}
    placeholder="No group selected"
    iconColor={$selectedGroup ? cellGroups[$selectedGroup]?.color : '#cbd5e1'}
    disabled={Object.keys(cellGroups).length === 0 || $isLinkMode}
    groups={cellGroups}
    isLinkMode={$isLinkMode}
    locked={$isLinkMode && $selectedGroup}
    on:rename={handleRename}
    on:select={handleSelect}
    on:deselect={handleDeselect}
  />
  <Button 
    icon={unlink} 
    color="amber"
    disabled={!$selectedGroup || $isLinkMode}
    on:click={() => { groupActionType = 'unlink'; showGroupActionModal = true; }}
  />
  <Button 
    icon={erase} 
    color="red"
    disabled={!$selectedGroup || $isLinkMode}
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