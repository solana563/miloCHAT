/* ---- views ---- */
function paint(){const a=$("app");if(!C)return authV(a);if(!S.me)return a.innerHTML='<div class="load">Loading…</div>';
  const shEl=$("sheet"),keepSh=shEl&&!shEl.hidden?shEl:null;if(keepSh)keepSh.remove(); /* an open sheet survives a repaint (same node, so typed text and ticks stay) */
  a.innerHTML=(S.tab==="home"?homeV():S.tab==="friends"?friendsV():S.tab==="me"?meV():"")+navV()+'<div class="toast" id="toast"></div><div id="sheet" hidden></div>'+'<div class="chat" id="chat" hidden></div>';
  if(S.chat){$("chat").hidden=false;chatPaint(true)}
  if(keepSh)$("sheet").replaceWith(keepSh)}
function navV(){const n=S.inc.length,u=Object.values(S.unread).concat(Object.values(S.gun||{})).reduce((a,b)=>a+b,0);
  const b=(t,i,dot)=>`<button data-a="tab:${t}" class="${S.tab===t?"on":""}" aria-label="${t}">${ic(i)}${dot?`<span class="dot">${dot>9?"9+":dot}</span>`:""}</button>`;
  return`<div class="nav"><div>${b("home","chat",u)}${b("friends","users",n)}<button data-a="add" aria-label="Add friend">${ic("plus")}</button>${b("me","user")}</div></div>`}
function storyV(id){const p=S.prof[id],u=S.unread[id]||0,on=live(S.sh[id]);
  return`<button class="st" data-a="chat:${id}"><span class="ring${on?" on":""}">${av(p,52)}${u?`<span class="ub">${u>9?"9+":u}</span>`:""}</span><span>${esc(nm(p).split(" ")[0])}</span></button>`}
function rowV(id){const p=S.prof[id],l=S.last[id],u=S.unread[id]||0,sh=S.sh[id];
  const sub=l?esc(prev(l)):live(sh)?"♪ "+esc(sh.np.t||"Listening"):"Say hi 👋";
  return`<div class="row${u?" un":""}" role="button" tabindex="0" data-a="chat:${id}">${av(p,52)}<div class="tx"><b>${esc(nm(p))}</b><small>${sub}</small></div><div class="mt">${l?`<span>${stamp(l.created_at)}</span>`:""}${u?`<span class="bd">${u}</span>`:""}</div></div>`}
function lastT(k){const l=isG(k)?S.glast[gid(k)]:S.last[k];return l?+new Date(l.created_at):0}
function homeV(){const ids=[...S.fr].sort((a,b)=>lastT(b)-lastT(a)),chats=ids.concat(S.groups.map(g=>"g:"+g.id)).sort((a,b)=>lastT(b)-lastT(a));
  const lv=S.fr.filter(i=>live(S.sh[i])),mine=S.mine&&S.mine.np;
  return`<div class="top"><button class="ib" data-a="tab:me" aria-label="Profile">${av(S.me,42)}</button><div class="ttl">chat<i>.</i></div><button class="ib" data-a="seg:requests" aria-label="Requests">${ic("bell")}${S.inc.length?`<span class="dot">${S.inc.length}</span>`:""}</button><button class="ib" data-a="add" aria-label="Add friend">${ic("search")}</button></div>
<div class="stories"><button class="st" data-a="add"><span class="ring add">${ic("plus")}</span><span>Add</span></button>${ids.map(storyV).join("")}</div>
<div class="cards"><section class="card big"><div class="ch"><h2>Chats</h2><small>${chats.length} chat${chats.length===1?"":"s"}</small><button class="btn sm gh" data-a="newgroup">+ Group</button></div><div class="scroll">${chats.length?chats.map(k=>isG(k)?rowG(gid(k)):rowV(k)).join(""):`<div class="empty"><b>No chats yet</b>Add a friend by their milo. username and start talking.<div style="margin-top:14px"><button class="btn acc" data-a="add">Add a friend</button></div></div>`}</div></section>
<section class="card mini"><h3>Listening now</h3>${lv.length||mine?`<div class="hs">${mine?`<div class="tile" style="outline:2px solid var(--acc)">${mine.img?`<span class="av" style="width:38px;height:38px;border-radius:10px"><img alt="" src="${esc(mine.img)}"></span>`:av(S.me,38)}<span style="min-width:0"><b>${esc(mine.t||"Song")}</b><small>You · milo.</small></span></div>`:""}${lv.map(i=>{const p=S.prof[i],n=S.sh[i].np;return`<button class="tile" data-a="chat:${i}">${av(p,38)}<span style="min-width:0"><b>${esc(n.t||"Song")}</b><small>${esc(nm(p))}</small></span></button>`}).join("")}</div>`:`<div class="hint" style="padding-bottom:18px">When friends play music in milo. you'll see it here.</div>`}</section></div>`}
function friendsV(){const tabs=[["friends","Friends",0],["requests","Requests",S.inc.length],["add","Add",0]];
  let body="";
  if(S.seg==="friends")body=S.fr.length?S.fr.map(id=>{const p=S.prof[id],sh=S.sh[id];return`<div class="row" role="button" tabindex="0" data-a="prof:${id}">${av(p,52)}<div class="tx"><b>${esc(nm(p))}</b><small>${live(sh)?"♪ "+esc(sh.np.t||""):"@"+esc(p&&p.username||"")}</small></div><button class="btn sm" data-a="chat:${id}" data-s="1">Message</button></div>`}).join(""):`<div class="empty"><b>No friends yet</b>Search a username in Add.</div>`;
  else if(S.seg==="requests"){body=(S.inc.length?S.inc.map(id=>{const p=S.prof[id];return`<div class="row">${av(p,52)}<div class="tx"><b>${esc(nm(p))}</b><small>@${esc(p&&p.username||"")}</small></div><button class="btn sm acc" data-a="acc:${id}">Accept</button><button class="btn sm gh" data-a="dec:${id}">✕</button></div>`}).join(""):`<div class="empty"><b>No requests</b>New friend requests show up here.</div>`)+
    (S.out.length?`<div class="hint" style="padding-top:12px">Sent</div>`+S.out.map(id=>{const p=S.prof[id];return`<div class="row">${av(p,44)}<div class="tx"><b>${esc(nm(p))}</b><small>Waiting for them…</small></div><button class="btn sm gh" data-a="dec:${id}">Cancel</button></div>`}).join(""):"")}
  else body=`<div class="field"><input class="in" id="q" placeholder="Their milo. username" autocapitalize="none" autocomplete="off" value="${esc(S.q||"")}"><button class="btn" data-a="find">Find</button></div>${S.err?`<div class="note">${esc(S.err)}</div>`:""}
    ${S.found?`<div class="row">${av(S.found,52)}<div class="tx"><b>${esc(nm(S.found))}</b><small>@${esc(S.found.username)}</small></div>${S.fr.includes(S.found.id)?'<small>Friends</small>':S.out.includes(S.found.id)?'<small>Requested</small>':S.inc.includes(S.found.id)?`<button class="btn sm acc" data-a="acc:${S.found.id}">Accept</button>`:`<button class="btn sm acc" data-a="req:${S.found.id}">Add</button>`}</div>`:S.found===0?'<div class="empty"><b>No one with that name</b>Check the spelling.</div>':'<div class="hint">Friends are added by username. You need to be friends before you can chat.</div>'}`;
  return`<div class="big-t">Friends</div><div class="seg">${tabs.map(t=>`<button class="${S.seg===t[0]?"on":""}" data-a="seg:${t[0]}">${t[1]}${t[2]?`<span class="bd">${t[2]}</span>`:""}</button>`).join("")}</div>
<div class="cards pg"><section class="card big"><div class="scroll" style="padding-top:10px">${body}</div></section></div>`}
const coverV=(p,edit)=>`<div class="cv"${p.cover?` style="background-image:url(${esc(p.cover)})"`:""}>${edit?`<button class="ib" data-a="cvpick" aria-label="Change cover">${ic("cam")}</button>`:""}</div>`;
function meV(){const p=S.me,pu=S.pu&&typeof Notification!=="undefined"&&Notification.permission==="granted";
  return`<div class="pf">${coverV(p,1)}${`<button data-a="avpick" aria-label="Change photo" style="position:relative">${av(p,112)}<span class="ib" style="position:absolute;right:-4px;bottom:-4px;width:36px;height:36px;background:#fff;color:#000">${ic("cam")}</span></button>`}<input type="file" id="avf" accept="image/*" hidden><input type="file" id="cvf" accept="image/*" hidden>
<h1>${esc(nm(p))}</h1><div class="un">@${esc(p.username)}</div>
<div class="stats"><div><small>Friends</small><b>${S.fr.length}</b></div><div><small>Chats today</small><b>${Object.keys(S.last).length}</b></div><div><small>Joined</small><b>${new Date(p.created_at||Date.now()).toLocaleDateString([],{month:"short",year:"2-digit"})}</b></div></div>
<div class="chips"><button class="chip ${pu?"on":""}" data-a="push">${ic("bell")}Notifications ${pu?"on":"off"}</button><button class="chip" data-a="rename">${ic("user")}Edit name</button><button class="chip" data-a="theme">${ic("img")}Cards: ${{light:"Light",dark:"Dark",auto:"Auto"}[TH.v]||"Light"}</button>${p.cover?`<button class="chip" data-a="cvdel">${ic("x")}Remove cover</button>`:""}</div><div class="hint" style="color:#6f7280;padding:0 0 8px">If milo. also notifies this phone, switch notifications off in one of the apps to avoid doubles.</div>
<a class="pill dk" href="${MILO_URL}" target="_blank" rel="noopener" style="text-decoration:none">${ic("note")}Open milo. music</a>
<button class="pill dk" data-a="out">${ic("out")}Sign out</button><button class="pill rd" data-a="del">Delete account</button>
<div class="hint" style="color:#6f7280;padding-top:10px">Same account as milo. Messages disappear after 24 hours.</div></div>`}
function profV(id){const p=S.prof[id]||{},sh=S.sh[id],n=live(sh)?sh.np:null;
  return`<div class="pf">${coverV(p,0)}${av(p,112)}<h1>${esc(nm(p))}</h1><div class="un">@${esc(p.username||"")}</div>
<div class="stats"><div><small>Friends since</small><b>${S.since[id]?new Date(S.since[id]).toLocaleDateString([],{day:"numeric",month:"short"}):"—"}</b></div><div><small>Status</small><b>${n?"♪ Live":"Away"}</b></div></div>
${n?`<div class="np">${av(p,40)}<span><b style="display:block;font-size:14px">${esc(n.t||"Song")}</b><small style="color:#a7aab5">${esc(n.a||"")}</small></span></div>`:""}
<button class="pill" data-a="chat:${id}">Send a message</button><button class="pill rd" data-a="unf:${id}">Remove friend</button></div>`}
function authV(a){const u=S.auth.up;
  a.innerHTML=`<div class="au"><h1>milo<i>CHAT</i></h1><p>Private chats with your milo. friends. Use your milo. account, or create one here.</p>
<input class="in" id="em" type="email" placeholder="Email" autocomplete="email"><input class="in" id="pw" type="password" placeholder="Password" autocomplete="${u?"new-password":"current-password"}">
${u?'<input class="in" id="un" placeholder="Choose a username (letters, numbers, _)" autocapitalize="none" autocomplete="username">':""}
<div class="er" id="er">${esc(S.auth.err)}</div><button class="pill" data-a="auth" ${S.auth.busy?"disabled":""}>${S.auth.busy?"One moment…":u?"Create account":"Sign in"}</button>
<div class="sw">${u?"Already have an account?":"New here?"} <button data-a="swap">${u?"Sign in":"Create account"}</button></div>
<div class="hint" style="text-align:center;margin-top:14px;color:#6f7280">By continuing you agree to keep chats kind. Messages vanish after 24 hours.</div></div><div class="toast" id="toast"></div>`}
