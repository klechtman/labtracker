<script>
  import { colorStyles } from '../../lib/theme/colors';
  import Button from './Button.svelte';
  import { createEventDispatcher } from 'svelte';

  export let icon; // Svelte component for the icon in the circle
  export let color = 'sky'; // Color theme
  export let cancelText = 'Cancel';
  export let acceptText = 'Accept';
  export let acceptColor = null; // Optionally override accept button color
  export let cancelIcon = null; // Svelte component for cancel button icon
  export let acceptIcon = null; // Svelte component for accept button icon
  export let disabled = false;

  const dispatch = createEventDispatcher();

  $: theme = colorStyles[color] || colorStyles.sky;
  $: acceptBtnColor = acceptColor || color;
</script>

<div class="modal-bg">
  <div class={`modal-card bg-gradient-to-b ${theme.gradientFrom} ${theme.gradientTo} border ${theme.borderLight}`}>
    <div class={`modal-icon-circle ${theme.mid} border-2 ${theme.borderLight}`}>
      {#if icon}
        <svelte:component this={icon} className={`${theme.icon} w-8 h-8`} />
      {/if}
    </div>
    <div class="modal-content">
      <slot />
    </div>
    <div class="modal-actions">
      <Button color="sky" icon={cancelIcon} iconClass="w-4 h-4" on:click={() => dispatch('cancel')}>
        {cancelText}
      </Button>
      <Button color={acceptBtnColor} icon={acceptIcon} iconClass="w-4 h-4" on:click={() => dispatch('accept')} disabled={disabled}>
        {acceptText}
      </Button>
    </div>
  </div>
</div>

<style>
  .modal-bg {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }
  .modal-card {
    min-width: 320px;
    max-width: 95vw;
    border-radius: 14px;
    box-shadow: 0 4px 32px 0 rgba(0,0,0,0.10);
    padding: 2.5rem 2rem 1.5rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
  .modal-icon-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: 70px;
    height: 70px;
    margin-bottom: 0.5rem;
    flex-shrink: 0;
    flex-grow: 0;
    overflow: hidden;
  }
  .modal-content {
    text-align: center;
    font-size: 1.08rem;
    min-width: 220px;
    margin-bottom: 0.5rem;
  }
  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 0.5rem;
  }
</style> 