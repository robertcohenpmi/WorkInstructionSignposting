export const $  = s => document.querySelector(s);
export const $$ = s => Array.from(document.querySelectorAll(s));

export const on = (el, event, handler, opts) => el && el.addEventListener(event, handler, opts);

export const debounce = (fn, ms=200) => {
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), ms); };
};
