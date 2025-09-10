import { THEME_KEY } from './config.js';
import { $, on } from './util/dom.js';

export class ThemeManager {
  init(){
    this.apply(this.resolveInitial());
    on($('#themeToggle'), 'click', ()=>{
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      this.apply(next);
      localStorage.setItem(THEME_KEY, next);
    });
    if(!localStorage.getItem(THEME_KEY) && window.matchMedia){
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', e=> this.apply(e.matches ? 'dark' : 'light'));
    }
  }
  resolveInitial(){
    const saved = localStorage.getItem(THEME_KEY);
    if(saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  apply(theme){
    const html = document.documentElement;
    html.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    $('#themeToggle')?.setAttribute('aria-pressed', String(isDark));
    const icon = $('#themeIcon'), label = $('#themeLabel');
    if(icon) icon.textContent = isDark ? '☀️' : '🌙';
    if(label) label.textContent = isDark ? 'Light' : 'Dark';
  }
}
