import { $, on } from './util/dom.js';
import { state } from './state.js';
import { ThemeManager } from './theme.js';
import { DataService } from './data.js';
import { Controls } from './ui/controls.js';
import { Sidebar } from './ui/sidebar.js';
import { AudienceSelect } from './ui/audience.js';
import { CardsView } from './ui/cards.js';
import { FilterChips } from './ui/chips.js';
import { JSON_PATH } from './config.js';

async function main(){
  const theme = new ThemeManager();
  theme.init();

  const data = new DataService();

  // Restore state (URL > localStorage)
  state.fromLocal();
  state.fromHash();

  const statusEl = $('#status');
  // Diagnostic: confirm JS loaded and show computed JSON path
  if (statusEl) statusEl.textContent = `Loading data… (JS loaded, src = ${JSON_PATH})`;

  try{
    // Kick off data load
    await data.load();
    if (statusEl) statusEl.style.display='none';
    $('#built').textContent = new Date().toISOString().slice(0,16).replace('T',' ') + ' UTC';
  }catch(err){
    // Show detailed error if fetch fails
    if (statusEl){
      statusEl.innerHTML = `
        <strong>Failed to load data.</strong><br/>
        Tried: <code>${JSON_PATH}</code><br/>
        Error: <code>${(err && err.message) || err}</code><br/><br/>
        Tips:<br/>
        • Ensure <code>WI_Export.json</code> is in the <em>same folder</em> as <code>index.html</code> on GitHub Pages.<br/>
        • Or pass a custom path via <code>?src=path/to/WI_Export.json</code> (relative to this page).<br/>
        • If your Pages site uses the <code>docs/</code> folder, make sure the JSON file is inside <code>docs/</code> as well.
      `;
    }
    console.error(err);
    return;
  }

  // UI components
  const controls = new Controls(state);
  const sidebar  = new Sidebar(state, data);
  const audience = new AudienceSelect(state, data);
  const cards    = new CardsView(state, data);
  const chips    = new FilterChips(state);

  controls.init();
  audience.init();
  chips.init();

  // Re-render on state changes, persist to URL/localStorage
  const renderAll = ()=>{
    try{
      sidebar.render();
      cards.render();
      chips.render();
      state.toHash();
      state.toLocal();
    }catch(e){ console.error(e); }
  };
  state.addEventListener('change', renderAll);

  // Initial render
  renderAll();

  // Allow URL hash to drive state if changed externally
  on(window, 'hashchange', ()=>{
    const before = state.snapshot();
    state.fromHash();
    const after = state.snapshot();
    if(JSON.stringify(before) !== JSON.stringify(after)){
      state.emit();
    }
  });
}

main();
