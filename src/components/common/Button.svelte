<script>
  import { cn } from '../../lib/utils';
  import { createEventDispatcher } from 'svelte';
  import { colorStyles } from '../../lib/theme/colors';
  
  export let disabled = false;
  export let className = '';
  export let type = 'button';
  export let icon = ''; // Path to your SVG file
  export let iconClass = '';
  export let color = 'sky';
  const dispatch = createEventDispatcher();

  $: colorClasses = disabled
    ? "text-slate-400 border-slate-300 bg-slate-100 cursor-not-allowed"
    : `${colorStyles[color]?.text || colorStyles.sky.text} 
       ${colorStyles[color]?.border || colorStyles.sky.border} 
       bg-white 
       ${colorStyles[color]?.hoverBg || colorStyles.sky.hoverBg} 
       cursor-pointer`;
</script>

<button
  class={cn(
    "px-2 py-2 rounded-lg inline-flex items-center gap-2 border leading-none transition-colors duration-150",
    colorClasses,
    className
  )}
  disabled={disabled}
  type={type}
  {...$$restProps}
  on:click={(e) => { if (!disabled) dispatch('click', e); }}
>
  {#if icon}
    <svelte:component this={icon} className={iconClass ? iconClass : 'w-4 h-4'} />
  {/if}
  <slot />
</button> 