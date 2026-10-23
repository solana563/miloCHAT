/* ---- service worker + start ---- */
if("serviceWorker"in navigator){navigator.serviceWorker.register("sw.js").catch(()=>{});
  navigator.serviceWorker.addEventListener("message",e=>{const d=e.data||{};if(d.type==="milo-open"){if(d.act==="chat"&&d.chat&&S.prof[d.chat])openChat(d.chat);else if(d.act==="friends"){S.tab="friends";S.seg="requests";paint()}}else if(d.type==="milo-resub"&&S.pu)pushOn(false)})}
/* ---- what's new (shown once after an update) ---- */
const VER=3,NEWS=["Group chats: tap + Group on Home","Voice notes: tap the mic to record, tap again to send","Cover photos on your profile","The app takes the colour of the song you're playing in milo.","Light, dark or auto cards (Profile → Cards)","Search a chat and see when messages are about to vanish","Send the song you're playing with the ♪ button"];
function whatsNew(){const p=LS.get("mc.ver",0);LS.set("mc.ver",VER);if(p&&p<VER)sheet(`<div style="padding:6px 8px 4px"><h3 style="margin:4px 0 10px;font-size:20px">What's new</h3>${NEWS.map(n=>`<div class="it" style="padding:8px 4px;font-weight:500">• ${esc(n)}</div>`).join("")}<button class="pill" data-a="closesheet" style="max-width:none;margin-top:10px">Got it</button></div>`)}
if(C)boot();else paint();
