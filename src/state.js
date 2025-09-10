import { STATE_KEY } from './config.js';
import { tokenize } from './util/text.js';

class AppState extends EventTarget {
  constructor(){
    super();
    this.q = '';
    this.qTokens = [];
    this.group = '';
    this.csMode = 'all'; // 'all' | 'cs' | 'wi'
    this.audience = new Set();
  }
  set(partial){
    Object.assign(this, partial);
    if ('q' in partial) this.qTokens = tokenize(this.q);
    this.emit();
  }
  clear(){
    this.q = '';
    this.qTokens = [];
    this.group = '';
    this.csMode = 'all';
    this.audience.clear();
    this.emit();
  }
  emit(){
    this.dispatchEvent(new CustomEvent('change', {detail:this.snapshot()}));
  }
  snapshot(){
    return {
      q:this.q, qTokens:this.qTokens,
      group:this.group, csMode:this.csMode,
      audience: new Set(this.audience)
    };
  }
  toLocal(){
    const j = { q:this.q, group:this.group, csMode:this.csMode, audience:[...this.audience] };
    localStorage.setItem(STATE_KEY, JSON.stringify(j));
  }
  fromLocal(){
    try{
      const j = JSON.parse(localStorage.getItem(STATE_KEY) || '{}');
      this.q = j.q || '';
      this.qTokens = tokenize(this.q);
      this.group = j.group || '';
      this.csMode = j.csMode || 'all';
      this.audience = new Set(j.audience || []);
    }catch(e){}
  }
  toHash(){
    const p = new URLSearchParams();
    if(this.q) p.set('q', this.q);
    if(this.group) p.set('group', this.group);
    if(this.csMode && this.csMode!=='all') p.set('type', this.csMode);
    if(this.audience.size) p.set('aud', [...this.audience].map(encodeURIComponent).join(','));
    const str = p.toString();
    const newHash = str ? '#'+str : '';
    if(location.hash !== newHash){
      history.replaceState(null, '', newHash);
    }
  }
  fromHash(){
    const h = (location.hash || '').replace(/^#/, '');
    const p = new URLSearchParams(h);
    this.q       = p.get('q') || '';
    this.qTokens = tokenize(this.q);
    this.group   = p.get('group') || '';
    this.csMode  = p.get('type') || 'all';
    const audStr = p.get('aud') || '';
    this.audience = new Set(audStr.split(',').map(decodeURIComponent).filter(Boolean));
  }
}

export const state = new AppState();
