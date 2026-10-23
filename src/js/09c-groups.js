/* ---- group chats: up to 20 friends, same message types as one-to-one chats. A group is the chat key "g:<id>". ---- */
const mtab=()=>isG(S.chat)?"group_msgs":"messages";
const gOf=k=>S.groups.find(g=>g.id===gid(k));
const GR=()=>LS.get("mc.gread",{});
function gMark(id){const r=GR();r[id]=new Date().toISOString();LS.set("mc.gread",r)}
function gav(G,sz){const c=COLS[hs(G.id)%6],w=G.name.trim().split(/\s+/);
  return`<span class="av" style="width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.38)}px;border-radius:32%;background:linear-gradient(145deg,rgba(${c},1),rgba(${c},.55))">${esc((w[0][0]+(w[1]?w[1][0]:"")).toUpperCase())}</span>`}
const gLoud=k=>(S.gun[gid(k)]||0)>0;
async function loadGroups(){if(S.gOff)return;
  try{const g=await api("/rest/v1/groups?select=id,name,owner,created_at&order=created_at.desc")||[],mem=await api("/rest/v1/group_members?select=gid,uid")||[];
    S.groups=g;S.gm={};mem.forEach(x=>(S.gm[x.gid]=S.gm[x.gid]||[]).push(x.uid));
    const need=new Set();Object.values(S.gm).forEach(a=>a.forEach(u=>{if(!S.prof[u])need.add(u)}));
    if(need.size){const ps=await profs([...need]);(ps||[]).forEach(p=>S.prof[p.id]=p)}
    S.glast={};S.gun={};
    if(g.length){const ms=await api("/rest/v1/group_msgs?select=id,gid,sender,kind,created_at,pv&created_at=gt."+encodeURIComponent(new Date(Date.now()-DAY).toISOString())+"&order=created_at.desc&limit=300")||[],rd=GR();
      ms.forEach(m=>{if(!S.glast[m.gid])S.glast[m.gid]=m;
        if(m.sender!==uid()&&!(S.chat==="g:"+m.gid&&S.view==="chat")&&(!rd[m.gid]||+new Date(m.created_at)>+new Date(rd[m.gid])))S.gun[m.gid]=(S.gun[m.gid]||0)+1})}}
  catch(e){if(e.status===404||/PGRST205|42P01|schema cache|does not exist|relation/i.test(String(e.message)+String(e.code)))S.gOff=1}}
function rowG(id){const G=S.groups.find(g=>g.id===id),l=S.glast[id],u=S.gun[id]||0;if(!G)return"";
  const sub=l?esc((l.sender!==uid()?nm(S.prof[l.sender])+": ":"")+prev(l)):`${(S.gm[id]||[]).length} members`;
  return`<div class="row${u?" un":""}" role="button" tabindex="0" data-a="chat:g:${id}">${gav(G,52)}<div class="tx"><b>${esc(G.name)}</b><small>${sub}</small></div><div class="mt">${l?`<span>${stamp(l.created_at)}</span>`:""}${u?`<span class="bd">${u}</span>`:""}</div></div>`}
function gSub(k){const G=gOf(k);if(!G)return"";const typ=(S.gm[G.id]||[]).some(u=>u!==uid()&&(S.typ[u]||0)>Date.now());
  return typ?'<small class="ty">typing…</small>':`<small>${(S.gm[G.id]||[]).length} members</small>`}
async function openGroup(k){const G=gOf(k);if(!G)return;S.chat=k;S.view="chat";S.msgs=[];S.reply=null;S.gun[G.id]=0;gMark(G.id);badge();
  const el=$("chat");if(!el)return;el.hidden=false;chatPaint(true);rtJoinChat();await gFetch(k,true)}
async function gFetch(k,first){try{const r=await api("/rest/v1/group_msgs?select=id,gid,sender,kind,body,bytes,created_at,reply_to,rx&gid=eq."+gid(k)+"&created_at=gt."+encodeURIComponent(new Date(Date.now()-DAY).toISOString())+"&order=created_at.asc&limit=300");
    if(S.chat!==k||!r)return;const tmp=S.msgs.filter(m=>m.tmp);
    if(first||JSON.stringify(r.map(m=>[m.id,m.rx]))!==JSON.stringify(S.msgs.filter(m=>!m.tmp).map(m=>[m.id,m.rx]))){S.msgs=r.concat(tmp).sort((a,b)=>+new Date(a.created_at)-+new Date(b.created_at));chatPaint(true)}}
  catch(e){if(first)toast(errMsg(e))}}
const gPoll=k=>gFetch(k,false);
function gChange(t,d,r,o){const me=uid();
  if(t==="group_msgs"){
    if(d.type==="INSERT"){const k="g:"+r.gid;
      if(S.chat===k){if(!S.msgs.some(z=>String(z.id)===String(r.id))){const tmp=r.sender===me&&S.msgs.find(z=>z.tmp&&z.body===r.body&&z.kind===r.kind);if(tmp){tmp.id=r.id;tmp.created_at=r.created_at;tmp.tmp=0;tmp.st=""}else S.msgs.push(r);chatPaint()}gMark(r.gid)}
      S.glast[r.gid]=r;
      if(r.sender!==me&&(S.chat!==k||document.hidden)){S.gun[r.gid]=(S.gun[r.gid]||0)+1;inPill(k,r)}
      badge();if(!S.chat)paint();else if(S.chat!==k)paintUnder()}
    else if(d.type==="UPDATE"){const m=S.msgs.find(z=>String(z.id)===String(r.id));if(m){m.rx=r.rx||{};chatPaint()}}
    else if(d.type==="DELETE"){const id=o.id||r.id,n=S.msgs.length;S.msgs=S.msgs.filter(z=>String(z.id)!==String(id));if(n!==S.msgs.length)chatPaint();loadGroups().then(()=>{if(!S.chat)paint()})}}
  else{const wasIn=S.groups.some(g=>g.id===(r.gid||o.gid||r.id||o.id));
    loadGroups().then(()=>{
      if(S.chat&&isG(S.chat)&&!gOf(S.chat)){S.chat=null;S.view="";const el=$("chat");if(el){el.hidden=true;el.innerHTML=""}toast("You're no longer in that group")}
      if(t==="group_members"&&d.type==="INSERT"&&r.uid===me&&!wasIn&&gOf("g:"+r.gid))inPill("g:"+r.gid,{kind:"text",body:"You were added to this group"});
      if(!S.chat)paint();else{subPaint();if(S.view==="chat")paintUnder()}})}}
/* create / manage */
const friendPick=ids=>ids.length?`<div class="gpick">${ids.map(id=>`<label class="gp"><input type="checkbox" value="${id}">${av(S.prof[id],34)}<span>${esc(nm(S.prof[id]))}</span></label>`).join("")}</div>`:`<div class="hint" style="padding:12px">No friends to add.</div>`;
function gNew(){if(S.gOff)return toast("Run the newest supabase-setup.sql once to turn on groups");if(!S.fr.length)return toast("Add a friend first");
  sheet(`<h3 style="margin:2px 8px 10px;font-size:19px">New group</h3><input class="in gin" id="gn" maxlength="40" placeholder="Group name" autocomplete="off">${friendPick(S.fr)}<button class="pill" data-a="gcreate" style="max-width:none;margin-top:10px">Create group</button>`)}
async function gCreate(){const n=($("gn").value||"").trim().slice(0,40),ids=[...document.querySelectorAll(".gpick input:checked")].map(i=>i.value);
  if(!n)return toast("Name the group");if(!ids.length)return toast("Pick at least one friend");if(ids.length>19)return toast("Groups hold up to 20 people");
  try{const r=await api("/rest/v1/groups?select=id,name,owner,created_at",{m:"POST",h:{Prefer:"return=representation"},b:{name:n}}),g=Array.isArray(r)?r[0]:r;
    await api("/rest/v1/group_members",{m:"POST",h:{Prefer:"return=minimal"},b:ids.map(u=>({gid:g.id,uid:u}))});
    closeSheet();await loadGroups();paint();openChat("g:"+g.id)}catch(e){toast(errMsg(e))}}
function gInfo(k){const G=gOf(k);if(!G)return;const me=uid(),own=G.owner===me;
  sheet(`<h3 style="margin:2px 8px 10px;font-size:19px">${esc(G.name)}</h3><div class="gml">${(S.gm[G.id]||[]).map(u=>`<div class="it" style="padding:8px 12px">${av(S.prof[u],34)}<span style="flex:1">${esc(u===me?"You":nm(S.prof[u]))}${u===G.owner?' <small style="opacity:.6">· owner</small>':""}</span>${own&&u!==me?`<button class="btn sm gh" style="color:#fff" data-a="grm:${G.id}:${u}">Remove</button>`:""}</div>`).join("")}</div>
    ${own?`<button class="it" data-a="gadd:${G.id}">${ic("plus")}Add people</button><button class="it rd" data-a="gdel:${G.id}">${ic("trash")}Delete group</button>`:`<button class="it rd" data-a="gleave:${G.id}">${ic("out")}Leave group</button>`}`)}
function gAdd(id){const mem=S.gm[id]||[];sheet(`<h3 style="margin:2px 8px 10px;font-size:19px">Add people</h3>${friendPick(S.fr.filter(f=>!mem.includes(f)))}<button class="pill" data-a="gaddgo:${id}" style="max-width:none;margin-top:10px">Add</button>`)}
async function gAddGo(id){const ids=[...document.querySelectorAll(".gpick input:checked")].map(i=>i.value);if(!ids.length)return closeSheet();
  if((S.gm[id]||[]).length+ids.length>20)return toast("Groups hold up to 20 people");
  try{await api("/rest/v1/group_members",{m:"POST",h:{Prefer:"return=minimal"},b:ids.map(u=>({gid:id,uid:u}))});closeSheet();await loadGroups();subPaint();toast("Added")}catch(e){toast(errMsg(e))}}
async function gRemove(v){const [g,u]=v.split(":");try{await api("/rest/v1/group_members?gid=eq."+g+"&uid=eq."+u,{m:"DELETE"});await loadGroups();gInfo("g:"+g);subPaint()}catch(e){toast(errMsg(e))}}
async function gLeave(id){if(!confirm("Leave this group?"))return;try{await api("/rest/v1/group_members?gid=eq."+id+"&uid=eq."+uid(),{m:"DELETE"});closeSheet();closeChat();await loadGroups();paint()}catch(e){toast(errMsg(e))}}
async function gDelete(id){if(!confirm("Delete this group for everyone?"))return;try{await api("/rest/v1/groups?id=eq."+id,{m:"DELETE"});closeSheet();closeChat();await loadGroups();paint()}catch(e){toast(errMsg(e))}}
