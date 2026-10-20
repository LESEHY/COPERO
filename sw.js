/* COPERO 서비스 워커: 앱 화면(index.html)과 글꼴만 보관합니다. 선수 데이터(Supabase)는 보관하지 않습니다. */
const V='copero-v1';
const CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET')return;
  if(/supabase\.co$/.test(u.hostname))return;
  /* 화면: 항상 최신 버전을 먼저 받고, 인터넷이 끊기면 보관된 화면 */
  if(r.mode==='navigate'||(u.origin===location.origin&&/\.html?$|\/$/.test(u.pathname))){
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(V).then(x=>x.put('index.html',c));return res}).catch(()=>caches.match('index.html').then(m=>m||caches.match('./'))));return;
  }
  /* 글꼴 · 아이콘: 보관본 우선 */
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)||u.origin===location.origin){
    e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res})));
  }
});
