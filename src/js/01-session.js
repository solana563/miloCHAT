/* ---- session ---- */
let C=LS.get("mc.cloud",null);
async function api(path,o){o=o||{};
  if(!o.anon&&C&&Date.now()>=C.exp){await refresh()}
  const h={apikey:SBC.key,"Content-Type":"application/json",Authorization:"Bearer "+(o.anon||!C?SBC.key:C.at)};Object.assign(h,o.h||{});
  const ct=new AbortController(),tm=setTimeout(()=>ct.abort(),12000);
  try{const r=await fetch(SBC.url+path,{method:o.m||"GET",headers:h,body:o.b?JSON.stringify(o.b):undefined,signal:ct.signal});
    const tx=await r.text();let j=null;try{j=tx?JSON.parse(tx):null}catch(e){}
    if(!r.ok){const er=new Error((j&&(j.msg||j.error_description||j.message||j.error))||("HTTP "+r.status));er.status=r.status;er.code=j&&(j.code||j.error_code);throw er}
    return j}finally{clearTimeout(tm)}}
function store(j){C={at:j.access_token,rt:j.refresh_token,exp:Date.now()+(j.expires_in||3600)*1000-30000,id:(j.user&&j.user.id)||(C&&C.id),email:(j.user&&j.user.email)||(C&&C.email)};LS.set("mc.cloud",C)}
async function refresh(){if(!C)return;try{const j=await api("/auth/v1/token?grant_type=refresh_token",{m:"POST",b:{refresh_token:C.rt},anon:1});store(j)}catch(e){if(e.status===400||e.status===401||e.status===403){C=null;LS.set("mc.cloud",null);location.reload()}}}
function errMsg(e){const m=String(e&&e.message||e);
  if(/Invalid login/i.test(m))return"Wrong email or password.";if(/already registered|already been registered/i.test(m))return"That email already has an account. Sign in instead.";
  if(/password/i.test(m)&&/6|short|weak/i.test(m))return"Use a password with at least 6 characters.";if(/not confirmed/i.test(m))return"Confirm your email first, then sign in.";
  if(/too_large/i.test(m))return"That is too big to send.";if(/rate/i.test(m))return"Slow down a little.";
  if(e&&e.name==="AbortError")return"No answer. Check your connection.";if(/Failed to fetch|NetworkError|Load failed/i.test(m))return"Can't reach the server. Check your connection.";return m}
