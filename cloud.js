import {validate} from './model.js';
const clone=v=>structuredClone(v);
function same(a,b){if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object'||Array.isArray(a)!==Array.isArray(b))return false;const ak=Object.keys(a),bk=Object.keys(b);return ak.length===bk.length&&ak.every(k=>Object.hasOwn(b,k)&&same(a[k],b[k]));}
function noteBundle(n){const runs=n.notesRich??[{text:n.notes,color:'default',bold:false,italic:false,underline:false}];const normalized=[];for(const r of runs){if(!r.text)continue;const x={...r,size:r.size||16},prev=normalized.at(-1);if(prev&&['color','bold','italic','underline','size'].every(k=>prev[k]===x[k]))prev.text+=x.text;else normalized.push(x);}return {notes:n.notes,notesRich:normalized};}
function content(s){if(!s)return s;const {updatedAt,...rest}=s;return {...rest,nodes:s.nodes.map(n=>({...n,...noteBundle(n),quizzes:n.quizzes||[]}))};}
function equivalent(a,b){return same(content(a),content(b));}
// Merge only changes that can be combined without choosing one device's edit over another.
export function mergeTracker(base,local,remote){
 const conflicts=[];
 function merge(b,l,r,path){
  if(same(l,r))return clone(l);if(same(l,b))return clone(r);if(same(r,b))return clone(l);
  const records=['nodes','plans','tests','sessions'].includes(path)||path.endsWith('.quizzes');
  if(records&&Array.isArray(b)&&Array.isArray(l)&&Array.isArray(r)){
   const bm=new Map(b.map(x=>[x.id,x])),lm=new Map(l.map(x=>[x.id,x])),rm=new Map(r.map(x=>[x.id,x]));
   const ids=[...new Set([...r.map(x=>x.id),...l.map(x=>x.id)])],out=[];
   for(const id of ids){const value=merge(bm.get(id),lm.get(id),rm.get(id),path+'.'+id);if(value!==undefined)out.push(value);}return out;
  }
  if(b&&l&&r&&![b,l,r].some(Array.isArray)&&[b,l,r].every(v=>typeof v==='object')){
   const out={},keys=new Set([...Object.keys(b),...Object.keys(l),...Object.keys(r)]);
   if(/^nodes\.[^.]+$/.test(path)&&keys.has('notes')){
    const bundle=noteBundle;const bn=bundle(b),ln=bundle(l),rn=bundle(r);let chosen;
    if(same(ln,rn))chosen=ln;else if(same(ln,bn))chosen=rn;else if(same(rn,bn))chosen=ln;else conflicts.push(path+'.notes');
    if(chosen){out.notes=chosen.notes;if(chosen.notesRich!==undefined)out.notesRich=clone(chosen.notesRich);}keys.delete('notes');keys.delete('notesRich');
   }
   for(const key of keys){
    if(path===''&&key==='updatedAt')continue;
    if(/^sessions\.[^.]+$/.test(path)&&key==='minutes'&&b.automaticVideo&&l.automaticVideo&&r.automaticVideo&&l.nodeId===r.nodeId&&l.date===r.date&&l.minutes>=b.minutes&&r.minutes>=b.minutes){out.minutes=Math.min(1440,b.minutes+(l.minutes-b.minutes)+(r.minutes-b.minutes));continue;}
    const v=merge(b[key],l[key],r[key],path?path+'.'+key:key);if(v!==undefined)out[key]=v;
   }return out;
  }
  conflicts.push(path);return clone(l);
 }
 if(!base)return {state:null,conflicts:['No shared sync baseline']};
 const state=merge(base,local,remote,'');if(conflicts.length)return {state:null,conflicts};
 state.updatedAt=new Date().toISOString();try{return {state:validate(state),conflicts:[]};}catch(e){return {state:null,conflicts:[e.message]};}
}
export class CloudSync {
 constructor(hooks){Object.assign(this,hooks);this.rev=0;this.ready=false;this.saving=false;this.blocked=false;this.generation=0;this.documentId='main';this.baseState=null;this.pendingRemote=null;}
 async init(config){
  const base='https://www.gstatic.com/firebasejs/13.1.0/';
  const [a,b,c]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
  this.b=b;this.c=c;const app=a.initializeApp(config);this.auth=b.getAuth(app);this.db=c.getFirestore(app);b.onAuthStateChanged(this.auth,user=>this.attach(user));
 }
 selectDocument(id){if(!['main','jilcce',null].includes(id))throw new Error('Unknown tracker document.');if(this.saving)throw new Error('Wait for cloud save to finish.');this.documentId=id;this.attach(this.user||null);}
 attach(user){
  const c=this.c,gen=++this.generation;this.unsub?.();this.unsub=null;this.ready=false;this.blocked=false;this.remote=null;this.latest=null;this.pendingRemote=null;
  this.user=user;this.account(user);this.rev=0;this.baseState=null;
  if(!user){this.status('Sign in with Google to open your syllabuses');return;}
  if(!this.documentId){this.status('Signed in · choose a syllabus');return;}
  try{const cached=this.cachedBase?.();if(cached){this.validateRemote?.(cached);this.baseState=clone(validate(cached));}}catch{this.baseState=null;}
  this.status('Connecting to private cloud…');this.ref=c.doc(this.db,'users',user.uid,'tracker',this.documentId);
  this.startListener=()=>c.onSnapshot(this.ref,{includeMetadataChanges:true},snap=>{
   if(gen!==this.generation||snap.metadata.hasPendingWrites||snap.metadata.fromCache)return;
   const data=snap.exists()?snap.data():{revision:0,payload:null};
   if(this.saving){this.latest=data;return;}this.receive(data);
  },e=>{if(gen===this.generation){this.ready=false;this.status('Cloud error: '+(e.code||e.message)+' · local saved');}});
  this.unsub=this.startListener();
 }
 parsed(data){
  if(!Number.isInteger(data.revision)||data.revision<0)throw new Error('Invalid cloud revision');
  if(data.payload===null)return null;
  const s=validate(JSON.parse(data.payload));this.validateRemote?.(s);return s;
 }
 matchesState(s){return equivalent(this.getState?.(),s);}
 baseline(s){this.baseState=s?clone(s):null;this.saveBaseline?.();}
 receive(data){
  let remote;try{remote=this.parsed(data);}catch(e){this.blocked=true;this.status('Cloud data invalid · export local backup');return;}
  const first=!this.ready,cached=first?this.cachedRevision():this.rev;this.ready=true;
  const newest=Math.max(this.rev,this.remote?.revision||0,this.pendingRemote?.revision||0);if(!first&&remote!==null&&data.revision<newest)return;
  if(!first&&!this.blocked&&data.revision<=this.rev&&!(remote===null&&this.rev>0))return;
  // A matching payload is a confirmation, not a conflict (timestamps are incidental).
  if(remote&&equivalent(this.getState?.(),remote)){
   this.rev=data.revision;this.blocked=false;this.remote=null;this.pendingRemote=null;this.baseline(remote);this.ack(this.getEpoch());this.status('Synced · same data on both devices');return;
  }
  if(this.blocked){if(!this.remote||data.revision>=this.remote.revision)this.conflict(data);return;}
  if(!remote){
   if(cached>0||(!first&&this.rev>0)){this.conflict(data);return;}
   this.rev=data.revision;this.baseline(null);if(!this.isDirty())this.forceDirty();this.status('Cloud connected · local changes pending');this.schedule();return;
  }
  // Unsaved editor content stays untouched. Save/Cancel resumes synchronization.
  if(this.isEditing()){
   if(!this.pendingRemote||data.revision>=this.pendingRemote.revision)this.pendingRemote=data;
   if(first)this.rev=cached;this.status('Cloud update waiting · Save or Cancel your changes');this.schedule(10000);return;
  }
  this.pendingRemote=null;
  if(!this.isDirty()){
   this.rev=data.revision;this.baseline(remote);this.apply(clone(remote));this.status('Synced · cloud loaded');return;
  }
  if(first&&cached===data.revision){this.rev=data.revision;this.baseline(remote);this.status('Cloud connected · local changes pending');this.schedule();return;}
  const merged=mergeTracker(this.baseState,this.getState(),remote);
  if(!merged.state){this.conflict(data);return;}
  this.rev=data.revision;this.baseline(remote);this.apply(merged.state,true);
  if(equivalent(merged.state,remote)){this.status('Synced · cloud loaded');return;}
  this.forceDirty();this.status('Combined changes from both devices · saving…');this.schedule();
 }
 conflict(data){this.pendingRemote=null;this.remote=data;this.blocked=true;this.status('Conflict · same item changed on two devices; open Account');}
 async push(){
  if(!this.user||!this.ready||this.saving)return;
  if(this.pendingRemote){if(this.isEditing()){this.status('Cloud update waiting · Save or Cancel your changes');this.schedule(10000);return;}const next=this.pendingRemote;this.pendingRemote=null;this.receive(next);}
  if(this.blocked||!this.isDirty())return;
  if(!navigator.onLine){this.status('Offline · saved locally, cloud pending');return;}
  const gen=this.generation,state=clone(validate(this.getState())),payload=JSON.stringify(state),epoch=this.getEpoch(),expected=this.rev,ref=this.ref;
  this.saving=true;this.status('Saving to cloud…');
  try{
   await this.c.runTransaction(this.db,async tx=>{const snap=await tx.get(ref),remote=snap.exists()?snap.data():{revision:0,payload:null};if(remote.revision!==expected){const e=new Error('conflict');e.remote=remote;throw e;}tx.set(ref,{payload,revision:expected+1,updatedAt:this.c.serverTimestamp()});});
   if(gen!==this.generation)return;this.rev=expected+1;this.baseline(state);this.ack(epoch);this.status(this.isDirty()?'New changes pending…':'Synced · '+new Date().toLocaleTimeString());
  }catch(e){if(gen!==this.generation)return;if(e.remote)this.receive(e.remote);else this.status('Cloud pending: '+(e.code||e.message)+' · local saved');}
  finally{this.saving=false;if(gen===this.generation){const next=this.latest;this.latest=null;if(next)this.receive(next);if((this.isDirty()||this.pendingRemote)&&!this.blocked)this.schedule(10000);}}
 }
 async resolve(useLocal){
  if(!this.remote)return;if(this.isEditing())throw new Error('Save or Cancel your current changes first.');
  const data=this.remote,remote=this.parsed(data);this.rev=data.revision;this.remote=null;this.blocked=false;this.pendingRemote=null;this.baseline(remote);
  if(useLocal){this.forceDirty();this.schedule();}else{if(remote)this.apply(clone(remote));else{if(this.emptyState)this.apply(this.emptyState());this.forceDirty();}this.schedule();}
 }
 async retry(){if(this.user&&!this.ready&&this.startListener){this.unsub?.();this.unsub=this.startListener();}else await this.push();}
 async login(){if(this.saving)throw new Error('Wait for cloud save to finish.');await this.b.signInWithPopup(this.auth,new this.b.GoogleAuthProvider());}
 async logout(){if(this.saving)throw new Error('Wait for cloud save to finish.');await this.b.signOut(this.auth);}
}
