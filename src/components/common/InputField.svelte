<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let type = 'input'; // 'input' or 'button'
  export let value = '';
  export let placeholder = '';
  export let disabled = false;
  export let iconColor = '#cbd5e1'; // Default slate-300 color
  export let extraClasses = '';
</script>

<div
  class="relative flex items-center gap-2 border rounded px-2 py-1 bg-white w-[200px] h-[34px] {extraClasses}
    focus-within:ring-2 focus-within:ring-sky-400
    {type === 'button' ? 'hover:bg-slate-50' : ''}
    {type === 'input' ? 'hover:bg-sky-100 focus-within:bg-sky-100' : ''}"
  class:opacity-50={disabled}
  class:cursor-not-allowed={disabled}
>
  <!-- Icon/Color Square -->
  <span
    class="w-5 h-5 rounded border border-slate-300 flex-shrink-0"
    style="background-color: {iconColor};"
  ></span>

  {#if type === 'input'}
    <input
      class="w-full h-full bg-transparent border-none outline-none p-0 disabled:cursor-not-allowed placeholder:text-slate-400"
      {placeholder}
      {value}
      {disabled}
      on:input={e => value = e.target.value}
      on:keydown
      on:blur
    />
  {:else if type === 'button'}
    <button
      class="w-full h-full flex items-center justify-between bg-transparent border-none outline-none p-0 disabled:cursor-not-allowed"
      {disabled}
      on:click
      on:mousedown
      on:keydown
    >
      <span class="truncate" class:text-slate-500={!value}>{value || placeholder}</span>
      <svg class="w-4 h-4 ml-1 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  {/if}
</div> 