<script>
  import { writable } from 'svelte/store';
  import { leftTableStore, middleTableStore, mainTableStore } from '../stores/tableStore';

  // Create a store to track which group is being hovered
  export const hoveredGroup = writable(null);

  // Update group hover states when hoveredGroup changes
  $: {
    const currentGroup = $hoveredGroup;
    [leftTableStore, middleTableStore, mainTableStore].forEach(store => {
      Object.entries($store).forEach(([cellKey, cellData]) => {
        if (currentGroup && cellData.linked && cellData.groupName === currentGroup) {
          store.updateCell(cellKey, { ...cellData, groupHover: true });
        } else if (cellData.groupHover) {
          store.updateCell(cellKey, { ...cellData, groupHover: false });
        }
      });
    });
  }
</script> 