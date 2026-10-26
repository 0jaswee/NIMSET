import {validate} from './model.js';
// One private revisioned document. Transactions reject stale writes; never silently overwrite another device.
export class CloudSync {
 constructor(hooks){Object.assign(this,hooks);this.rev=0;this.ready=false;this.saving=false;this.blocked=false;this.generation=0;}
 async init(config){
  const base='https://www.gstatic.com/firebasejs/13.1.0/';
  const [a,b,c]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);
  this.b=b;this.c=c;const app=a.initializeApp(config);this.auth=b.getAuth(app);this.db=c.getFirestore(app);
  b.onAuthStateChanged(this.auth,async user=>{
   const gen=++this.generation;this.unsub?.();this.ready=false;this.blocked=false;this.remote=null;this.latest=null;this.rev=0;
   this.user=user;this.account(user);if(!user){this.status('Local only · Google sign-in needed');return;}
   this.status('Connecting to private cloud…');this.ref=c.doc(this.db,'users',user.uid,'tracker','main');
   this.startListener=()=>c.onSnapshot(this.ref,{includeMetadataChanges:true},snap=>{
    if(gen!==this.generation||snap.metadata.hasPendingWrites||snap.metadata.fromCache)return;
    const data=snap.exists()?snap.data():{revision:0,payload:null};
    if(!Number.isInteger(data.revision)||data.revision<0){this.blocked=true;this.status('Cloud revision invalid · export local backup');return;}
    try{if(data.payload)validate(JSON.parse(data.payload));}catch(e){this.blocked=true;this.status('Cloud data invalid · export local backup');return;}
    if(this.saving){this.latest=data;return;}this.receive(data);
   },e=>{if(gen===this.generation){this.ready=false;this.status('Cloud error: '+(e.code||e.message)+' · local saved');}});
   this.unsub=this.startListener();
  });
 }
 receive(data){
  if(!this.ready){this.ready=true;const cached=this.cachedRevision();this.rev=data.revision;
   if(data.payload){if(this.isDirty()&&cached!==data.revision){this.conflict(data);return;}if(!this.isDirty()){if(this.isEditing()){this.conflict(data);return;}this.apply(JSON.parse(data.payload));}}else if(!this.isDirty()){this.forceDirty();}this.status(this.isDirty()?'Cloud connected · local changes pending':'Synced · cloud loaded');this.schedule();return;
  }
  if(this.blocked){this.conflict(data);return;}
  if(data.payload===null&&this.rev>0){this.conflict(data);return;}
  if(data.revision<=this.rev)return;
  if(this.isDirty()||this.isEditing()){this.conflict(data);return;}
  this.rev=data.revision;this.apply(JSON.parse(data.payload));this.status('Synced · '+new Date().toLocaleTimeString());
 }
 conflict(data){this.remote=data;this.blocked=true;this.status('Conflict · choose a version in Account');}
 async push(){
  if(!this.user||!this.ready||this.blocked||this.saving||!this.isDirty())return;
  if(!navigator.onLine){this.status('Offline · saved locally, cloud pending');return;}
  const gen=this.generation,payload=JSON.stringify(validate(this.getState())),epoch=this.getEpoch(),expected=this.rev,ref=this.ref;
  this.saving=true;this.status('Saving to cloud…');
  try{await this.c.runTransaction(this.db,async tx=>{const snap=await tx.get(ref);const remote=snap.exists()?snap.data():{revision:0,payload:null};if(remote.revision!==expected){const e=new Error('conflict');e.remote=remote;throw e;}tx.set(ref,{payload,revision:expected+1,updatedAt:this.c.serverTimestamp()});});
   if(gen!==this.generation)return;this.rev=expected+1;this.ack(epoch);this.status(this.isDirty()?'New changes pending…':'Synced · '+new Date().toLocaleTimeString());
  }catch(e){if(gen!==this.generation)return;if(e.remote)this.conflict(e.remote);else this.status('Cloud pending: '+(e.code||e.message)+' · local saved');}
  finally{this.saving=false;if(gen===this.generation){const next=this.latest;this.latest=null;if(next)this.receive(next);if(this.isDirty()&&!this.blocked)this.schedule(10000);}}
 }
 async resolve(useLocal){if(!this.remote)return;const remote=this.remote;this.rev=remote.revision;this.remote=null;this.blocked=false;if(useLocal){this.forceDirty();this.schedule();}else{if(remote.payload)this.apply(JSON.parse(remote.payload));else {if(this.emptyState)this.apply(this.emptyState());this.forceDirty();}this.schedule();}}
 async retry(){if(this.user&&!this.ready&&this.startListener){this.unsub?.();this.unsub=this.startListener();}else await this.push();}
 async login(){if(this.saving)throw new Error('Wait for cloud save to finish.');await this.b.signInWithPopup(this.auth,new this.b.GoogleAuthProvider());}
 async logout(){if(this.saving)throw new Error('Wait for cloud save to finish.');await this.b.signOut(this.auth);}
}
