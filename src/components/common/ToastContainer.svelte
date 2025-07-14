<script>
  import { toastStore } from '../../stores/toastStore';
  import Toast from './toast.svelte';

  function handleToastAccept(event) {
    const toastId = event.detail;
    toastStore.undo(toastId);
  }
</script>

<div class="toast-container">
  {#each $toastStore as toast (toast.id)}
    <Toast
      icon={toast.icon}
      color={toast.color}
      text={toast.text}
      on:accept={() => handleToastAccept({ detail: toast.id })}
    />
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    right: 2rem;
    bottom: 2rem;
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
    pointer-events: none;
  }
</style> 