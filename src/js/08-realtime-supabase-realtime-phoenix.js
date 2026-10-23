/* ---- realtime (Supabase Realtime, Phoenix protocol); polls when it isn't available ---- */
const RT={ws:null,open:0,live:0,ref:0,hb:0,rc:0,joined:{},chat:"",ts:0};
const rtT=n=>"realtime:"+n;
function rtSend(o){try{if(RT.ws&&RT.ws.readyState===1){o.ref=o.ref||String(++RT.ref);RT.ws.send(JSON.stringify(o))}}catch(e){}}
function rtConnect(){if(RT.ws||!C||!window.WebSocket||navigator.onLine===false)return;let ws;
  try{ws=new WebSocket(SBC.url.replace(/^http/,"ws")+"/realtime/v1/websocket?apikey="+encodeURIComponent(SBC.key)+"&vsn=1.0.0")}catch(e){return}
  RT.ws=ws;
  ws.onopen=()=>{RT.open=1;RT.rc=0;clearInterval(RT.hb);RT.hb=setInterval(()=>rtSend({topic:"phoenix",event:"heartbeat",payload:{}}),25000);
    RT.joined["milo-inbox"]={broadcast:{self:false},presence:{key:""},postgres_changes:[{event:"*",schema:"public",table:"messages"},{event:"*",schema:"public",table:"friendships"},{event:"*",schema:"public",table:"shared"},{event:"*",schema:"public",table:"group_msgs"},{event:"*",schema:"public",table:"group_members"},{event:"*",schema:"public",table:"groups"}]};
    Object.keys(RT.joined).forEach(n=>rtSend({topic:rtT(n),event:"phx_join",payload:{config:RT.joined[n],access_token:C.at}}))};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch(x){return}
    if(m.event==="phx_reply"&&m.topic===rtT("milo-inbox")){RT.live=!!(m.payload&&m.payload.status==="ok");if(RT.live)load(true);return}
    if(m.event==="postgres_changes"){try{rtChange(m.payload&&m.payload.data)}catch(x){}return}
    if(m.event==="broadcast"&&RT.chat&&m.topic===rtT(RT.chat)){const p=m.payload;if(p&&p.event==="typing"){const u=p.payload&&p.payload.uid;if(u&&u!==uid()){S.typ[u]=Date.now()+4200;subPaint();setTimeout(subPaint,4300)}}}};
  ws.onclose=()=>{if(RT.ws===ws){RT.ws=null;RT.open=0;RT.live=0;clearInterval(RT.hb);setTimeout(rtConnect,Math.min(30000,1000*Math.pow(2,RT.rc++)))}};
  ws.onerror=()=>{try{ws.close()}catch(e){}}}
function rtJoinChat(){const n="milo-chat-"+(isG(S.chat)?S.chat:chatId(S.chat)).replace(/:/g,"_");if(RT.chat&&RT.chat!==n)rtLeaveChat();RT.chat=n;RT.joined[n]={broadcast:{self:false},presence:{key:""}};if(RT.open)rtSend({topic:rtT(n),event:"phx_join",payload:{config:RT.joined[n],access_token:C.at}})}
function rtLeaveChat(){if(!RT.chat)return;delete RT.joined[RT.chat];rtSend({topic:rtT(RT.chat),event:"phx_leave",payload:{}});RT.chat=""}
setInterval(()=>{if(RT.open&&C)refresh().then(()=>Object.keys(RT.joined).forEach(n=>rtSend({topic:rtT(n),event:"access_token",payload:{access_token:C.at}})))},240000);
function rtChange(d){if(!d||!C)return;const t=d.table,r=d.record||{},o=d.old_record||{},me=uid();
  if(t==="group_msgs"||t==="group_members"||t==="groups")return gChange(t,d,r,o);
  if(t==="messages"){
    if(d.type==="INSERT"){const other=r.sender===me?r.rcpt:r.sender;
      if(S.chat===other){if(!S.msgs.some(z=>String(z.id)===String(r.id))){const tmp=r.sender===me&&S.msgs.find(z=>z.tmp&&z.body===r.body&&z.kind===r.kind);if(tmp){tmp.id=r.id;tmp.created_at=r.created_at;tmp.tmp=0;tmp.st=""}else S.msgs.push(r);chatPaint();if(r.sender!==me)markRead()}}
      S.last[other]=r;
      if(r.sender!==me){if(S.chat!==other||document.hidden){S.unread[other]=(S.unread[other]||0)+1;if(!document.hidden||S.chat!==other)inPill(other,r)}}
      badge();if(!S.chat)paint();else if(S.chat!==other)paintUnder()}
    else if(d.type==="UPDATE"){const m=S.msgs.find(z=>String(z.id)===String(r.id));if(m){m.read_at=r.read_at;m.rx=r.rx||{};chatPaint()}}
    else if(d.type==="DELETE"){const id=o.id||r.id;const n=S.msgs.length;S.msgs=S.msgs.filter(z=>String(z.id)!==String(id));if(n!==S.msgs.length)chatPaint();load(true)}}
  else if(t==="friendships"){load(true).then(()=>{const a=r.a||o.a,b=r.b||o.b,other=a===me?b:a,p=S.prof[other]||{};
      if(d.type==="INSERT"&&r.b===me)inPill(other,{kind:"text",body:"sent you a friend request",sender:other},"friends");
      else if(d.type==="UPDATE"&&r.status==="accepted"&&r.a===me)inPill(other,{kind:"text",body:"accepted your friend request",sender:other})})}
  else if(t==="shared"){const id=r.user_id;if(id===me){ownNp(true);return}if(id&&id!==me&&S.fr.includes(id)){const c=S.sh[id]||(S.sh[id]={user_id:id});["np","np_at"].forEach(k=>{if(k in r)c[k]=r[k]});if(S.chat===id)subPaint();else if(!S.chat&&S.tab==="home"&&!document.querySelector("input:focus"))paint()}}}
function paintUnder(){/* chat open on top: refresh the lists behind it quietly */const keep=S.chat,v=S.view;const a=$("app");if(!a)return;const sc=document.querySelector(".scroll");const y=sc?sc.scrollTop:0;
  const ch=$("chat"),cur=ch&&ch.innerHTML;paint();const c2=$("chat");if(c2&&keep){c2.hidden=false}const s2=document.querySelector(".scroll");if(s2)s2.scrollTop=y}
let pt=0;function inPill(id,m,act){const G=isG(id)?gOf(id):null,p=G||S.prof[id]||{};if(S.chat===id&&!document.hidden)return;const a=$("app");if(!a)return;document.querySelectorAll(".inpill").forEach(e=>e.remove());
  const e=document.createElement("button");e.className="inpill";e.dataset.a=act==="friends"?"friendsgo":"chat:"+id;e.innerHTML=`${G?gav(G,40):av(p,40)}<span class="tx"><b>${esc(G?G.name:nm(p))}</b><small>${esc((G&&m.sender?nm(S.prof[m.sender])+": ":"")+(m.kind==="text"?m.body:prev(m).replace(/^You: /,"")))}</small></span>`;a.appendChild(e);clearTimeout(pt);pt=setTimeout(()=>e.remove(),4500)}
setInterval(()=>{if(C&&S.me&&!RT.live&&!document.hidden){load(true);if(S.chat&&S.view==="chat")pollChat()}},8000);
async function pollChat(){const f=S.chat;if(isG(f))return gPoll(f);try{const r=await api("/rest/v1/messages?select=id,sender,rcpt,kind,body,bytes,created_at,read_at,reply_to,rx&chat=eq."+encodeURIComponent(chatId(f))+"&created_at=gt."+encodeURIComponent(new Date(Date.now()-DAY).toISOString())+"&order=created_at.asc&limit=300");
    if(S.chat!==f||!r)return;const tmp=S.msgs.filter(m=>m.tmp);if(JSON.stringify(r.map(m=>[m.id,m.read_at,m.rx]))!==JSON.stringify(S.msgs.filter(m=>!m.tmp).map(m=>[m.id,m.read_at,m.rx]))){S.msgs=r.concat(tmp);chatPaint();markRead()}}catch(e){}}
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&C&&S.me){load(true);if(S.chat)pollChat()}});
addEventListener("online",()=>{rtConnect();load(true)});
