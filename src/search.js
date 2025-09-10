import { norm } from './util/text.js';

export function scoreRecord(r, tokens){
  if(!tokens.length) return 0;
  const t = tokens;
  let score = 0;
  const titleN   = norm(r.title);
  const l4nameN  = norm(r.l4_name);
  const l4groupN = norm(r.l4_group);
  const processN = norm((r.process||'') + ' ' + (r.sub_process||''));
  const authorN  = norm(r.author);
  const articleN = norm(r.article_number);
  const audienceN= norm(r.audience.join(' '));
  for(const k of t){
    if(titleN.includes(k))   score += 3;
    if(l4nameN.includes(k))  score += 2;
    if(l4groupN.includes(k)) score += 1.5;
    if(processN.includes(k)) score += 1.2;
    if(audienceN.includes(k))score += 1;
    if(authorN.includes(k))  score += 0.8;
    if(articleN.includes(k)) score += 0.8;
  }
  return score;
}

export function highlights(text, tokens){
  if(!text) return '';
  let out = text
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
  if(!tokens || !tokens.length) return out;
  const pattern = tokens.map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|');
  try{
    out = out.replace(new RegExp(`(${pattern})`, 'gi'), m=>`<mark>${m}</mark>`);
  }catch(e){}
  return out;
}
