<script>
  import { cn } from '../../lib/utils';
  import { createEventDispatcher } from 'svelte';
  export let disabled = false;
  export let className = '';
  export let type = 'button';
  export let icon = ''; // Path to your SVG file
  export let color = 'sky';
  const dispatch = createEventDispatcher();

  const colorMap = {
    green: {
      text: "text-green-600",
      border: "border-green-600",
      hoverBg: "hover:bg-green-50",
      icon: "text-green-600",
    },
    orange: {
      text: "text-orange-600",
      border: "border-orange-600",
      hoverBg: "hover:bg-orange-50",
      icon: "text-orange-600",
    },
    red: {
      text: "text-pink-600",
      border: "border-pink-600",
      hoverBg: "hover:bg-pink-50",
      icon: "text-pink-600",
    },
    sky: {
      text: "text-sky-600",
      border: "border-sky-600",
      hoverBg: "hover:bg-sky-50",
      icon: "text-sky-600",
    },
    purple: {
      text: "text-purple-600",
      border: "border-purple-600",
      hoverBg: "hover:bg-purple-50",
      icon: "text-purple-600",
    },
    slate: {
      text: "text-slate-400",
      border: "border-slate-300",
      bg: "bg-slate-100",
      icon: "text-slate-400",
    },
  };

  $: colorClasses = disabled
    ? "text-slate-400 border-slate-300 bg-slate-100 cursor-not-allowed"
    : `${colorMap[color]?.text || colorMap.sky.text} 
       ${colorMap[color]?.border || colorMap.sky.border} 
       bg-white 
       ${colorMap[color]?.hoverBg || colorMap.sky.hoverBg} 
       cursor-pointer`;
</script>

<button
  class={cn(
    "px-2 py-2 rounded-lg inline-flex items-center gap-2 border text-m font-S leading-none transition-colors duration-150",
    colorClasses,
    className
  )}
  disabled={disabled}
  type={type}
  {...$$restProps}
  on:click={(e) => { if (!disabled) dispatch('click', e); }}
>
  {#if icon}
    <svelte:component this={icon} class={`w-4 h-4`} />
  {/if}
  <slot />
</button> 