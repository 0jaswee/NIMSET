import {descendants,today,uid,setCompletion} from './model.js';

export function validateQuiz(q){
 if(!q||typeof q.id!=='string'||!/^[\w-]{1,100}$/.test(q.id)||typeof q.question!=='string'||!q.question.trim()||q.question.length>10000||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>typeof x!=='string'||!x.trim()||x.length>3000)||!Number.isInteger(q.correct)||q.correct<0||q.correct>3||typeof q.solution!=='string'||q.solution.length>50000)throw new Error('Enter a question, four options, a correct answer and a solution within the size limits.');
 return q;
}
export function practiceQuestions(nodes,id,random=Math.random){
 const ids=new Set(descendants(nodes,id));
 const questions=nodes.filter(n=>ids.has(n.id)).flatMap(n=>(n.quizzes||[]).map(q=>({...structuredClone(q),topic:n.title,topicId:n.id})));
 for(let i=questions.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[questions[i],questions[j]]=[questions[j],questions[i]];}
 return questions;
}
export function completeWithTask(s,id,done,date=today()){
 setCompletion(s.nodes,id,done);
 if(!done)return;
 const n=s.nodes.find(n=>n.id===id),existing=s.plans.find(p=>p.nodeId===id&&p.date===date);
 if(existing)existing.done=true;
 else s.plans.push({id:uid(),title:n.title.slice(0,1000),date,minutes:1,nodeId:id,done:true,automatic:true});
}
export function recordVideoSeconds(s,id,seconds,date=today()){
 if(!Number.isFinite(seconds)||seconds<=0||seconds>60)throw new Error('Invalid playback interval.');
 const n=s.nodes.find(n=>n.id===id);if(!n)throw new Error('Topic not found.');
 const title=('Video: '+n.title).slice(0,1000);
 let log=s.sessions.find(x=>x.automaticVideo&&x.nodeId===id&&x.date===date);
 if(!log){log={id:uid(),date,title,minutes:seconds/60,automaticVideo:true,nodeId:id};s.sessions.push(log);}
 else log.minutes=Math.min(1440,log.minutes+seconds/60);
}
export function youtubeId(value){try{const u=new URL(value);let id=null;if(['youtu.be','www.youtu.be'].includes(u.hostname))id=u.pathname.slice(1);else if(['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(u.hostname))id=u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];return /^[a-zA-Z0-9_-]{11}$/.test(id||'')?id:null;}catch{return null;}}
