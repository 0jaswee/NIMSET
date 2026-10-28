import {youtubeId} from './study.js';
let apiPromise;
function youtubeAPI(){
 if(window.YT?.Player)return Promise.resolve(window.YT);
 if(!apiPromise)apiPromise=new Promise((resolve,reject)=>{
  const prior=window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady=()=>{prior?.();resolve(window.YT);};
  const script=document.createElement('script');script.src='https://www.youtube.com/iframe_api';script.onerror=()=>{apiPromise=null;reject(new Error('YouTube could not load. Check your connection and retry.'));};document.head.appendChild(script);
 });return apiPromise;
}
export function createVideoPlayer({onSeconds,onError}){
 let player,dock,interval,observer,nodeId,links=[],index=0,last=0,pending=0,playing=false,generation=0;
 function flush(){if(pending<=0||!nodeId)return;const seconds=pending;pending=0;try{onSeconds(nodeId,seconds);}catch(e){pending+=seconds;onError(e.message);}}
 function tick(){const now=performance.now();if(playing&&!document.hidden){const delta=(now-last)/1000;if(delta>0&&delta<3)pending+=delta;}last=now;if(pending>=10)flush();}
 function stop(){tick();playing=false;flush();}
 function close(){stop();generation++;clearInterval(interval);observer?.disconnect();player?.destroy();player=null;dock?.remove();dock=null;document.body.classList.remove('watching');document.documentElement.style.setProperty('--video-height','0px');}
 async function open(n,selected=0){
  close();nodeId=n.id;links=n.links.filter(l=>l.type==='youtube'&&youtubeId(l.url));index=selected;
  if(!links.length)throw new Error('Add a valid YouTube video link first.');
  dock=document.createElement('section');dock.className='video-dock';dock.setAttribute('aria-label','Study video player');
  dock.innerHTML='<div class="video-frame"><div id="study-youtube"></div><div class="video-chooser" hidden></div></div><div class="video-controls"><button data-v="back">−30 sec</button><button data-v="forward">+30 sec</button><label>Speed <select aria-label="Playback speed"><option>1</option></select></label><button data-v="choose">Videos</button><button data-v="close" aria-label="Close video">×</button></div><p class="video-status" role="status">Loading YouTube…</p>';
  document.body.prepend(dock);document.body.classList.add('watching');
  observer=new ResizeObserver(()=>document.documentElement.style.setProperty('--video-height',dock.offsetHeight+'px'));observer.observe(dock);
  setTimeout(()=>document.querySelector('#inline-notes')?.scrollIntoView({block:'start',behavior:'smooth'}),100);
  const chooser=dock.querySelector('.video-chooser');
  links.forEach((l,i)=>{const b=document.createElement('button');b.textContent=l.label||`Video ${i+1}`;b.onclick=()=>{stop();index=i;player?.loadVideoById(youtubeId(l.url));chooser.hidden=true;};chooser.appendChild(b);});
  dock.querySelector('[data-v="close"]').onclick=close;
  dock.querySelector('[data-v="choose"]').onclick=()=>chooser.hidden=!chooser.hidden;
  for(const [action,seconds] of [['back',-30],['forward',30]])dock.querySelector(`[data-v="${action}"]`).onclick=()=>player?.seekTo(Math.max(0,(player.getCurrentTime()||0)+seconds),true);
  const speed=dock.querySelector('select');speed.onchange=()=>player?.setPlaybackRate(Number(speed.value));
  const gen=generation;
  try{const YT=await youtubeAPI();if(gen!==generation)return;
   player=new YT.Player('study-youtube',{videoId:youtubeId(links[index].url),width:'100%',height:'100%',playerVars:{playsinline:1,origin:location.origin},events:{
    onReady:()=>{dock.querySelector('.video-status').textContent='Study time counts while this tab is visible and the video plays.';speed.replaceChildren(...player.getAvailablePlaybackRates().map(rate=>{const o=document.createElement('option');o.value=rate;o.textContent=rate+'×';o.selected=rate===1;return o;}));},
    onStateChange:e=>{tick();playing=e.data===1;last=performance.now();if(!playing)flush();},
    onError:()=>{stop();onError('This video cannot be embedded. Open its original link or choose another video.');dock.querySelector('.video-status').textContent='Playback unavailable. Use the original YouTube link in Notes & Links.';}
   }});last=performance.now();interval=setInterval(tick,1000);
  }catch(e){if(gen===generation){dock.querySelector('.video-status').textContent=e.message;onError(e.message);}}
 }
 window.addEventListener('pagehide',()=>{stop();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();player?.pauseVideo();}last=performance.now();});
 return {open,close,flush};
}
