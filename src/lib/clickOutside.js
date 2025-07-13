export function clickOutside(node, callback) {
  const handleClick = event => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      callback(event);
      // Only prevent propagation if the click is not on an action area or cell
      // This allows actions and cell selections to be performed when closing dropdowns
      if (!event.target.closest('[data-action-area]') && !event.target.closest('[data-cell-key]')) {
        event.stopPropagation();
      }
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
} 