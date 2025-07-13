<script>
  import { createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  export let text = '';
  export let disabled = false;
  export let delay = 0; // Immediate by default
  
  let showTooltip = false;
  let mouseX = 0;
  let mouseY = 0;
  let timeoutId;
  
  function handleMouseEnter() {
    if (disabled || !text.trim()) return;
    
    if (delay > 0) {
      timeoutId = setTimeout(() => {
        showTooltip = true;
      }, delay);
    } else {
      showTooltip = true;
    }
  }
  
  function handleMouseLeave() {
    showTooltip = false;
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }
  
  function handleMouseMove(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }
</script>

<div
  role="tooltip"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:mousemove={handleMouseMove}
  on:focus={handleMouseEnter}
  on:blur={handleMouseLeave}
  style="display: contents;"
>
  <slot />
  
  {#if showTooltip && text}
    <div
      class="fixed bg-slate-50 text-slate-600 border-slate-600 border-[1px] px-2 py-1 rounded text-xs whitespace-pre-line z-[1000] pointer-events-none shadow-lg transition-opacity duration-100 opacity-100"
      style="top: {mouseY + 10}px; left: {mouseX + 10}px;"
    >
      {text}
    </div>
  {/if}
</div> 