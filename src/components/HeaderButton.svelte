<script>
  import { cn } from '../lib/utils';
  export let onClick;
  export let disabled = false;
</script>

<button
  class={cn(
    "px-4 py-2 text-white rounded",
    "bg-sky-600 hover:bg-sky-700",
    "disabled:opacity-50 disabled:cursor-not-allowed"
  )}
  on:click={onClick}
  disabled={disabled}
>
  Link Selected Cells
</button> 