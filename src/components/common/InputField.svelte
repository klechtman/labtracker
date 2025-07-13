<script>
  import { createEventDispatcher } from 'svelte';
  import { INPUT_STYLES } from '../../constants/inputStyles';

  const dispatch = createEventDispatcher();

  export let type = 'input'; // 'input' or 'button'
  export let value = '';
  export let placeholder = '';
  export let disabled = false;
  export let iconColor = '#cbd5e1'; // Default slate-300 color
  export let extraClasses = '';
  export let isHighlighted = false; // Auto-highlight when any cell is editing

  let isFocused = false;
  let isHovered = false;

  function getInputClasses() {
    let classes = [...INPUT_STYLES.base];
    if (type === 'input') {
      if (disabled) {
        classes = classes.concat(INPUT_STYLES.inputDefault);
        classes = classes.concat(INPUT_STYLES.disabled);
      } else if (isFocused || isHighlighted) {
        classes = classes.concat(INPUT_STYLES.focus);
      } else if (isHovered) {
        classes = classes.concat(INPUT_STYLES.inputDefault);
        classes = classes.concat(INPUT_STYLES.renameHover);
      } else {
        classes = classes.concat(INPUT_STYLES.inputDefault);
      }
    } else {
      classes = classes.concat(INPUT_STYLES.button);
    }
    if (extraClasses) {
      classes.push(extraClasses);
    }
    return classes.join(' ');
  }

  function handleMouseEnter() {
    if (!disabled && !isFocused) isHovered = true;
  }
  function handleMouseLeave() {
    if (!disabled) isHovered = false;
  }
  function handleFocus() {
    if (!disabled) isFocused = true;
  }
  function handleBlur() {
    if (!disabled) isFocused = false;
  }
</script>

<div class={[
  ...INPUT_STYLES.base,
  isHighlighted ? INPUT_STYLES.highlight : INPUT_STYLES.default,
  isFocused && !isHighlighted ? INPUT_STYLES.focus : [],
  isHovered ? INPUT_STYLES.renameHover : [],
  disabled ? INPUT_STYLES.disabled : [],
  extraClasses
].flat().join(' ')}>
  <!-- Icon/Color Square -->
  <span
    class="w-5 h-5 rounded border border-slate-300 flex-shrink-0"
    style="background-color: {iconColor === '#cbd5e1' ? 'transparent' : iconColor};"
  ></span>

  {#if type === 'input'}
    <input
      class="w-full h-full bg-transparent border-none outline-none p-0 disabled:cursor-not-allowed placeholder:text-slate-400"
      {placeholder}
      bind:value
      {disabled}
      on:input
      on:keydown
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:mouseenter={handleMouseEnter}
      on:mouseleave={handleMouseLeave}
      on:click|stopPropagation
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