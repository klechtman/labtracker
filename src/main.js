import './app.css'
import App from './App.svelte'

// Get the current path
const path = window.location.pathname;

// Create the appropriate component based on the path
const component = App;

const app = new component({
  target: document.getElementById('app')
});

export default app; 