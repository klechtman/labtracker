<script>
  import Cell from './Cell.svelte';

  const states = [
    'empty',
    'regular',
    'hover',
    'selected',
    'hover-selected',
    'renaming'
  ];

  const linkedStates = [
    'group-highlight',
    'regular',
    'hover',
    'selected',
    'hover-selected',
    'renaming'
  ];

  const groups = [
    { name: 'Group A', color: 'violet' },
    { name: 'Group B', color: '#10b981' },
    { name: 'Group C', color: '#f59e0b' }
  ];
</script>

<main class="max-w-7xl mx-auto p-5">
  <h1 class="text-2xl font-bold mb-8">Cell Component States</h1>
  
  <div class="grid grid-cols-4 gap-8">
    <div>
      <h2 class="mb-4 font-semibold">Regular States</h2>
      <div class="flex flex-col gap-4">
        {#each states as state}
          <div class="flex flex-col items-center mb-6">
            <span class="mb-3 font-mono text-xs">{state}</span>
            <div class="w-20 flex items-center justify-center p-1 box-border relative">
              <Cell 
                state={state} 
                text={state !== 'empty' ? state : ''} 
                outFridge={false}
              />
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div>
      <h2 class="mb-4 font-semibold">Out States</h2>
      <div class="flex flex-col gap-4">
        {#each states.filter(s => s !== 'empty') as state}
          <div class="flex flex-col items-center mb-6">
            <span class="mb-3 font-mono text-xs">{state}</span>
            <div class="w-20 flex items-center justify-center p-1 box-border relative">
              <Cell 
                state={state} 
                text={state !== 'empty' ? state : ''} 
                outFridge={true}
              />
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div>
      <h2 class="mb-4 font-semibold">Linked States</h2>
      {#each groups as group}
        <div class="mb-8">
          <span class="mb-2 font-mono text-xs font-bold block">{group.name}</span>
          <div class="flex flex-col gap-4">
            {#each linkedStates as state}
              <div class="flex flex-col items-center mb-6">
                <span class="mb-3 font-mono text-xs">{state}</span>
                <div class="w-20 flex items-center justify-center p-1 box-border relative">
                  <Cell 
                    state={state} 
                    text={state !== 'group-highlight' ? state : ''} 
                    linked={true}
                    groupColor={group.color}
                    groupName={group.name}
                    outFridge={false}
                    groupHover={state === 'group-highlight'}
                  />
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>

    <div>
      <h2 class="mb-4 font-semibold">Linked Out States</h2>
      {#each groups as group}
        <div class="mb-8">
          <span class="mb-2 font-mono text-xs font-bold block">{group.name}</span>
          <div class="flex flex-col gap-4">
            {#each linkedStates.filter(s => s !== 'empty') as state}
              <div class="flex flex-col items-center mb-6">
                <span class="mb-3 font-mono text-xs">{state}</span>
                <div class="w-20 flex items-center justify-center p-1 box-border relative">
                  <Cell 
                    state={state} 
                    text={state !== 'group-highlight' ? state : ''} 
                    linked={true}
                    groupColor={group.color}
                    groupName={group.name}
                    outFridge={true}
                    groupHover={state === 'group-highlight'}
                  />
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</main>