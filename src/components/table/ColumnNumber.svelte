<script>
  import { fade } from 'svelte/transition';
  export let number;
</script>

<div 
  class="font-title text-center px-0.5"
  in:fade={{ duration: 200, easing: (t) => t }}
  out:fade={{ duration: 200, easing: (t) => t }}
>
  {number}
  <div class="h-0.5 bg-sky-800 mb-0.5"></div>
</div> 