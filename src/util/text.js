export const htmlDecode = (s) => {
  if (s == null) return '';
  const t = document.createElement('textarea');
  t.innerHTML = s;
  return t.value;
};

export const esc = s => (s+'').replace(/[&<>\"']/g, m =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])
);

export const splitSemi = v => (v? (v+'').split(';').map(x=>htmlDecode(x).trim()).filter(Boolean) : []);
export const splitList = v => (v? (v+'').split(/;|,/).map(x=>htmlDecode(x).trim()).filter(Boolean) : []);
export const uniq = arr => [...new Set(arr)];

export const norm = s => {
  s = (s||'')+'';
  s = s.toLowerCase();
  try { s = s.normalize('NFD').replace(/[\u0300-\u036f]/g,''); } catch(e){}
  return s;
};

export const tokenize = (q) => uniq((q||'').trim().split(/\s+/).filter(Boolean).map(norm));
