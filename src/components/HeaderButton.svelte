<script>
  export let onClick;
  export let disabled = false;
  export let count = 0;
</script>

<button
  class="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
  on:click={onClick}
  disabled={disabled}
>
  Link Selected Cells ({count})
</button> 