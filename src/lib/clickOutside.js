export function clickOutside(node, callback) {
  const handleClick = event => {
    if (node && !node.contains(event.target) && !event.defaultPrevented) {
      callback(event);
    }
  };

  document.addEventListener('click', handleClick, true);

  return {
    destroy() {
      document.removeEventListener('click', handleClick, true);
    }
  };
} 