import { $ } from '../util/dom.js';
import { applyFiltersAndSort } from '../filters.js';
import { scoreRecord, highlights } from '../search.js';

export class CardsView {
  constructor(state, dataService){
    this.state = state;
    this.dataService = dataService;
    this.resultsEl = $('#results');
    this.countEl = $('#count');
    this.sr = $('#sr-announce');
  }

  render(){
    const res = applyFiltersAndSort(this.dataService.records, this.state, scoreRecord);
    this.countEl.style.display = 'block';
    this.countEl.textContent = `${res.length} item${res.length===1?'':'s'}`;

    if(this.state.group){
      this.resultsEl.innerHTML = `<div class="grid">${res.map(r=>this.card(r)).join('')}</div>`;
    } else {
      // Group by Level 4 Process Group when no specific group selected
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

    this.attachCopyHandlers();
  }

  escape(s){
    return (s+'').replace(/[&<>\"']/g, m =>
      ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
    );
  }

  card(r){
    const tcls = r.type_simple==='Country Specifics' ? 'type-cs' : 'type-wi';

    // Title
    const titleHTML = highlights(r.title, this.state.qTokens);

    // Type + L4 Group + L4 Name
    const typeB = `<span class="badge ${tcls}">${this.escape(r.type_simple)}</span>`;
    const l4g   = r.l4_group ? `<span class="badge">${highlights(r.l4_group, this.state.qTokens)}</span>` : '';
    const l4n   = r.l4_name  ? `<span class="badge">${highlights(r.l4_name, this.state.qTokens)}</span>`   : '';

    // Author + Article #
    const author = r.author ? `<span class="helper">Author: ${this.escape(r.author)}</span>` : '';
    const artno  = r.article_number ? `<span class="helper">Article #: ${this.escape(r.article_number)}</span>` : '';
    const infoRow = (author || artno) ? `<div class="meta">${author}${artno}</div>` : '';

    return `<div class="card" data-id="${this.escape(r.id)}" data-url="${this.escape(r.url)}">
      <h3><a href="${this.escape(r.url)}" target="_blank" rel="noopener">${titleHTML}</a></h3>
      <div class="meta">
        ${typeB}
        ${l4g}
        ${l4n}
      </div>
      ${infoRow}
      <div class="card-actions">
        <button class="btn-sm copy-link" title="Copy WI link">Copy link</button>
      </div>
    </div>`;
  }

  attachCopyHandlers(){
    this.resultsEl.querySelectorAll('.copy-link').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const card = e.currentTarget.closest('.card');
        if(!card) return;
        const url = card.getAttribute('data-url') || '';
        const original = e.currentTarget.textContent;
        try{
          if(navigator.clipboard && location.protocol.startsWith('http')){
            await navigator.clipboard.writeText(url);
          } else {
            const ta = document.createElement('textarea');
            ta.value = url;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
          }
          e.currentTarget.textContent = 'Copied!';
          this.announce('Link copied to clipboard');
          setTimeout(()=> e.currentTarget.textContent = original, 1200);
        }catch(err){
          console.error('Copy failed', err);
          e.currentTarget.textContent = 'Copy failed';
          this.announce('Copy failed');
          setTimeout(()=> e.currentTarget.textContent = original, 1600);
        }
      });
    });
  }

  announce(msg){
    if(!this.sr) return;
    this.sr.textContent = '';
    setTimeout(()=> this.sr.textContent = msg, 10);
  }
}
