import { $, $$, on } from '../util/dom.js';
import { computeGroupCounts } from '../filters.js';

export class Sidebar {
  constructor(state, dataService){
    this.state = state;
    this.dataService = dataService;
    this.el = $('#groups');
  }
  render(){
    const counts = computeGroupCounts(this.dataService.records, this.state);
    const items = [];
    const ALL = '(All Level 4 Processes)';
    const total = [...counts.values()].reduce((a,b)=>a+b,0);
    items.push({name:ALL,count:total, value:''});
    this.dataService.groups.forEach(g => {
      items.push({name:g, count:counts.get(g)||0, value:g});
    });
    this.el.innerHTML = items.map(it=>{
      const active = (this.state.group==='' && it.value==='') || (this.state.group===it.value);
      return `<div class="group-item ${active?'active':''}" data-group="${it.value}" title="${it.name}">
        <span class="name">${it.name}</span>
        <span class="count">${it.count}</span>
      </div>`;
    }).join('');
    $$('#groups .group-item').forEach(el=>{
      on(el,'click', ()=>{
        this.state.set({ group: el.dataset.group || '' });
      });
    });
  }
}
