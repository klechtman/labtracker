<script>
  import X from '../icons/X.svelte';
  import { leftTableStore, middleTableStore, mainTableStore, getCellGroups, selectedGroup, isLinkMode, isGroupMode, selectedCells } from '../../stores/tableStore';
  import Button from '../common/Button.svelte';
  import unlink from '../icons/unlink.svelte';
  import erase from '../icons/erase.svelte';
  import Modal from '../common/Modal.svelte';
  import GroupInput from '../common/GroupInput.svelte';
  import { toastStore } from '../../stores/toastStore';
  import { triggerAnimation } from '../../utils/cellUtils';

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
      // Clear selected cells when a group is selected to deselect cells in renaming mode
      selectedCells.set(new Set());
    }
  }

  function handleDeselect() {
    selectedGroup.set(null);
  }

  function handleGroupAction() {
    const groupName = $selectedGroup; // Capture group name before action
    
    if (groupActionType === 'unlink') {
      // Capture original state for undo
      const originalStates = [];
      const affectedCells = [];
      const allStores = [
        { store: leftTableStore, data: $leftTableStore },
        { store: middleTableStore, data: $middleTableStore },
        { store: mainTableStore, data: $mainTableStore }
      ];
      
      allStores.forEach(({ store, data }) => {
        Object.entries(data).forEach(([key, cell]) => {
          if (cell.groupName === groupName) {
            originalStates.push({
              key,
              store,
              linked: cell.linked,
              groupName: cell.groupName,
              groupColor: cell.groupColor,
              text: cell.text,
              outFridge: cell.outFridge,
              state: cell.state
            });
            affectedCells.push(key);
          }
        });
      });
      
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
        
        // Trigger animation for affected cells
        triggerAnimation(affectedCells);
        
        // Show toast with undo functionality
        toastStore.add({
          icon: unlink,
          color: 'amber',
          text: `Unlinked group "${groupName}"`,
          duration: 4000,
          undoAction: undoUnlinkGroup,
          undoData: { originalStates, groupName }
        });
      });
    } else if (groupActionType === 'delete') {
      // Capture original state for undo
      const originalStates = [];
      const affectedCells = [];
      const allStores = [
        { store: leftTableStore, data: $leftTableStore },
        { store: middleTableStore, data: $middleTableStore },
        { store: mainTableStore, data: $mainTableStore }
      ];
      
      allStores.forEach(({ store, data }) => {
        Object.entries(data).forEach(([key, cell]) => {
          if (cell.groupName === groupName) {
            originalStates.push({
              key,
              store,
              linked: cell.linked,
              groupName: cell.groupName,
              groupColor: cell.groupColor,
              text: cell.text,
              outFridge: cell.outFridge,
              state: cell.state
            });
            affectedCells.push(key);
          }
        });
      });
      
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
        
        // Trigger animation for affected cells
        triggerAnimation(affectedCells);
        
        // Show toast with undo functionality
        toastStore.add({
          icon: erase,
          color: 'red',
          text: `Deleted group "${groupName}"`,
          duration: 4000,
          undoAction: undoDeleteGroup,
          undoData: { originalStates, groupName }
        });
      });
    }
    showGroupActionModal = false;
    groupActionType = null;
  }
  
  function undoUnlinkGroup(undoData) {
    const { originalStates, groupName } = undoData;
    
    // Restore original states
    originalStates.forEach(({ key, store, linked, groupName: originalGroupName, groupColor, text, outFridge, state }) => {
      const currentCell = store.get(key) || {};
      store.updateCell(key, {
        ...currentCell,
        linked,
        groupName: originalGroupName,
        groupColor,
        text,
        outFridge,
        state
      });
    });
    
    // Show confirmation toast
    toastStore.add({
      icon: unlink,
      color: 'emerald',
      text: `Restored group "${groupName}"`,
      duration: 2000
    });
  }
  
  function undoDeleteGroup(undoData) {
    const { originalStates, groupName } = undoData;
    
    // Restore original states
    originalStates.forEach(({ key, store, linked, groupName: originalGroupName, groupColor, text, outFridge, state }) => {
      const currentCell = store.get(key) || {};
      store.updateCell(key, {
        ...currentCell,
        linked,
        groupName: originalGroupName,
        groupColor,
        text,
        outFridge,
        state
      });
    });
    
    // Show confirmation toast
    toastStore.add({
      icon: erase,
      color: 'emerald',
      text: `Restored group "${groupName}"`,
      duration: 2000
    });
  }
</script>

<div data-action-area class="flex items-center gap-2">
  {#if !mobile}
    <span class="font-title text-sky-800 select-none inline-block">
      Groups:
    </span>
  {/if}
  <GroupInput
    value={$selectedGroup || ''}
    placeholder="No group selected"
    disabled={Object.keys(cellGroups).length === 0 || $isLinkMode}
    isLinkMode={$isLinkMode}
    groups={cellGroups}
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