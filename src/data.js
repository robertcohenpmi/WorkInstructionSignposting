import { JSON_PATH, SALESFORCE_DOMAIN } from './config.js';
import { splitList, splitSemi, uniq, norm } from './util/text.js';

function classifyType(raw){
  const l5 = (raw.ESD_L5_Type__c || '');
  const title = (raw.Title || '');
  return (/country specifics/i.test(l5) || /country specifics/i.test(title)) ? 'Country Specifics' : 'Work Instruction';
}

function normalize(raw){
  const id = raw.Id || '';
  const url = raw.URL ? raw.URL : `${SALESFORCE_DOMAIN}/lightning/r/Knowledge__kav/${id}/view`;
  return {
    id,
    url,
    language: raw.Language || '',
    title: (raw.Title || '').trim(),
    article_number: raw.ArticleNumber || '',
    l4_group: raw.L4_Processes_Group__c || '',
    l4_name:  raw.L4_Process_Name__c || '',
    process: raw.Process__c || '',
    sub_process: raw.Sub_Process__c || '',
    author: raw.ESD_Article_Author_Name__c || '',
    tags: splitList(raw.ESD_Tag__c),
    audience: splitSemi(raw.ESD_Target_Team__c),
    type_simple: classifyType(raw)
  };
}

function buildIndex(r){
  const fields = [
    r.title, r.l4_group, r.l4_name, r.process, r.sub_process,
    r.audience.join(' '), r.tags.join(' '), r.author, r.article_number
  ].map(s=>s||'').join(' ');
  return norm(fields);
}

export class DataService {
  constructor(){
    this.raw = [];
    this.records = [];
    this.groups = [];
    this.audienceValues = [];
  }
  async load(){
    const res = await fetch(JSON_PATH, {cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    this.raw = await res.json();
    this.records = this.raw.map(normalize);
    this.records.forEach(r => r._index = buildIndex(r));
    this.groups = uniq(this.records.map(r=>r.l4_group).filter(Boolean)).sort((a,b)=>a.localeCompare(b));
    this.audienceValues = uniq(this.records.flatMap(r=>r.audience).filter(Boolean)).sort((a,b)=>a.localeCompare(b));
    return this.records;
  }
}
