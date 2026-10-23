/* ---- push ---- */
function pu64(s){const p="=".repeat((4-s.length%4)%4),b=(s+p).replace(/-/g,"+").replace(/_/g,"/"),r=atob(b),o=new Uint8Array(r.length);for(let i=0;i<r.length;i++)o[i]=r.charCodeAt(i);return o}
async function pushOn(ask){if(!("serviceWorker"in navigator)||!("PushManager"in window)||typeof Notification==="undefined"||!window.isSecureContext){if(ask)toast("This browser can't do notifications");return false}
  if(Notification.permission==="default"&&ask)try{await Notification.requestPermission()}catch(e){}
  if(Notification.permission!=="granted"){if(ask)toast("Notifications are blocked in your browser settings");return false}
  try{const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pu64(VAPID_PUB)});
    const j=sub.toJSON();await api("/rest/v1/rpc/push_save",{m:"POST",b:{k:"web",e:sub.endpoint,x:j.keys||null}});LS.set("mc.pushEp",sub.endpoint);S.pu=1;LS.set("mc.push",1);return true}catch(e){if(ask)toast("Couldn't turn on notifications");return false}}
async function pushOff(){try{const ep=LS.get("mc.pushEp","");if(ep)await api("/rest/v1/rpc/push_drop",{m:"POST",b:{e:ep}});const reg=await navigator.serviceWorker.ready,s=await reg.pushManager.getSubscription();if(s)await s.unsubscribe()}catch(e){}S.pu=0;LS.set("mc.push",0);LS.set("mc.pushEp","")}
