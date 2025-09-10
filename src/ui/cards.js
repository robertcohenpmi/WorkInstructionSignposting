import { $, $$, on } from '../util/dom.js';
import { applyFiltersAndSort } from '../filters.js';
import { scoreRecord, highlights } from '../search.js';

export class CardsView {
  constructor(state, dataService){
    this.state = state;
    this.dataService = dataService;
    this.resultsEl = $('#results');
    this.countEl = $('#count');
  }
  render(){
    const res = applyFiltersAndSort(this.dataService.records, this.state, scoreRecord);
    this.countEl.style.display = 'block';
    this.countEl.textContent = `${res.length} item${res.length===1?'':'s'}`;

    if(this.state.group){
      this.resultsEl.innerHTML = `<div class="grid">${res.map(r=>this.card(r)).join('')}</div>`;
    } else {
      const byGroup = new Map();
      res.forEach(r=>{
        const key = r.l4_group || '(Uncategorized)';
        if(!byGroup.has(key)) byGroup.set(key, []);
        byGroup.get(key).push(r);
      });
      const sections = [];
      [...byGroup.keys()].sort((a,b)=> a.localeCompare(b)).forEach(g=>{
        const items = byGroup.get(g);
        sections.push(`<section class="section">
          <div class="section-title">${this.escape(g)} • ${items.length}</div>
          <div class="grid">${items.map(r=>this.card(r)).join('')}</div>
        </section>`);
      });
      this.resultsEl.innerHTML = sections.join('');
    }
    this.attachInteractions();
  }
  escape(s){
    return (s+'').replace(/[&<>\"']/g, m =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
    );
  }
  card(r){
    const tcls = r.type_simple==='Country Specifics' ? 'type-cs' : 'type-wi';
    const aud = r.audience || [];
    const first = aud.slice(0,3).map(a=>`<span class="badge clickable" data-aud="${this.escape(a)}" title="Filter by ${this.escape(a)}">${highlights(a, this.state.qTokens)}</span>`).join(' ');
    const extraCount = Math.max(0, aud.length - 3);
    const extra = extraCount>0 ? ` <span class="badge more-badge" data-id="${this.escape(r.id)}">+${extraCount} more</span>` : '';

    const typeB = `<span class="badge ${tcls}">${this.escape(r.type_simple)}</span>`;
    const l4g = r.l4_group ? `<span class="badge">${highlights(r.l4_group, this.state.qTokens)}</span>` : '';
    const l4n = r.l4_name ? `<span class="badge">${highlights(r.l4_name, this.state.qTokens)}</span>` : '';
    const proc = r.process ? `<span class="badge">${highlights(r.process, this.state.qTokens)}</span>` : '';
    const subp = r.sub_process ? `<span class="badge">${highlights(r.sub_process, this.state.qTokens)}</span>` : '';

    const titleHTML = highlights(r.title, this.state.qTokens);
    const author = r.author ? `<span class="helper">Author: ${this.escape(r.author)}</span>` : '';
    const artno  = r.article_number ? `<span class="helper">Article #: ${this.escape(r.article_number)}</span>` : '';
    return `<div class="card" data-id="${this.escape(r.id)}">
      <h3><a href="${this.escape(r.url)}" target="_blank" rel="noopener">${titleHTML}</a></h3>
      <div class="meta">
        ${typeB}
        ${l4g}
        ${l4n}
        ${proc}
        ${subp}
      </div>
      ${aud.length? `<div class="badges aud">${first}${extra}</div>` : ''}
      <div class="meta">
        ${author}
        ${artno}
      </div>
    </div>`;
  }
  attachInteractions(){
    // Audience badge click -> toggle audience filter
    $$('#results .badge.clickable').forEach(el=>{
      on(el,'click', ()=>{
        const aud = el.getAttribute('data-aud');
        if(!aud) return;
        if(this.state.audience.has(aud)) this.state.audience.delete(aud); else this.state.audience.add(aud);
        this.state.emit();
      });
    });
    // "+X more" expander
    $$('#results .more-badge').forEach(el=>{
      on(el,'click', ()=>{
        const id = el.getAttribute('data-id');
        const r = this.dataService.records.find(x=>x.id===id);
        if(!r) return;
        const parent = el.closest('.card');
        const wrap = parent.querySelector('.badges.aud');
        wrap.innerHTML = r.audience.map(a=>`<span class="badge clickable" data-aud="${this.escape(a)}" title="Filter by ${this.escape(a)}">${highlights(a, this.state.qTokens)}</span>`).join(' ');
        this.attachInteractions();
      });
    });
  }
}
