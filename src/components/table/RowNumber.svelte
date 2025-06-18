<script>
  import { hoveredRow } from '../../stores/tableStore';
  export let number;
  export let className = '';
  $: isHovered = $hoveredRow === number;
</script>

<div
  class={`flex font-montserrat items-center select-none h-full transition-colors duration-100 ${className}
  ${isHovered ? 'font-title' : 'text-slate-400'}`}
  style="min-height: var(--cell-min-height, 32px); max-height: var(--cell-max-height, 48px);"
>
  <span style="display: inline-block; width: 20px; text-align: center;">{number}</span>
  {#if isHovered}
    <span class="ml-auto self-stretch w-0.5 bg-sky-800 my-0.5"></span>
  {/if}
</div> 