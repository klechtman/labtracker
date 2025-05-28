import { writable } from 'svelte/store';

// Store to track which group is currently being hovered
export const hoveredGroup = writable(null); 