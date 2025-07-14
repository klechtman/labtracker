<script>
  import { colorStyles } from '../../lib/theme/colors';
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  export let icon;
  export let color = 'sky';
  export let text = 'This is going to be a long text that will wrap around the icon and circle';
  const dispatch = createEventDispatcher();
  $: theme = colorStyles[color] || colorStyles.sky;

  let timeout;
  onMount(() => {
    timeout = setTimeout(() => dispatch('accept'), 4000);
  });
  onDestroy(() => clearTimeout(timeout));
</script>

<div class="toast-float" in:slide={{y: 32}} out:slide={{y: 32}}>
  <div class={`toast-card bg-gradient-to-b ${theme.gradientFrom} ${theme.gradientTo} border ${theme.borderLight}`}>
    <div class="toast-row">
      <div class={`toast-icon-circle ${theme.mid} border-2 ${theme.borderLight}`}>
        {#if icon}
          <svelte:component this={icon} className={`${theme.icon} w-8 h-8`} />
        {/if}
      </div>
      <div class="toast-content">{text}</div>
      <button class="toast-undo" type="button" on:click={() => dispatch('accept')} tabindex="0">Undo</button>
    </div>
  </div>
</div>

<style>
  .toast-float {
    position: fixed;
    right: 2rem;
    bottom: 2rem;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    pointer-events: none;
  }
  .toast-card {
    width: 400px;
    border-radius: 10px;
    box-shadow: 0 8px 32px 0 rgba(0,0,0,0.22), 0 1.5px 8px 0 rgba(0,0,0,0.12);
    padding: 0.75rem;
    background: white;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
  }
  .toast-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    position: relative;
  }
  .toast-icon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: 70px;
    height: 70px;
    flex-shrink: 0;
    overflow: hidden;
  }
  .toast-content {
    font-size: 0.875rem;
    color: #334155;
    font-family: 'Arimo', sans-serif;
    font-weight: 400;
    line-height: 1.2;
    margin: 0;
    padding: 0;
    word-break: break-word;
    flex: 1 1 auto;
    min-width: 0;
  }
  .toast-undo {
    position: absolute;
    right: 0.5rem;
    bottom: 0.25rem;
    background: none;
    border: none;
    color: #0284c7;
    font-size: 0.875rem;
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
    font-family: 'Arimo', sans-serif;
    font-weight: 400;
    transition: color 0.15s;
    line-height: 1.1;
  }
  .toast-undo:hover, .toast-undo:focus {
    color: #0369a1;
    outline: none;
    text-decoration: underline;
  }
</style> 