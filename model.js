import {validateRich,richText} from './rich-notes.js';
export const VERSION=1;
export const uid=()=>globalThis.crypto.randomUUID();
export function today(d=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);}
export function validDate(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;}
export function daysLeft(date,now=today()){return Math.ceil((Date.parse(date)-Date.parse(now))/86400000);}
export function safeUrl(s){try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:null;}catch{return null;}}
export function descendants(nodes,id){const result=[], stack=[id], seen=new Set();while(stack.length){const n=stack.pop();if(seen.has(n))continue;seen.add(n);result.push(n);for(const x of nodes)if(x.parentId===n)stack.push(x.id);}return result;}
// Every node has its own completion. Roll-up includes that node AND all descendants.
export function progress(nodes,id=null){const ids=id?new Set(descendants(nodes,id)):null;const list=nodes.filter(n=>!ids||ids.has(n.id));const done=list.filter(n=>n.done).length;return {done,total:list.length,percent:list.length?Math.round(100*done/list.length):0};}
export function pathOf(nodes,id){const path=[],seen=new Set();while(id&&!seen.has(id)){seen.add(id);const n=nodes.find(x=>x.id===id);if(!n)break;path.unshift(n);id=n.parentId;}return path;}
export function search(nodes,q){q=q.trim().toLocaleLowerCase();return q?nodes.filter(n=>[...pathOf(nodes,n.id).map(x=>x.title),n.description,n.relevance,n.notes,n.source?.date,...n.links.flatMap(l=>[l.label,l.url])].join(' ').toLocaleLowerCase().includes(q)):[];}
export function removeNode(s,id){const ids=new Set(descendants(s.nodes,id));s.nodes=s.nodes.filter(n=>!ids.has(n.id));s.plans=s.plans.map(p=>ids.has(p.nodeId)?{...p,nodeId:null}:p);}
export function fresh(records){
 const nodes=[];let count=0;const subjects=['Mathematics','Reasoning','Computer','English Grammar','Quantitative Aptitude'];
 for(const [si,subject] of subjects.entries()){
  const sid='s'+si;nodes.push(node(sid,null,subject,'subject'));
  const units=new Map();for(const source of records.filter(r=>r.subject===subject)){
   if(!units.has(source.unit)){const id='u'+si+'-'+units.size;units.set(source.unit,id);nodes.push(node(id,sid,source.unit,'unit'));}
   nodes.push({...node('l'+(++count),units.get(source.unit),source.title,'lecture'),source});
  }
 }
 return {schemaVersion:VERSION,nodes,plans:[],tests:[],sessions:[],settings:{milestone:'2027-05-31',dailyMinutes:150,theme:'light',weekAnchor:weekStart(today())},updatedAt:new Date().toISOString()};
}
export function node(id,parentId,title,kind='custom'){return {id,parentId,title,kind,done:false,description:'',relevance:'',notes:'',links:[],source:null};}
export function validate(s){
 const fail=m=>{throw new Error(m);};
 if(s?.syllabusId!==undefined&&!['nimcet','jilcce'].includes(s.syllabusId))fail('Unknown syllabus backup.');
 if(!s||s.schemaVersion!==VERSION)fail('Unsupported backup version.');
 if(!Array.isArray(s.nodes)||s.nodes.length>5000||!s.nodes.length)fail('Nodes must contain 1–5000 items.');
 const ids=new Set();const str=(v,max)=>typeof v==='string'&&v.length<=max;
 for(const n of s.nodes){if(!n||!str(n.id,100)||!/^[a-zA-Z0-9_-]+$/.test(n.id)||ids.has(n.id))fail('Invalid or duplicate node ID.');ids.add(n.id);
 if(!str(n.title,1000)||!n.title.trim()||!str(n.kind,30)||typeof n.done!=='boolean'||!['description','relevance','notes'].every(k=>str(n[k],50000)))fail('Invalid node fields.');
 if(!Array.isArray(n.links)||n.links.length>100||n.links.some(l=>!l||!str(l.label,300)||!str(l.url,3000)||!safeUrl(l.url)||!['youtube','resource'].includes(l.type)))fail('Invalid links.');
 if(n.syllabusSource!==undefined&&(!n.syllabusSource||!str(n.syllabusSource.file,1000)||!str(n.syllabusSource.excerpt,20000)||!Number.isInteger(n.syllabusSource.page)||n.syllabusSource.page<1||n.syllabusSource.page>1000||!str(n.syllabusSource.extractionNote||'',5000)))fail('Invalid syllabus source.');
 if(n.notesRich!==undefined){validateRich(n.notesRich);if(richText(n.notesRich)!==n.notes)fail('Rich and plain notes must match.');}
 if(n.source!==null&&(!n.source||!['subject','unit','title','time','date','dateOriginal','day','classSlot','file'].every(k=>str(n.source[k],1000))||!Number.isInteger(n.source.page)||n.source.page<1||!validDate(n.source.date)))fail('Invalid source metadata.');if(n.source)delete n.source.faculty;}
 for(const n of s.nodes){if(n.parentId!==null&&!ids.has(n.parentId))fail('Missing parent.');let p=n,seen=new Set();while(p){if(seen.has(p.id))fail('Cycle in hierarchy.');seen.add(p.id);if(seen.size>100)fail('Hierarchy exceeds 100 levels.');p=s.nodes.find(x=>x.id===p.parentId);}}
 for(const key of ['plans','tests','sessions'])if(!Array.isArray(s[key])||s[key].length>10000)fail('Invalid '+key);
 const itemIds=new Set();for(const key of ['plans','tests','sessions'])for(const x of s[key]){if(!x||!str(x.id,100)||itemIds.has(x.id)||!validDate(x.date))fail('Invalid record ID/date.');itemIds.add(x.id);}
 for(const p of s.plans)if(!str(p.title,1000)||!p.title.trim()||!Number.isFinite(p.minutes)||p.minutes<1||p.minutes>1440||typeof p.done!=='boolean'||(p.nodeId!==null&&!ids.has(p.nodeId)))fail('Invalid planner item.');
 for(const t of s.tests)if(!str(t.title,1000)||!str(t.subject,1000)||!str(t.notes,50000)||!Number.isFinite(t.max)||t.max<=0||!Number.isFinite(t.score)||t.score>t.max||t.score < -t.max)fail('Invalid test marks.');
 for(const t of s.sessions)if(!str(t.title,1000)||!Number.isFinite(t.minutes)||t.minutes<1||t.minutes>1440)fail('Invalid study log.');
 if(!s.settings||!validDate(s.settings.milestone)||!Number.isFinite(s.settings.dailyMinutes)||s.settings.dailyMinutes<30||s.settings.dailyMinutes>1440||!['light','dark'].includes(s.settings.theme))fail('Invalid settings.');
 if(s.settings.weekAnchor!==undefined&&(!validDate(s.settings.weekAnchor)||weekStart(s.settings.weekAnchor)!==s.settings.weekAnchor))fail('Week 1 must start on a Monday.');normalizeCompletion(s.nodes);
 if(new TextEncoder().encode(JSON.stringify(s)).length>800000)fail('Backup exceeds 800 KB. Export/archive older notes or logs first.');return s;
}
export function setCompletion(nodes,id,done){
 const n=nodes.find(n=>n.id===id);if(!n)throw new Error('Topic not found.');
 if(done&&descendants(nodes,id).slice(1).some(child=>!nodes.find(n=>n.id===child).done))throw new Error('Complete all subtopics first, then mark this topic complete.');
 n.done=done;if(!done)for(const p of pathOf(nodes,id).slice(0,-1))p.done=false;
}
export function normalizeCompletion(nodes){
 // Preserve completed leaves; invalidate only ancestors with an unfinished descendant.
 const byId=new Map(nodes.map(n=>[n.id,n]));
 for(const n of nodes)if(!n.done){let p=byId.get(n.parentId);while(p){p.done=false;p=byId.get(p.parentId);}}
 return nodes;
}
export function addDays(date,n){if(!validDate(date)||!Number.isInteger(n))throw new Error('Invalid date offset.');return new Date(Date.parse(date)+n*86400000).toISOString().slice(0,10);}
export function weekStart(date){if(!validDate(date))throw new Error('Invalid week date.');const day=new Date(date+'T00:00:00Z').getUTCDay();return addDays(date,-((day+6)%7));}
export function weekNumber(anchor,date){return 1+Math.round((Date.parse(weekStart(date))-Date.parse(weekStart(anchor)))/604800000);}
