import { $, $$, on } from '../util/dom.js';
import { audienceCountsForMenu } from '../filters.js';

export class AudienceSelect {
  constructor(state, dataService){
    this.state = state;
    this.dataService = dataService;
    this.wrap = $('#audience-select');
    this.btn = this.wrap.querySelector('button');
    this.menu = this.wrap.querySelector('.menu');
    this.list = $('#aud-list');
    this.search = $('#aud-search');
    this.clearBtn = $('#aud-clear');
    this.closeBtn = $('#aud-close');
    this.counter = $('#aud-counter');
  }
  init(){
    on(this.btn, 'click', ()=>{
      this.wrap.classList.toggle('open');
      if(this.wrap.classList.contains('open')){
        this.buildMenu();
        this.search.value='';
        this.filterMenu('');
        this.search.focus();
      }
    });
    on(this.closeBtn, 'click', ()=> this.wrap.classList.remove('open'));
    on(this.clearBtn, 'click', ()=>{
      this.state.audience.clear();
      this.state.emit();
    });
    on(this.list, 'change', (e)=>{
      const cb = e.target.closest('input[type=checkbox]');
      if(!cb) return;
      if(cb.checked) this.state.audience.add(cb.value); else this.state.audience.delete(cb.value);
      this.state.emit();
    });
    on(this.search, 'input', ()=>{
      this.filterMenu(this.search.value.trim());
    });
    document.addEventListener('click', (e)=>{ if(!this.wrap.contains(e.target)) this.wrap.classList.remove('open'); });

    this.state.addEventListener('change', ()=> this.updateCounter());
  }
  buildMenu(){
    this.list.innerHTML = '';
    const counts = audienceCountsForMenu(this.dataService.records, this.state);
    this.dataService.audienceValues.forEach(aud=>{
      const checked = this.state.audience.has(aud) ? 'checked' : '';
      const count = counts.get(aud) || 0;
      const row = document.createElement('label');
      row.className='row';
      row.innerHTML = `<input type="checkbox" value="${aud}" ${checked}/>
        <span>${aud}</span>
        <span class="count">${count}</span>`;
      this.list.appendChild(row);
    });
  }
  filterMenu(q){
    const qn = (q||'').toLowerCase();
    $$('#aud-list .row').forEach(row=>{
      const label = row.querySelector('span').textContent || '';
      const show = !q || label.toLowerCase().includes(qn);
      row.style.display = show ? '' : 'none';
    });
  }
  updateCounter(){
    if(this.counter) this.counter.textContent = this.state.audience.size ? `(${this.state.audience.size})` : '';
  }
}
