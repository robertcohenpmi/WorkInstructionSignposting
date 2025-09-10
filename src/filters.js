export function matchesAudience(record, state){
  if(state.audience.size===0) return true;
  const set = new Set(record.audience.map(a=>a.toLowerCase()));
  for(const a of state.audience){
    if(set.has(a.toLowerCase())) return true; // OR logic
  }
  return false;
}
export function matchesType(record, state){
  if(state.csMode === 'cs') return record.type_simple === 'Country Specifics';
  if(state.csMode === 'wi') return record.type_simple === 'Work Instruction';
  return true;
}
export function matchesGroup(record, state){
  return !state.group || record.l4_group === state.group;
}

export function applyFiltersAndSort(data, state, scoreFn){
  const tokens = state.qTokens;
  let res = data.filter(r=>{
    if(!matchesType(r, state)) return false;
    if(!matchesAudience(r, state)) return false;
    if(!matchesGroup(r, state)) return false;
    if(tokens.length){
      if(!tokens.every(tok => r._index.includes(tok))) return false;
    }
    return true;
  });
  if(tokens.length){
    res.forEach(r => r._score = scoreFn(r, tokens));
    res.sort((a,b)=> b._score - a._score ||
      (a.l4_group||'').localeCompare(b.l4_group||'') ||
      (a.l4_name||'').localeCompare(b.l4_name||'') ||
      (a.title||'').localeCompare(b.title||'')
    );
  } else {
    res.sort((a,b)=> (a.l4_group||'').localeCompare(b.l4_group||'') ||
                    (a.l4_name||'').localeCompare(b.l4_name||'') ||
                    (a.title||'').localeCompare(b.title||''));
  }
  return res;
}

export function computeGroupCounts(data, state){
  // Counts reflect current filters: type, audience, query (but not currently selected group)
  const savedGroup = state.group;
  state.group = '';
  const tokens = state.qTokens;
  const counts = new Map();
  data.forEach(r=>{
    if(!matchesType(r, state)) return;
    if(!matchesAudience(r, state)) return;
    if(tokens.length && !tokens.every(tok => r._index.includes(tok))) return;
    const g = r.l4_group || '(Uncategorized)';
    counts.set(g, (counts.get(g)||0) + 1);
  });
  state.group = savedGroup;
  return counts;
}

export function audienceCountsForMenu(data, state){
  // Ignore current audience selections to show available counts with other filters applied
  const saved = new Set(state.audience);
  state.audience = new Set();
  const tokens = state.qTokens;
  const counts = new Map();
  data.forEach(r=>{
    if(!matchesType(r, state)) return;
    if(!matchesGroup(r, state)) return;
    if(tokens.length && !tokens.every(tok => r._index.includes(tok))) return;
    r.audience.forEach(a=>{
      counts.set(a, (counts.get(a)||0)+1);
    });
  });
  state.audience = saved;
  return counts;
}
