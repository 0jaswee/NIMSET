// Dependency-free DOM/event harness. This tests app wiring, NOT a real browser layout engine.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const records=JSON.parse(fs.readFileSync(new URL('../source-records.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
const elements=new Map();
class Element {
 constructor(id){this.id=id;this.style={};this.dataset={};this.open=false;this.textContent='';this.classList={toggle(){}};}
 set innerHTML(v){this.html=v;for(const m of v.matchAll(/id="([^"]+)"/g))if(!elements.has(m[1]))elements.set(m[1],new Element(m[1]));}
 get innerHTML(){return this.html||'';} showModal(){this.open=true;}close(){this.open=false;}focus(){}click(){}
}
for(const id of ['main','editor','edit-form','dialog-title','dialog-body','form-error','close-dialog','cancel-dialog','theme','sync','toast'])elements.set(id,new Element(id));
const main=elements.get('main');
const has=id=>['main','editor','edit-form','dialog-title','dialog-body','form-error','close-dialog','cancel-dialog','theme','sync','toast'].includes(id)||main.innerHTML.includes(`id="${id}"`);
const storage=new Map(),handlers={},downloads=[];let formValues={};
globalThis.document={querySelector:s=>s.startsWith('#')&&has(s.slice(1))?elements.get(s.slice(1)):null,querySelectorAll:()=>[],body:{classList:{toggle(){}}},createElement:()=>({click(){downloads.push(this.href);}})};
globalThis.window={addEventListener:(e,f)=>handlers[e]=f,scrollTo(){}};
globalThis.location={hash:'#home',href:'https://example.org/my-repo/'};
globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
globalThis.fetch=async()=>({ok:true,json:async()=>structuredClone(records)});
globalThis.FormData=class {constructor(){return Object.entries(formValues);}};
globalThis.confirm=()=>true;
globalThis.setTimeout=()=>1;globalThis.clearTimeout=()=>{};globalThis.setInterval=()=>1;
const act=async(action,extra={})=>{await main.onclick({target:{closest:()=>({dataset:{action,...extra},disabled:false})}});};
const route=hash=>{location.hash='#'+hash;handlers.hashchange();};
const save=async values=>{formValues=values;await elements.get('edit-form').onsubmit({preventDefault(){},target:{}});assert.equal(elements.get('form-error').textContent,'');};
const state=()=>JSON.parse(storage.get('abhyas-v1-demo')).state;
await import('../app.js?integration');
test('home shows provisional countdown and honest local status',()=>{assert(main.innerHTML.includes('provisional milestone'));assert(main.innerHTML.includes('389 PDF lectures'));assert.equal(elements.get('sync').textContent,'Local only · Firebase setup needed');});
test('subjects search links directly to nested lecture',()=>{route('subjects');elements.get('search').oninput({target:{value:'Algebraic Identities'}});const html=elements.get('search-results').innerHTML;assert(html.includes('#node/l'));assert(html.includes('Algebraic Identities'));});
test('create custom subtopic, nested child, independently check, notes and two resources',async()=>{route('node/s0');await act('add-node',{id:'s0'});await save({title:'My nested topic',description:'Own description',relevance:'Own exam notes'});const parent=state().nodes.find(x=>x.title==='My nested topic');assert(parent);route('node/'+parent.id);assert(main.innerHTML.includes('Own description'));await act('add-node',{id:parent.id});await save({title:'Child detail',description:'Child concept',relevance:'Child practice'});const child=state().nodes.find(x=>x.title==='Child detail');route('node/'+child.id);await main.onchange({target:{dataset:{check:child.id},checked:true}});assert.equal(state().nodes.find(x=>x.id===child.id).done,true);assert.equal(state().nodes.find(x=>x.id===parent.id).done,false);await act('notes',{id:child.id});await save({notes:'निजी revision note <script>bad</script>'});assert(main.innerHTML.includes('&lt;script&gt;bad&lt;/script&gt;'));for(const [type,label,url] of [['youtube','Video one','https://youtu.be/example'],['resource','Photo one','https://drive.google.com/file/d/example']]){await act('add-link',{id:child.id,type});await save({label,url});}assert.equal(state().nodes.find(x=>x.id===child.id).links.length,2);assert(main.innerHTML.includes('noopener noreferrer'));});
test('planner task add, edit and completion persist',async()=>{route('planner');await act('add-plan');await save({title:'Read sets',date:'2026-10-25',minutes:'35',nodeId:'s0'});let p=state().plans.at(-1);assert(main.innerHTML.includes('Backlog'));await act('edit-plan',{id:p.id});await save({title:'Read sets again',date:'2027-01-01',minutes:'40',nodeId:'s0'});await main.onchange({target:{dataset:{planCheck:p.id},checked:true}});assert.equal(state().plans.at(-1).done,true);assert.equal(state().plans.at(-1).minutes,40);});
test('test marks and actual study minutes flows',async()=>{route('tests');await act('add-test');await save({title:'Math test',date:'2026-10-26',subject:'Mathematics',score:'42',max:'100',notes:'Review signs'});assert(main.innerHTML.includes('42/100'));await act('log-session');await save({title:'Maths study',date:'2026-10-26',minutes:'150'});assert.equal(state().sessions.at(-1).minutes,150);assert(main.innerHTML.includes('2.5'));});
test('preferences/theme, JSON export/import and reload persistence',async()=>{route('settings');await act('preferences');await save({milestone:'2027-05-20',dailyMinutes:'120'});elements.get('theme').onclick();assert.equal(state().settings.theme,'dark');await act('export');assert(downloads.length>0);const backup=state();backup.nodes[0].notes='Imported backup note';await act('import');await elements.get('import-file').onchange({target:{files:[{size:200000,text:async()=>JSON.stringify(backup)}]}});assert.equal(state().nodes[0].notes,'Imported backup note');await import('../app.js?reload-test');route('node/s0');assert(main.innerHTML.includes('Imported backup note'));assert.equal(state().settings.dailyMinutes,120);});
test('local Google button cannot claim successful sync without config',async()=>{route('settings');await act('login');assert(elements.get('toast').textContent.includes('Firebase setup'));assert(!elements.get('sync').textContent.startsWith('Synced'));});
