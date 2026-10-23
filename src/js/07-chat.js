/* ---- chat ---- */
function bubble(m,i,L){const mine=m.sender===uid(),pr=L[i-1],nx=L[i+1],gp=pr&&pr.sender===m.sender&&+new Date(m.created_at)-+new Date(pr.created_at)<120000,gn=nx&&nx.sender===m.sender&&+new Date(nx.created_at)-+new Date(m.created_at)<120000;
  const g=!gp&&!gn?"":gp&&gn?" g2":gp?" g1":" g3";let c="";
  const rq=m.reply_to&&L.find(z=>String(z.id)===String(m.reply_to));if(rq)c+=`<div class="rp">${esc(prev(rq).replace(/^You: /,""))}</div>`;
  if(m.kind==="img")c+=`<img alt="Photo" src="${esc(m.body)}" data-a="img:${m.id}">`;
  else if(m.kind==="voice")c+=`<div class="vc"><button class="vp" data-a="vplay:${m.id}" aria-label="Play voice note">${ic("play")}</button><span class="vbar"><i id="vb${m.id}"></i></span><small id="vt${m.id}">${vFmt(vDur(m.body))}</small></div>`;
  else if(m.kind==="song"){const d=songOf(m);c+=`<div class="sg"><i style="${d.img?`background-image:url(${esc(d.img)})`:""}"></i><span><b>${esc(d.t||"Song")}</b><small>${esc(d.a||"")}</small></span></div>`}
  else c+=esc(m.body);
  const rx=Object.values(m.rx||{});const rxh=rx.length?`<div class="rx">${[...new Set(rx)].map(e=>`<span>${e}${rx.filter(z=>z===e).length>1?" "+rx.filter(z=>z===e).length:""}</span>`).join("")}</div>`:"";
  const tk=!mine||isG(S.chat)?"":m.st==="sending"?ic("note","tk"):m.read_at?ic("tk2","tk rd"):ic("tk","tk");
  const last=!gn,left=DAY-(Date.now()-+new Date(m.created_at));
  return`<div class="m ${mine?"me":"th"}${g}" data-mid="${m.id}">${isG(S.chat)&&!mine&&!gp?`<div class="sn">${esc(nm(S.prof[m.sender]))}</div>`:""}<div class="bb${m.kind==="img"?" im":""}${m.st==="fail"?" bad":""}" data-lp="${m.id}">${c}</div>${rxh}${last?`<div class="mm">${tm(m.created_at)}${tk}${left<4*36e5?`<span class="vn">· vanishes in ${Math.max(1,Math.ceil(left/36e5))}h</span>`:""}${m.st==="fail"?" · Tap to retry":""}</div>`:""}</div>`}
function msgsHtml(){const L=S.fq?S.msgs.filter(m=>m.kind=="text"&&m.body.toLowerCase().includes(S.fq)):S.msgs;let h='<div class="dis">Messages disappear after 24 hours. Photos and songs too.</div>',day="";
  L.forEach((m,i)=>{const d=dayL(new Date(m.created_at));if(d!==day){day=d;h+=`<div class="dv">${d}</div>`}h+=bubble(m,i,L)});return h}
function subText(){const f=S.chat;if(isG(f))return gSub(f);const sh=S.sh[f];if((S.typ[f]||0)>Date.now())return'<small class="ty">typing…</small>';return live(sh)&&sh.np.t?`<small>♪ ${esc(sh.np.t)}</small>`:`<small>@${esc((S.prof[f]||{}).username||"")}</small>`}
function chatPaint(full){const el=$("chat");if(!el)return;const f=S.chat,p=S.prof[f],G=isG(f)?gOf(f):null;
  if(full)chatTint(f);
  if(S.view==="prof"){el.innerHTML=`<div class="hd ov"><button class="ib" data-a="closeprof" aria-label="Back">${ic("back")}</button></div>${profV(f)}`;return}
  if(full||!$("msgs")){el.innerHTML=`<div class="hd"><button class="ib" data-a="close" aria-label="Back">${ic("back")}</button><button class="who" data-a="${G?"ginfo":"prof"}:${f}" aria-label="${G?"Group info":"Open profile"}">${G?gav(G,40):av(p,40)}<span style="min-width:0"><b>${esc(G?G.name:nm(p))}</b><span id="sub">${subText()}</span></span></button><button class="ib" data-a="csearch" aria-label="Search this chat">${ic("search")}</button></div><div id="fb"></div>
<div class="msgs" id="msgs" role="log" aria-live="polite"></div><div class="comp"><div id="rpb"></div><div class="cb"><button class="ib" data-a="photo" aria-label="Photo">${ic("img")}</button><button class="ib" id="mic" data-a="mic" aria-label="Record a voice note">${ic("mic")}</button><button class="ib" data-a="song" aria-label="Send the song I'm playing">${ic("note")}</button><textarea id="t" rows="1" placeholder="Type a message…" maxlength="2000"></textarea><button class="sendb" id="sb" data-a="send" disabled aria-label="Send">${ic("send")}</button></div></div><input type="file" id="pf" accept="image/*" hidden>`;
    el.__t=0;if(S.finding)fbPaint()}
  const ms=$("msgs"),near=ms.scrollHeight-ms.scrollTop-ms.clientHeight<140||full;ms.innerHTML=msgsHtml();if(near)ms.scrollTop=ms.scrollHeight;
  rpbPaint()}
function rpbPaint(){const r=$("rpb");if(!r)return;
  r.innerHTML=S.rec?`<div class="rpb"><span class="recdot"></span><span id="rt">${vFmt((Date.now()-S.rec.t0)/1000)}</span><span style="flex:1">Recording… tap mic to send</span><button data-a="mcancel" aria-label="Cancel recording">${ic("x")}</button></div>`
    :S.reply?`<div class="rpb">${ic("reply")}<span>${esc(prev(S.reply).replace(/^You: /,""))}</span><button data-a="norep" aria-label="Cancel">${ic("x")}</button></div>`:"";
  const m=$("mic");if(m)m.classList.toggle("rec",!!S.rec)}
function fbPaint(){const e=$("fb");if(e)e.innerHTML=S.finding?`<div class="fbar"><input class="in" id="fq" placeholder="Search this chat" value="${esc(S.fq||"")}" autocomplete="off"><button class="ib" data-a="find" aria-label="Close search">${ic("x")}</button></div>`:""}
function subPaint(){const e=$("sub");if(e&&S.view==="chat")e.innerHTML=subText()}
async function openChat(f){if(isG(f))return openGroup(f);if(!S.prof[f])return;S.chat=f;S.view="chat";S.msgs=[];S.reply=null;S.unread[f]=0;badge();
  const el=$("chat");if(!el)return;el.hidden=false;chatPaint(true);rtJoinChat();
  try{const r=await api("/rest/v1/messages?select=id,sender,rcpt,kind,body,bytes,created_at,read_at,reply_to,rx&chat=eq."+encodeURIComponent(chatId(f))+"&created_at=gt."+encodeURIComponent(new Date(Date.now()-DAY).toISOString())+"&order=created_at.asc&limit=300");
    if(S.chat!==f)return;S.msgs=(S.msgs.filter(m=>m.tmp)).concat(r||[]).sort((a,b)=>+new Date(a.created_at)-+new Date(b.created_at));chatPaint(true);markRead()}catch(e){toast(errMsg(e))}}
function closeChat(){if(S.rec)vCancel();if(VA){VA.a.pause();VA=null}if(S.chat)rtLeaveChat();S.chat=null;S.view="";S.reply=null;S.finding=0;S.fq="";const el=$("chat");if(el){el.hidden=true;el.innerHTML=""}load(true)}
async function markRead(){const f=S.chat;if(!f||isG(f))return;const un=S.msgs.filter(m=>m.sender===f&&!m.read_at);if(!un.length)return;const at=new Date().toISOString();un.forEach(m=>m.read_at=at);
  try{await api("/rest/v1/messages?rcpt=eq."+uid()+"&sender=eq."+f+"&read_at=is.null",{m:"PATCH",h:{Prefer:"return=minimal"},b:{read_at:at}})}catch(e){un.forEach(m=>m.read_at=null)}}
let tmpN=0;
async function send(kind,body){const f=S.chat;if(!f||!body)return;const rp=S.reply;S.reply=null;
  const m={id:"t"+(++tmpN),tmp:1,st:"sending",sender:uid(),rcpt:f,kind,body,created_at:new Date().toISOString(),read_at:null,reply_to:rp&&!rp.tmp?rp.id:null,rx:{}};
  S.msgs.push(m);S.last[f]={sender:uid(),rcpt:f,kind,pv:kind==="text"?body.slice(0,80):kind==="song"?body.slice(0,300):null,body,created_at:m.created_at};if(isG(f)){S.glast[gid(f)]=S.last[f];delete S.last[f]}chatPaint();
  await post(m)}
async function post(m){m.st="sending";try{const G=isG(m.rcpt),b=G?{gid:gid(m.rcpt),kind:m.kind,body:m.body}:{rcpt:m.rcpt,kind:m.kind,body:m.body};if(m.reply_to)b.reply_to=m.reply_to;
    const r=await api("/rest/v1/"+(G?"group_msgs":"messages")+"?select=id,created_at,bytes",{m:"POST",h:{Prefer:"return=representation"},b});const row=Array.isArray(r)?r[0]:r;
    if(S.msgs.includes(m)){if(S.msgs.some(z=>String(z.id)===String(row.id)&&z!==m))S.msgs=S.msgs.filter(z=>z!==m);else{m.id=row.id;m.created_at=row.created_at;m.tmp=0;m.st=""}}}
  catch(e){m.st="fail";toast(errMsg(e))}if(S.chat===m.rcpt)chatPaint()}
