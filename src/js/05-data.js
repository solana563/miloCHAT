/* ---- data ---- */
async function loadMe(){const r=await api("/rest/v1/profiles?select=*&id=eq."+C.id);S.me=r&&r[0]||null;return S.me}
/* profiles, with or without the optional cover column (older databases don't have it yet) */
async function profs(ids){try{return await api("/rest/v1/profiles?select="+PS+"&id=in.("+ids.join(",")+")")}catch(e){if(PS===PSEL&&/cover/i.test(e.message||"")){PS="id,username,name,av";return profs(ids)}throw e}}
async function load(quiet){if(!C||!S.me)return;
  try{const me=C.id,f=await api("/rest/v1/friendships?select=a,b,status,created_at&or=(a.eq."+me+",b.eq."+me+")")||[];
    S.fr=[];S.inc=[];S.out=[];S.since={};const ids=new Set();
    f.forEach(x=>{const o=x.a===me?x.b:x.a;ids.add(o);if(x.status==="accepted"){S.fr.push(o);S.since[o]=x.created_at}else if(x.b===me)S.inc.push(o);else S.out.push(o)});
    if(ids.size){const ps=await profs([...ids]);(ps||[]).forEach(p=>S.prof[p.id]=p)}
    if(S.fr.length){const sh=await api("/rest/v1/shared?select=user_id,np,np_at&user_id=in.("+S.fr.join(",")+")");S.sh={};(sh||[]).forEach(r=>S.sh[r.user_id]=r)}
    const ms=await api("/rest/v1/messages?select=id,chat,sender,rcpt,kind,created_at,read_at,pv&or=(sender.eq."+me+",rcpt.eq."+me+")&created_at=gt."+encodeURIComponent(new Date(Date.now()-DAY).toISOString())+"&order=created_at.desc&limit=300")||[];
    S.last={};S.unread={};ms.forEach(m=>{const o=m.sender===me?m.rcpt:m.sender;if(!S.last[o])S.last[o]=m;if(m.rcpt===me&&!m.read_at&&!(S.chat===o&&S.view==="chat"))S.unread[o]=(S.unread[o]||0)+1});
    await loadGroups();
    S.ready=1;if(!quiet||!S.chat)paint();badge()}
  catch(e){if(!quiet)toast(errMsg(e));S.ready=S.ready||1;paint()}}
function badge(){const n=Object.values(S.unread).concat(Object.values(S.gun||{})).reduce((a,b)=>a+b,0);try{if(navigator.setAppBadge){n?navigator.setAppBadge(n):navigator.clearAppBadge()}}catch(e){}document.title=n?"("+n+") miloCHAT":"miloCHAT"}
