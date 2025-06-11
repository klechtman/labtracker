<script>
  import { hoveredRow } from '../../stores/tableStore';
  export let number;
  export let className = '';
  $: isHovered = $hoveredRow === number;
</script>

<div
  class={`flex items-center justify-center text-xs select-none h-full w-8 transition-colors duration-100 ${className}`}
  style="font-family: Montserrat; min-height: var(--cell-min-height, 32px); max-height: var(--cell-max-height, 48px);"
  class:bg-sky-600={isHovered}
  class:text-white={isHovered}
  class:text-slate-400={!isHovered}
>
  {number}
</div> 