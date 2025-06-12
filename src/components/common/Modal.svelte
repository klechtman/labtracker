<script>
  import { colorStyles } from '../../styles/colorstyles.js';
  import Button from './Button.svelte';
  import { createEventDispatcher } from 'svelte';
  import X from '../icons/X.svelte';
  import unlinkIcon from '../icons/unlink.svelte';

  export let icon; // Svelte component for the icon
  export let color = 'sky'; // Color theme
  export let cancelText = 'Cancel';
  export let acceptText = 'Accept';
  export let acceptColor = null; // Optionally override accept button color
  export let disabled = false;

  const dispatch = createEventDispatcher();

  $: theme = colorStyles[color] || colorStyles.sky;
  $: acceptBtnColor = acceptColor || color;

  // Map theme.text to hex for inline SVG color
  const iconHexMap = {
    green: '#16a34a', // Tailwind green-600
    orange: '#ea580c', // Tailwind orange-600
    red: '#db2777', // Tailwind pink-600
    sky: '#0284c7', // Tailwind sky-600
    purple: '#7c3aed', // Tailwind purple-600
    slate: '#94a3b8', // Tailwind slate-400
  };
  $: iconColor = iconHexMap[color] || iconHexMap.sky;

  // Lightest color for gradient and icon circle
  const colorLightestMap = {
    sky: '#e0f2fe',
    green: '#dcfce7',
    orange: '#ffedd5',
    red: '#ffe4e6',
    purple: '#ede9fe',
    slate: '#f1f5f9',
  };
  $: lightest = colorLightestMap[color] || colorLightestMap.sky;
</script>

<div class="modal-bg">
  <div class="modal-card" style="background: linear-gradient(to bottom, {theme.lightest}, #fff 90%);">
    <div class="modal-icon-circle" style="background: {theme.mid}; border: 2px solid {theme.borderLight};">
      {#if icon}
        <svelte:component this={icon} className={`${theme.icon} w-8 h-8`} />
      {/if}
    </div>
    <div class="modal-content">
      <slot />
    </div>
    <div class="modal-actions">
      <Button color="slate" icon={X} iconClass="w-4 h-4" on:click={() => dispatch('cancel')}>
        {cancelText}
      </Button>
      <Button color={acceptBtnColor} icon={unlinkIcon} iconClass="w-4 h-4" on:click={() => dispatch('accept')} disabled={disabled}>
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