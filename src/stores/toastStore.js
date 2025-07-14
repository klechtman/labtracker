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
          toast.undoAction(toast.undoData);
        }
        return toasts.filter(t => t.id !== id);
      });
    },
    
    // Clear all toasts
    clear: () => set([])
  };
}

export const toastStore = createToastStore(); 