const V="mchat-v1";
const CORE=["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","icons/apple-touch-icon.png","icons/favicon-32.png","icons/icon.svg"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==V&&n.startsWith("mchat-")).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(r.mode==="navigate"){e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(V).then(h=>h.put("index.html",c));return x}).catch(()=>caches.match("index.html").then(x=>x||caches.match("./"))));return}
  e.respondWith(caches.match(r).then(h=>h||fetch(r).then(x=>{if(x&&x.ok){const c=x.clone();caches.open(V).then(k=>k.put(r,c))}return x})))});
/* background push: new messages and friend requests while the app is closed */
self.addEventListener("push",e=>{let d={};try{d=e.data?e.data.json():{}}catch(x){try{d={body:e.data.text()}}catch(y){}}
  const o={body:d.body||"",tag:d.tag||"mchat",renotify:true,icon:"icons/icon-192.png",badge:"icons/favicon-32.png",data:{chat:d.chat||"",act:d.act||""}};
  e.waitUntil((async()=>{const cs=await clients.matchAll({type:"window",includeUncontrolled:true});if(cs.some(c=>c.visibilityState==="visible"&&c.focused))return;
    await self.registration.showNotification(d.title||"miloCHAT",o);try{if(navigator.setAppBadge)await navigator.setAppBadge()}catch(x){}})())});
self.addEventListener("notificationclick",e=>{e.notification.close();const d=e.notification.data||{};
  e.waitUntil((async()=>{try{if(navigator.clearAppBadge)await navigator.clearAppBadge()}catch(x){}
    const cs=await clients.matchAll({type:"window",includeUncontrolled:true}),msg={type:"milo-open",act:d.act,chat:d.chat};
    if(cs.length){const c=cs.find(x=>x.visibilityState==="visible")||cs[0];try{await c.focus()}catch(x){}c.postMessage(msg);return}
    const q=d.act==="chat"&&d.chat?"?chat="+encodeURIComponent(d.chat):d.act==="friends"?"?friends=1":"";
    await clients.openWindow(new URL("index.html"+q,self.registration.scope).href)})())});
self.addEventListener("pushsubscriptionchange",e=>{e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>cs.forEach(c=>c.postMessage({type:"milo-resub"}))))});
