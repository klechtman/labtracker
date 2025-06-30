<script>
    const palette = [
      // Reds / Pinks / Fuchsias
      { name: 'pale blush', hex: '#F5D9DB' },              // very light, soft pink
      { name: 'warm coral', hex: '#E69A94' },              // light, warm coral
      { name: 'muted fuchsia', hex: '#C57278' },           // mid-light, dusty fuchsia
      { name: 'dusty rose', hex: '#A65963' },              // mid, muted rose
      { name: 'deep berry', hex: '#7A3946' },              // mid-dark, cooler berry
      { name: 'muted wine', hex: '#5A2731' },              // dark, deep muted red
    
      // Oranges / Yellows
      { name: 'pale peach', hex: '#FAE4CA' },              // very light, soft peach
      { name: 'soft apricot', hex: '#DDB180' },            // light, warm apricot
      { name: 'golden amber', hex: '#B98750' },            // mid-light, muted amber
      { name: 'burnt orange', hex: '#A26640' },            // mid, warm burnt orange
      { name: 'rust brown', hex: '#774F2E' },              // mid-dark, muted brown
      { name: 'deep caramel', hex: '#5A3E23' },            // dark, warm deep brown
    
      // Greens (olive ↔ mint ↔ moss)
      { name: 'pale pistachio', hex: '#DFE4BC' },          // very light, soft pistachio
      { name: 'celery green', hex: '#B0C27B' },            // light, fresh celery
      { name: 'spring mint', hex: '#8A9A53' },             // mid-light, fresh mint
      { name: 'moss green', hex: '#66703F' },              // mid, muted moss
      { name: 'deep olive', hex: '#4C5632' },              // mid-dark, muted olive
      { name: 'forest green', hex: '#323E26' },            // dark, deep forest
    
      // Teals / Blues
      { name: 'pale aqua mint', hex: '#C7D9D9' },          // very light, soft aqua
      { name: 'dusty teal', hex: '#7B999B' },               // light, muted teal
      { name: 'vibrant teal', hex: '#4A7074' },             // mid-light, rich teal
      { name: 'slate blue', hex: '#485E6E' },               // mid, cool slate
      { name: 'deep teal', hex: '#33494B' },                // mid-dark, muted teal
      { name: 'deep navy', hex: '#24353D' },                // dark, deep navy
    
      // Purples / Violets
      { name: 'pale lilac', hex: '#E6E0EB' },               // very light, soft lilac
      { name: 'muted lavender', hex: '#AB9AC0' },           // light, muted lavender
      { name: 'orchid', hex: '#856BA6' },                    // mid-light, dusty orchid
      { name: 'plum rose', hex: '#664D72' },                 // mid, muted plum
      { name: 'deep violet', hex: '#4C3955' },               // mid-dark, deep violet
      { name: 'eggplant', hex: '#342A3F' },                  // dark, muted eggplant
    ];
    </script>
    
    
    

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
  {#each palette as color}
    <div style="display: flex; flex-direction: column; align-items: center;">
      <div style="width: 48px; height: 48px; border-radius: 8px; border: 1px solid #ccc; background: {color.hex};"></div>
      <div style="font-size: 0.9em; margin-top: 0.5em;">{color.hex}</div>
      <div style="font-size: 0.8em; color: #555;">{color.name}</div>
    </div>
  {/each}
</div>    