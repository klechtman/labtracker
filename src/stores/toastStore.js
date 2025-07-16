import { writable } from 'svelte/store';

// Toast structure
// {
//   id: string,
//   icon: Component,
//   color: string,
//   text: string,
//   duration: number (optional, defaults to 4000ms)
//   undoAction: function (optional) - callback to execute when undo is clicked
//   undoData: any (optional) - data needed for the undo action
// }

function createToastStore() {
  const { subscribe, set, update } = writable([]);

  return {
    subscribe,
    
    // Add a new toast
    add: (toast) => {
      const id = Date.now().toString();
      const toastWithId = {
        id,
        duration: 4000,
        ...toast
      };
      
      update(toasts => [...toasts, toastWithId]);
      
      // Auto-remove after duration
      setTimeout(() => {
        update(toasts => toasts.filter(t => t.id !== id));
      }, toastWithId.duration);
      
      return id;
    },
    
    // Remove a specific toast
    remove: (id) => {
      update(toasts => toasts.filter(t => t.id !== id));
    },
    
    // Execute undo action for a specific toast
    undo: (id) => {
      update(toasts => {
        const toast = toasts.find(t => t.id === id);
        if (toast && toast.undoAction) {
          // Extract cell keys from undoData for animation
          const cellKeys = extractCellKeysFromUndoData(toast.undoData);
          
          // Add cells to animation store using triggerAnimation
          if (cellKeys.length > 0) {
            import('../utils/cellUtils').then(({ triggerAnimation }) => {
              triggerAnimation(cellKeys);
            });
          }
          
          // Execute the undo action
          toast.undoAction(toast.undoData);
        }
        return toasts.filter(t => t.id !== id);
      });
    },
    
    // Clear all toasts
    clear: () => set([])
  };
}

// Helper function to extract cell keys from undo data
function extractCellKeysFromUndoData(undoData) {
  if (!undoData) return [];
  
  // Handle different undo data structures
  if (undoData.originalStates) {
    // For group operations (link, unlink, delete)
    return undoData.originalStates.map(state => state.key);
  } else if (undoData.cellKey) {
    // For single cell operations
    return [undoData.cellKey];
  }
  
  return [];
}

export const toastStore = createToastStore(); 