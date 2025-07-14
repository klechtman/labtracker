<script>
  import { localStorage } from '../../lib/localStorage';
  import { populateApp } from '../../utils/populateData';
  import { leftTableStore, middleTableStore, mainTableStore, loadingCells } from '../../stores/tableStore';
  import { CELL_STATES } from '../../constants';
  import { getStoreByCellKey } from '../../utils/cellUtils';
  import { getAllRenderedCellKeys } from '../../utils/populateData';

  // Function to clear localStorage and reload the app
  function handleClearData() {
    localStorage.clear();
    window.location.reload();
  }

  // Function to populate the app with random data
  function handlePopulateData() {
    populateApp();
  }

  // Function to test loading state
  function handleTestLoading() {
    const allCellKeys = getAllRenderedCellKeys();
    loadingCells.set(new Set(allCellKeys));
  }

  // Function to stop loading state
  function handleStopLoading() {
    loadingCells.set(new Set());
  }
</script>

<style>
  .floating-bar {
    position: fixed;
    top: 52px;
    right: 24px;
    z-index: 50;
    background: none;
    box-shadow: none;
    border: none;
    padding: 0;
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .floating-bar button {
    background: none;
    border: none;
    color: #111;
    font-size: 0.85rem;
    padding: 1px 4px;
    border-radius: 2px;
    cursor: pointer;
    line-height: 1.2;
  }
  .floating-bar button:hover {
    text-decoration: underline;
    background: none;
  }
</style>

<div class="floating-bar">
  <button on:click={handlePopulateData}>Populate Data</button>
  <button on:click={handleClearData}>Clear Data</button>
</div> 