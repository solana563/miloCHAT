/* ---- state ---- */
const S={groups:[],gm:{},glast:{},gun:{},gOff:0,me:null,tab:"home",seg:"friends",fr:[],inc:[],out:[],since:{},prof:{},sh:{},last:{},unread:{},chat:null,view:"",msgs:[],reply:null,found:undefined,err:"",ready:0,auth:{up:0,err:"",busy:0},pu:LS.get("mc.push",0),typ:{}};
const uid=()=>C&&C.id;
const isG=k=>typeof k==="string"&&k.startsWith("g:"),gid=k=>String(k).slice(2);/* group chats use the key "g:<group id>" wherever a friend's id would go */
const chatId=f=>[uid(),f].sort().join(":");
const hs=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)};
const PSEL="id,username,name,av,cover";let PS=PSEL;
const COLS=["249,156,0","74,144,226","226,87,129","80,190,150","150,110,230","230,120,60"];
function av(p,sz){p=p||{};const a=p.av||{},s=`width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.4)}px`;
  if(a.t==="img"&&a.u)return`<span class="av" style="${s}"><img alt="" src="${esc(a.u)}"></span>`;
  const c=a.t==="color"&&a.c?a.c:COLS[hs(p.username||p.id||"x")%6];
  return`<span class="av" style="${s};background:linear-gradient(145deg,rgba(${c},1),rgba(${c},.6))">${esc((p.name||p.username||"?").trim().charAt(0).toUpperCase())}</span>`}
const nm=p=>p?(p.name||p.username||"Friend"):"Friend";
const tm=d=>new Date(d).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
const dayL=d=>{const n=new Date(),y=new Date(n.getTime()-DAY);return d.toDateString()===n.toDateString()?"Today":d.toDateString()===y.toDateString()?"Yesterday":d.toLocaleDateString([],{day:"numeric",month:"short"})};
const stamp=iso=>{const d=new Date(iso);return d.toDateString()===new Date().toDateString()?tm(d):dayL(d)};
const live=s=>s&&s.np&&s.np.p&&s.np_at&&Date.now()-new Date(s.np_at).getTime()<240000;
function songOf(m){try{return JSON.parse(m.body)}catch(e){return{}}}
function prev(m){if(!m)return"";const pre=m.sender===uid()?"You: ":"";if(m.kind==="img")return pre+"📷 Photo";if(m.kind==="voice")return pre+"🎤 Voice message";
  if(m.kind==="song"){const x=/"t":"((?:[^"\\]|\\.)*)/.exec(m.pv||m.body||"");let t="Song";try{if(x)t=JSON.parse('"'+x[1]+'"')}catch(e){t=x?x[1]:"Song"}return pre+"♪ "+t}
  return pre+(m.pv!=null?m.pv:String(m.body||"").slice(0,80))}
let tt=0;function toast(t){const e=$("toast");if(!e)return;e.textContent=t;e.classList.add("on");clearTimeout(tt);tt=setTimeout(()=>e.classList.remove("on"),2800)}
