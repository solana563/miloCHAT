/* ---- voice notes: record with the mic, play with a tiny player. Sent as an audio data URL (max ~60 s). ---- */
const VMAX=60;let vT=0,VA=null;
const vFmt=s=>{s=Math.max(0,Math.round(s||0));return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")};
const vDur=b=>{const x=/;dur=(\d+)/.exec(String(b).slice(0,90));return x?+x[1]:0};
function vMime(){for(const m of["audio/webm;codecs=opus","audio/mp4","audio/webm","audio/ogg;codecs=opus"])try{if(MediaRecorder.isTypeSupported(m))return m}catch(e){}return""}
async function vStart(){if(S.rec)return vStop();
  if(!navigator.mediaDevices||!window.MediaRecorder)return toast("Voice notes aren't supported here");
  let st;try{st=await navigator.mediaDevices.getUserMedia({audio:true})}catch(e){return toast("Allow the microphone to record")}
  const mt=vMime(),mr=new MediaRecorder(st,mt?{mimeType:mt,audioBitsPerSecond:24000}:{audioBitsPerSecond:24000}),ch=[];
  mr.ondataavailable=e=>{if(e.data&&e.data.size)ch.push(e.data)};
  const rec=S.rec={mr,ch,st,t0:Date.now(),mt:mr.mimeType||mt||"audio/webm",cancel:0,chat:S.chat};
  mr.onstop=()=>{clearInterval(vT);rec.st.getTracks().forEach(t=>t.stop());if(S.rec===rec)S.rec=null;rpbPaint();
    const dur=(Date.now()-rec.t0)/1000;if(rec.cancel)return;if(dur<.7)return toast("Hold on a little longer");
    const fr=new FileReader();fr.onload=()=>{const u=String(fr.result).replace(";base64,",";dur="+Math.round(dur)+";base64,");if(u.length>380000)return toast("That voice note is too long");
      if(S.chat!==rec.chat)return;send("voice",u)};fr.readAsDataURL(new Blob(rec.ch,{type:rec.mt}))};
  mr.start(500);clearInterval(vT);vT=setInterval(()=>{if(!S.rec)return;const s=(Date.now()-S.rec.t0)/1000,e=$("rt");if(e)e.textContent=vFmt(s);if(s>=VMAX)vStop()},250);rpbPaint()}
function vStop(){if(S.rec&&S.rec.mr.state!=="inactive")S.rec.mr.stop()}
function vCancel(){if(S.rec){S.rec.cancel=1;vStop()}}
function vPlay(id){const m=S.msgs.find(z=>String(z.id)===String(id));if(!m)return;
  if(VA&&VA.id===String(id)){VA.a.paused?VA.a.play().catch(()=>{}):VA.a.pause();return}
  if(VA){VA.a.pause();VA=null}
  const a=new Audio(m.body),d=vDur(m.body),st={id:String(id),a};VA=st;
  const ui=()=>{const b=$("vb"+id),t=$("vt"+id),dd=isFinite(a.duration)&&a.duration>0?a.duration:d;if(b)b.style.width=Math.min(100,a.currentTime/(dd||1)*100)+"%";if(t)t.textContent=vFmt(a.paused&&!a.currentTime?dd:a.currentTime)};
  a.ontimeupdate=ui;a.onended=()=>{a.currentTime=0;if(VA===st)VA=null;const b=$("vb"+id);if(b)b.style.width="0";const t=$("vt"+id);if(t)t.textContent=vFmt(d)};
  a.onerror=()=>{if(VA===st)VA=null;toast("Couldn't play this voice note")};a.play().catch(()=>toast("Couldn't play this voice note"))}
