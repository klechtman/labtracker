<script>
  import { cn } from '../lib/utils';
  export let title = "Lab Tool";
</script>

<header class={cn(
  "h-14 bg-white shadow-sm fixed top-0 left-0 right-0 z-10"
)}>
  <div class={cn(
    "h-full flex items-center justify-between px-12"
  )}>
    <h1 class={cn(
      "text-xl font-semibold"
    )}>{title}</h1>
    <slot name="header-button" />
  </div>
</header> 