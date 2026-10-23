/* ---- actions ---- */
async function doAuth(){const em=$("em").value.trim(),pw=$("pw").value,up=S.auth.up,un=up?($("un").value||"").trim().toLowerCase():"";
  const er=t=>{S.auth.err=t;const e=$("er");if(e)e.textContent=t};
  if(!em||!pw)return er("Enter your email and password.");if(up&&!/^[a-z0-9_]{3,20}$/.test(un))return er("Username: 3–20 letters, numbers or _.");
  S.auth.busy=1;er("");const b=document.querySelector('[data-a="auth"]');if(b){b.disabled=true;b.textContent="One moment…"}
  try{if(up){const free=await api("/rest/v1/rpc/username_free",{m:"POST",b:{u:un},anon:1});if(free===false)throw new Error("That username is taken.")}
    const j=await api(up?"/auth/v1/signup":"/auth/v1/token?grant_type=password",{m:"POST",b:up?{email:em,password:pw,data:{username:un,name:un}}:{email:em,password:pw},anon:1});
    if(!j.access_token){S.auth.busy=0;S.auth.up=0;S.auth.err="Check your email to confirm, then sign in.";return authV($("app"))}
    store(j);S.auth.busy=0;await boot(un)}
  catch(e){S.auth.busy=0;er(errMsg(e));const b2=document.querySelector('[data-a="auth"]');if(b2){b2.disabled=false;b2.textContent=up?"Create account":"Sign in"}}}
async function boot(wantUn){if(!C)return paint();$("app").innerHTML='<div class="load">Loading…</div>';
  try{let p=await loadMe();
    if(!p){const un=wantUn||(prompt("Choose a username (letters, numbers, _)")||"").toLowerCase();if(!/^[a-z0-9_]{3,20}$/.test(un)){C=null;LS.set("mc.cloud",null);S.auth.err="You need a username to chat.";return paint()}
      await api("/rest/v1/profiles",{m:"POST",h:{Prefer:"return=minimal"},b:{id:C.id,username:un,name:un}});p=await loadMe()}
    S.ready=0;rtConnect();await load();
    ownNp(true);if(S.pu)pushOn(false);deep();whatsNew()}
  catch(e){$("app").innerHTML=`<div class="load" style="text-align:center;padding:30px">${esc(errMsg(e))}<br><br><button class="pill" data-a="retry">Try again</button></div>`}}
function deep(){const q=new URLSearchParams(location.search),c=q.get("chat");if(q.has("chat")||q.has("friends")){try{history.replaceState(null,"",location.pathname)}catch(e){}}
  if(c&&S.prof[c])openChat(c);else if(q.get("friends")){S.tab="friends";S.seg=S.inc.length?"requests":"friends";paint()}}
document.addEventListener("click",async e=>{const t=e.target.closest("[data-a]");if(!t)return;const [k,v]=t.dataset.a.split(/:(.*)/s);
  if(k==="swap"){S.auth.up=!S.auth.up;S.auth.err="";return authV($("app"))}
  if(k==="auth")return doAuth();if(k==="retry")return boot();
  if(k==="tab"){S.tab=v;if(S.chat)closeChat();return paint()}
  if(k==="seg"){S.tab="friends";S.seg=v;S.err="";S.found=undefined;if(S.chat)closeChat();return paint()}
  if(k==="add"||k==="friendsgo"){S.tab="friends";S.seg=k==="add"?"add":(S.inc.length?"requests":"friends");S.err="";S.found=undefined;if(S.chat)closeChat();paint();if(k==="add")setTimeout(()=>{const q=$("q");if(q)q.focus()},50);return}
  if(k==="chat"){if(S.chat&&S.view==="prof"){S.view="chat";}return openChat(v)}
  if(k==="close")return closeChat();
  if(k==="newgroup")return gNew();if(k==="gcreate")return gCreate();if(k==="ginfo")return gInfo(v);if(k==="gadd")return gAdd(v);if(k==="gaddgo")return gAddGo(v);
  if(k==="grm")return gRemove(v);if(k==="gleave")return gLeave(v);if(k==="gdel")return gDelete(v);
  if(k==="closesheet")return closeSheet();
  if(k==="prof"){if(S.tab==="friends"&&!S.chat){S.chat=v;S.view="prof";const el=$("chat");el.hidden=false;return chatPaint(true)}S.view="prof";return chatPaint(true)}
  if(k==="closeprof"){if(S.view==="prof"&&!S.msgs.length&&S.tab==="friends"){S.chat=null;S.view="";const el=$("chat");el.hidden=true;el.innerHTML="";return}S.view="chat";return chatPaint(true)}
  if(k==="find"){const q=($("q").value||"").trim().replace(/^@/,"").toLowerCase();S.q=q;S.err="";if(!q)return;try{const r=await api("/rest/v1/rpc/find_user",{m:"POST",b:{u:q}});const p=Array.isArray(r)?r[0]:r;if(p&&p.id&&p.id!==uid()){S.found=p;S.prof[p.id]=p}else if(p&&p.id===uid()){S.found=null;S.err="That's you."}else S.found=0}catch(er){S.err=errMsg(er)}return paint()}
  if(k==="req"){try{await api("/rest/v1/friendships",{m:"POST",h:{Prefer:"return=minimal"},b:{a:uid(),b:v,status:"pending"}});toast("Request sent");S.found=undefined;load(true)}catch(er){S.err=/duplicate|unique/i.test(er.message)?"You already have a request with them.":errMsg(er);paint()}return}
  if(k==="acc"){try{await api("/rest/v1/friendships?a=eq."+v+"&b=eq."+uid(),{m:"PATCH",h:{Prefer:"return=minimal"},b:{status:"accepted"}});toast("You're friends");S.found=undefined;load(true)}catch(er){toast(errMsg(er))}return}
  if(k==="dec"){try{await api("/rest/v1/friendships?or=(and(a.eq."+v+",b.eq."+uid()+"),and(a.eq."+uid()+",b.eq."+v+"))",{m:"DELETE"});load(true)}catch(er){}return}
  if(k==="unf"){if(!confirm("Remove this friend? Your chat with them is deleted."))return;try{await api("/rest/v1/friendships?or=(and(a.eq."+v+",b.eq."+uid()+"),and(a.eq."+uid()+",b.eq."+v+"))",{m:"DELETE"});closeChat();S.chat=null;toast("Friend removed");load()}catch(er){toast(errMsg(er))}return}
  if(k==="send"){const ta=$("t");const x=ta.value.trim();if(!x)return;ta.value="";ta.style.height="";$("sb").disabled=true;return send("text",x)}
  if(k==="photo")return $("pf").click();
  if(k==="mic")return vStart();
  if(k==="mcancel")return vCancel();
  if(k==="vplay")return vPlay(v);
  if(k==="csearch"){S.finding=!S.finding;if(!S.finding)S.fq="";fbPaint();chatPaint();if(S.finding){const q=$("fq");if(q)q.focus()}return}
  if(k==="song"){const n=S.mine&&S.mine.np;if(!n)return toast("Play a song in milo. first (with Share now playing on)");if(n.local)return toast("Local songs can't be shared, only streams");const d=Object.assign({},n);delete d.p;delete d.c;return send("song",JSON.stringify(d))}
  if(k==="norep"){S.reply=null;return chatPaint()}
  if(k==="img"){const m=S.msgs.find(z=>String(z.id)===v);if(m){const d=document.createElement("div");d.className="full";d.innerHTML=`<img alt="" src="${esc(m.body)}">`;d.onclick=()=>d.remove();$("app").appendChild(d)}return}
  if(k==="rx")return react(v);
  if(k==="mrep"){const m=S.msgs.find(z=>String(z.id)===String(S.act));closeSheet();if(m){S.reply=m;chatPaint();const ta=$("t");if(ta)ta.focus()}return}
  if(k==="mcopy"){const m=S.msgs.find(z=>String(z.id)===String(S.act));closeSheet();try{await navigator.clipboard.writeText(m.body);toast("Copied")}catch(er){}return}
  if(k==="mun"){const m=S.msgs.find(z=>String(z.id)===String(S.act));closeSheet();if(!m)return;S.msgs=S.msgs.filter(z=>z!==m);chatPaint();try{await api("/rest/v1/"+mtab()+"?id=eq."+m.id,{m:"DELETE"})}catch(er){S.msgs.push(m);S.msgs.sort((a,b)=>+new Date(a.created_at)-+new Date(b.created_at));chatPaint();toast("Couldn't unsend")}return}
  if(k==="avpick")return $("avf").click();
  if(k==="cvpick")return $("cvf").click();
  if(k==="cvdel"){try{await api("/rest/v1/profiles?id=eq."+uid(),{m:"PATCH",h:{Prefer:"return=minimal"},b:{cover:null}});S.me.cover=null;paint()}catch(er){toast(errMsg(er))}return}
  if(k==="theme"){TH.v={light:"dark",dark:"auto",auto:"light"}[TH.v]||"light";LS.set("mc.th",TH.v);applyTh();return paint()}
  if(k==="rename"){const n=prompt("Your name",S.me.name||"");if(n&&n.trim()){const v2=n.trim().slice(0,40);try{await api("/rest/v1/profiles?id=eq."+uid(),{m:"PATCH",h:{Prefer:"return=minimal"},b:{name:v2}});S.me.name=v2;paint()}catch(er){toast(errMsg(er))}}return}
  if(k==="push"){if(S.pu&&typeof Notification!=="undefined"&&Notification.permission==="granted"){await pushOff();toast("Notifications off")}else{if(await pushOn(true))toast("Notifications on")}return paint()}
  if(k==="out"){if(!confirm("Sign out of miloCHAT?"))return;await pushOff();LS.set("mc.cloud",null);location.reload();return}
  if(k==="del"){if(!confirm("Delete your account everywhere (milo. too)? This can't be undone."))return;if(!confirm("Really delete it?"))return;try{await api("/rest/v1/rpc/delete_me",{m:"POST",b:{}});LS.set("mc.cloud",null);location.reload()}catch(er){toast(errMsg(er))}return}});
/* long press / right click on a bubble opens the message sheet; tap a failed one retries */
let lp=0,lpf=0;
document.addEventListener("pointerdown",e=>{const b=e.target.closest("[data-lp]");if(!b)return;lpf=0;clearTimeout(lp);lp=setTimeout(()=>{lpf=1;msgSheet(b.dataset.lp)},430)});
["pointerup","pointermove","pointercancel","scroll"].forEach(n=>document.addEventListener(n,()=>clearTimeout(lp),true));
document.addEventListener("contextmenu",e=>{const b=e.target.closest("[data-lp]");if(b){e.preventDefault();clearTimeout(lp);msgSheet(b.dataset.lp)}});
document.addEventListener("click",e=>{if(lpf){lpf=0;e.stopPropagation();return}const b=e.target.closest("[data-lp]");if(b){const m=S.msgs.find(z=>String(z.id)===b.dataset.lp);if(m&&m.st==="fail")post(m)}
  if(e.target.id==="sheet")closeSheet()},true);
let lastTap={id:0,t:0};document.addEventListener("dblclick",e=>{const b=e.target.closest("[data-lp]");if(!b)return;S.act=b.dataset.lp;const m=S.msgs.find(z=>String(z.id)===S.act);if(m&&!m.tmp&&!(m.rx||{})[uid()])react("❤️")});
document.addEventListener("input",e=>{if(e.target.id==="fq"){S.fq=e.target.value.trim().toLowerCase();chatPaint();return}
  if(e.target.id==="t"){const t=e.target;t.style.height="auto";t.style.height=Math.min(120,t.scrollHeight)+"px";$("sb").disabled=!t.value.trim();
  if(RT.chat&&Date.now()-RT.ts>2500){RT.ts=Date.now();rtSend({topic:rtT(RT.chat),event:"broadcast",payload:{type:"broadcast",event:"typing",payload:{uid:uid()}}})}}});
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches("[role=button]")){e.preventDefault();e.target.click();return}
  if(e.target.id==="t"&&e.key==="Enter"&&!e.shiftKey&&!/Android|iPhone|iPad/i.test(navigator.userAgent)){e.preventDefault();document.querySelector('[data-a="send"]').click()}
  if(e.target.id==="q"&&e.key==="Enter"){e.preventDefault();document.querySelector('[data-a="find"]').click()}
  if((e.target.id==="pw"||e.target.id==="un"||e.target.id==="em")&&e.key==="Enter")doAuth();
  if(e.key==="Escape"){if(!$("sheet").hidden)closeSheet();else if(S.chat)closeChat()}});
document.addEventListener("change",async e=>{const t=e.target;
  if(t.id==="pf"){const f=t.files[0];t.value="";if(!f)return;try{const d=await imgSmall(f,1024,.65);if(d.length>380000)return toast("That photo is too big");send("img",d)}catch(er){toast("Couldn't use that photo")}}
  if(t.id==="cvf"){const f=t.files[0];t.value="";if(!f)return;try{let d="";for(const q of[.6,.5,.4,.3]){d=await imgSmall(f,720,q,16/9);if(d.length<56000)break}if(d.length>=60000)return toast("That photo is too detailed");
      await api("/rest/v1/profiles?id=eq."+uid(),{m:"PATCH",h:{Prefer:"return=minimal"},b:{cover:d}});S.me.cover=d;paint();toast("Cover updated")}catch(er){toast(/cover/i.test(er.message||"")?"Run the newest supabase-setup.sql once (it adds covers).":"Couldn't use that photo")}}
  if(t.id==="avf"){const f=t.files[0];t.value="";if(!f)return;try{const d=await imgSmall(f,256,.75,1);const a={t:"img",u:d};await api("/rest/v1/profiles?id=eq."+uid(),{m:"PATCH",h:{Prefer:"return=minimal"},b:{av:a}});S.me.av=a;paint();toast("Photo updated")}catch(er){toast("Couldn't use that photo")}}});
