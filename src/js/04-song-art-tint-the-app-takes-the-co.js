/* ---- song-art tint: the app takes the colour of what you're playing in milo. (and your friend's in their chat) ---- */
const CC={},isRgb=c=>/^\d{1,3},\d{1,3},\d{1,3}$/.test(String(c||""));
const lumOf=c=>{const [r,g,b]=c.split(",").map(Number);return(.299*r+.587*g+.114*b)/255};
function colorOf(np){if(!np)return Promise.resolve(null);if(isRgb(np.c))return Promise.resolve(np.c);
  const k=np.img||np.t||"";if(k in CC)return Promise.resolve(CC[k]);
  return new Promise(res=>{const fin=c=>{if(k in CC)return;CC[k]=c;res(c)},fb=()=>np.t?COLS[hs(np.t+(np.a||""))%6]:null;
    if(!np.img||!/^https?:/.test(np.img))return fin(fb());
    const im=new Image();im.crossOrigin="anonymous";
    im.onload=()=>{try{const c=document.createElement("canvas");c.width=c.height=24;const x=c.getContext("2d");x.drawImage(im,0,0,24,24);const d=x.getImageData(0,0,24,24).data;let r=0,g=0,b=0,w=0;
      for(let i=0;i<d.length;i+=4){const mx=Math.max(d[i],d[i+1],d[i+2]),mn=Math.min(d[i],d[i+1],d[i+2]),s=(mx-mn)/(mx||1),k2=.15+s*s;r+=d[i]*k2;g+=d[i+1]*k2;b+=d[i+2]*k2;w+=k2}
      fin([r,g,b].map(v=>Math.round(v/w)).join(","))}catch(e){fin(fb())}};
    im.onerror=()=>fin(fb());im.src=np.img;setTimeout(()=>fin(fb()),4000)})}
function liftC(c){let [r,g,b]=c.split(",").map(Number);const l=lumOf(c);if(l<.42){const m=(.42-l)*1.6;r+=(255-r)*m;g+=(255-g)*m;b+=(255-b)*m}return[r,g,b].map(Math.round).join(",")}
function setTint(c,el){const t=el||document.documentElement.style&&document.documentElement;if(!t)return;const st=t.style;
  if(!c){st.removeProperty("--acc");st.removeProperty("--onacc");st.removeProperty("--glow");return}
  const a=liftC(c);st.setProperty("--acc","rgb("+a+")");st.setProperty("--onacc",lumOf(a)>.55?"#000":"#fff");st.setProperty("--glow","rgba("+a+",.34)")}
async function ownNp(force){if(!C||!S.me||(document.hidden&&!force))return;
  try{const r=await api("/rest/v1/shared?select=np,np_at&user_id=in.("+C.id+")");const row=r&&r[0];S.mine=row&&live(row)?row:null}catch(e){return}
  const n=S.mine&&S.mine.np,sig=n?(n.id||n.t)+"|"+(n.c||n.img||""):"";if(sig===S.mineSig)return;S.mineSig=sig;
  setTint(n?await colorOf(n):null);if(!S.chat&&S.tab==="home")paint()}
setInterval(ownNp,7000);
async function chatTint(f){if(isG(f))return;const sh=S.sh[f],el=$("chat");if(!el)return;const c=live(sh)?await colorOf(sh.np):null;if(S.chat!==f)return;
  if(!c){el.style.removeProperty("--glow");return}el.style.setProperty("--glow","rgba("+liftC(c)+",.34)")}
