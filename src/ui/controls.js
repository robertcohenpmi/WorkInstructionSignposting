import { $, on, debounce } from '../util/dom.js';

export class Controls {
  constructor(state){
    this.state = state;
    this.q = $('#q');
    this.csMode = $('#csMode');
    this.clear = $('#clearAll');
  }
  init(){
    this.q.value = this.state.q;
    on(this.q, 'input', debounce((e)=>{
      this.state.set({ q: e.target.value.trim() });
    }, 200));

    this.csMode.value = this.state.csMode || 'all';
    on(this.csMode, 'change', (e)=>{
      this.state.set({ csMode: e.target.value });
    });

    on(this.clear, 'click', ()=>{
      this.state.clear();
      this.q.value = '';
      this.csMode.value = 'all';
    });
  }
}
