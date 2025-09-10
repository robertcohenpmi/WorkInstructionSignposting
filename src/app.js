import { $, on } from './util/dom.js';
import { state } from './state.js';
import { ThemeManager } from './theme.js';
import { DataService } from './data.js';
import { Controls } from './ui/controls.js';
import { Sidebar } from './ui/sidebar.js';
import { AudienceSelect } from './ui/audience.js';
import { CardsView } from './ui/cards.js';
import { FilterChips } from './ui/chips.js';

async function main(){
  const theme = new ThemeManager();
  theme.init();

  const data = new DataService();

  // Restore state (URL > localStorage)
  state.fromLocal();
  state.fromHash();

  const statusEl = $('#status');
  try{
    await data.load();
    statusEl.style.display='none';
    $('#built').textContent = new Date().toISOString().slice(0,16).replace('T',' ') + ' UTC';
  }catch(err){
    statusEl.innerHTML = `Couldn't load <code>WI_Export.json</code> (${err.message}).<br/>
    Tip: host on SharePoint/Teams or use a small local server when testing.`;
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

