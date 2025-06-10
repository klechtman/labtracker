<script>
  import { cn } from '../lib/utils';
  import CellInfoBar from './CellInfoBar.svelte';
  import ToggleFridgeButton from './ToggleFridgeButton.svelte';
  export let title = "Lab Tool";
</script>

<header class={cn(
  "h-14 bg-white shadow-sm fixed top-0 left-0 right-0 z-10"
)}>
  <div class={cn(
    "h-full flex items-center justify-between px-12"
  )}>
    <div class="flex items-center gap-6">
      <CellInfoBar />
      <h1 class={cn(
        "text-xl font-semibold"
      )}>{title}</h1>
    </div>
    <div class="flex items-center gap-4">
      <ToggleFridgeButton />
    <slot name="header-button" />
    </div>
  </div>
</header> 