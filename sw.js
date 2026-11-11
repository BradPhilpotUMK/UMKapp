/* Season Planner offline support.
   Pages and race data: try the network first (so updates show straight away), fall back to the saved copy when offline.
   Logos, icons and fonts: use the saved copy, refresh it in the background. */
const CACHE = "umk-planner-v12";
const CORE = [
  "./", "index.html", "manifest.webmanifest", "version.json",
  "data/races.json", "data/brad.json",
  "gate.js", "brad-logo.png", "img/store-merch.png", "favicon.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "logo.png",
  "logos/sponsors/helmet28.png", "logos/sponsors/xenduri.png", "fonts/f1.ttf",
  "team/", "team/index.html", "team/manifest.webmanifest", "team/wm.png", "team/icon-180.png", "team/icon-192.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(new Request(u, {cache: "reload"})).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("umk-planner-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

function fresh(req, key) {
  /* network first with a time limit, then the saved copy */
  return new Promise(resolve => {
    let done = false;
    const fallback = () => caches.match(key, {ignoreSearch: true});
    const t = setTimeout(() => fallback().then(r => { if (r && !done) { done = true; resolve(r); } }), 4000);
    fetch(req.url, {cache: "no-store", credentials: "same-origin"}).then(res => {
      /* Safari won't show a page the worker hands back after a redirect, so pass on a clean copy */
      if (res && res.redirected) res = new Response(res.body, {status: res.status, statusText: res.statusText, headers: res.headers});
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
      clearTimeout(t); if (!done) { done = true; resolve(res); }
    }).catch(() => fallback().then(r => { clearTimeout(t); if (!done) { done = true; resolve(r || Response.error()); } }));
  });
}

function page(req, key) {
  /* pages open instantly from the saved copy (so the opening animation starts straight away, even on poor signal);
     the newest version is fetched in the background and used next time. First visit: straight from the network. */
  return caches.match(key, {ignoreSearch: true}).then(hit => {
    const net = fetch(req.url, {cache: "no-store", credentials: "same-origin"}).then(res => {
      if (res && res.redirected) res = new Response(res.body, {status: res.status, statusText: res.statusText, headers: res.headers});
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(key, copy)); }
      return res;
    }).catch(() => hit || Response.error());
    return hit || net;
  });
}

function saved(req) {
  /* saved copy straight away, refreshed in the background */
  return caches.match(req).then(hit => {
    const net = fetch(req).then(res => {
      if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => hit || Response.error());
    return hit || net;
  });
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (url.pathname.startsWith("/_blob/")) return;
    if (url.pathname.startsWith("/.netlify/")) return; /* sign-in and AI: always straight to the server, never cached */
    const p = url.pathname.replace(/^\/+/, "");
    /* each page (the planner at /, the team manager at /team/) is saved under its own name */
    const isPage = req.mode === "navigate" || p === "" || p.endsWith("/") || p.endsWith("index.html");
    if (isPage) {
      const key = p === "" || p.endsWith("/") ? p + "index.html" : (/\.[a-z0-9]+$/i.test(p) ? p : p + "/index.html");
      e.respondWith(page(req, key)); return;
    }
    if (p === "version.json" || p.startsWith("data/")) { e.respondWith(fresh(req, url.pathname.slice(1))); return; }
    e.respondWith(saved(req));
    return;
  }
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") e.respondWith(saved(req));
});
