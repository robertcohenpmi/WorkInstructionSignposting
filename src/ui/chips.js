import { $, $$ } from '../util/dom.js';

export class FilterChips {
  constructor(state){
    this.state = state;
    this.el = $('#active-filters');
  }

  init(){
    if(!this.el) return;
    this.state.addEventListener('change', () => this.render());
    this.render();
  }

  render(){
    if(!this.el) return;

    const chips = [];

    // Search chip
    if(this.state.q){
      chips.push(this.chip('Search', this.state.q, {type:'q'}));
    }

    // Type chip (csMode)
    if(this.state.csMode && this.state.csMode !== 'all'){
      const label = this.state.csMode === 'cs' ? 'Country Specifics' : 'Work Instructions';
      chips.push(this.chip('Type', label, {type:'type'}));
    }

    // Level 4 Process group
    if(this.state.group){
      chips.push(this.chip('Level 4', this.state.group, {type:'group'}));
    }

    // Audience chips
    if(this.state.audience && this.state.audience.size){
      [...this.state.audience].sort((a,b)=>a.localeCompare(b)).forEach(aud=>{
        chips.push(this.chip('Audience', aud, {type:'audience', value:aud}));
      });
    }

    // Clear all
    if(chips.length){
      chips.push(`<button class="chip chip--clear" data-action="clear-all" title="Clear all filters">Clear all ✕</button>`);
    }

    this.el.innerHTML = chips.join('') || '';
    this.wireEvents();
  }

  chip(kind, value, data){
    const title = `${kind}: ${value}`;
    const attrs = Object.entries(data || {}).map(([k,v])=>`data-${k}="${(v ?? '').toString().replace(/"/g,'&quot;')}"`).join(' ');
    return `<span class="chip" ${attrs}>
      <span class="k">${kind}:</span> <span class="v">${this.escape(value)}</span>
      <button class="x" title="Remove ${title}" aria-label="Remove ${title}">✕</button>
    </span>`;
  }

  wireEvents(){
    // Remove individual chips
    $$('#active-filters .chip .x').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        const chip = e.currentTarget.closest('.chip');
        if(!chip) return;
        const type = chip.getAttribute('data-type');
        if(type === 'q'){
          this.state.set({ q:'', qTokens:[] });
        } else if(type === 'type'){
          this.state.set({ csMode:'all' });
        } else if(type === 'group'){
          this.state.set({ group:'' });
        } else if(type === 'audience'){
          const val = chip.getAttribute('data-value');
          if(this.state.audience.has(val)) {
            this.state.audience.delete(val);
            this.state.emit();
          }
        }
      });
    });

    // Clear all button
    const clear = $('#active-filters [data-action="clear-all"]');
    if(clear){
      clear.addEventListener('click', ()=>{
        this.state.clear();
      });
    }
  }

  escape(s){
    return (s+'').replace(/[&<>\"']/g, m =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
    );
  }
}
