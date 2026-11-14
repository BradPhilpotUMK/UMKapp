/* Keeps each signed-in person's app data saved against their Discord sign-in (the Cloudflare Worker, worker/src/index.js),
   so their Season Planner, Team Manager, favourites and settings follow them to any phone or browser.
   Loaded by gate.js on every page. Only the keys below are saved; nothing else leaves the phone. */
(function () {
  var U = window.UMK; if (!U || !U.token || !window.fetch) return;
  var LS = window.localStorage; if (!LS) return;
  var SYNC = /^umk-(season-planner-[a-z]+-v1|team-manager-v1|setup-coach-v1|budget-v1|sponsor-v1|sponsor-img-v1|post-v1|teams-post-v1|timing-favs|country|avatar|racing-name|race-weight)$/;
  var META = "umk-sync-meta", URL = U.fn + "sync", HDR = { "Authorization": "Bearer " + U.token, "Content-Type": "application/json" };
  var raw = { get: LS.getItem.bind(LS), set: LS.setItem.bind(LS), del: LS.removeItem.bind(LS) };
  function meta() { try { return JSON.parse(raw.get(META) || "{}"); } catch (e) { return {}; } }
  function saveMeta(m) { try { raw.set(META, JSON.stringify(m)); } catch (e) {} }
  var dirty = {}, timer = 0, ready = false;
  function mark(k) { var m = meta(); m[k] = Date.now(); saveMeta(m); dirty[k] = 1; clearTimeout(timer); if (ready) timer = setTimeout(push, 2500); }
  /* notice every save the app makes */
  var S = Storage.prototype, oSet = S.setItem, oDel = S.removeItem;
  S.setItem = function (k, v) { oSet.call(this, k, v); if (this === LS && SYNC.test(k)) mark(k); };
  S.removeItem = function (k) { oDel.call(this, k); if (this === LS && SYNC.test(k)) mark(k); };
  function push(keepalive) {
    var ks = Object.keys(dirty); if (!ks.length) return; var m = meta(), items = {};
    ks.forEach(function (k) { var v = raw.get(k); items[k] = { v: v, t: m[k] || Date.now() }; }); dirty = {};
    fetch(URL, { method: "POST", headers: HDR, body: JSON.stringify({ items: items }), keepalive: !!keepalive && JSON.stringify(items).length < 60000 })
      .catch(function () { ks.forEach(function (k) { dirty[k] = 1; }); });
  }
  addEventListener("pagehide", function () { push(true); });
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") push(true); });
  /* first contact: fetch what's saved, take anything newer, send anything this phone has that's newer */
  fetch(URL, { headers: HDR, cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
    if (!d || !d.items) return; var m = meta(), got = 0;
    Object.keys(d.items).forEach(function (k) {
      if (!SYNC.test(k)) return; var it = d.items[k], mine = m[k] || 0, cur = raw.get(k);
      if (it.t > mine) { if (it.v === null) { if (cur !== null) { raw.del(k); got++; } } else if (cur !== it.v) { try { raw.set(k, it.v); got++; } catch (e) {} } m[k] = it.t; }
      else if (it.t < mine) dirty[k] = 1;
    });
    /* data on this phone that has never been saved yet (e.g. from before saving existed) */
    for (var i = 0; i < LS.length; i++) { var k = LS.key(i); if (SYNC.test(k) && !d.items[k] && raw.get(k) !== null) { if (!m[k]) m[k] = 1; dirty[k] = 1; } }
    saveMeta(m); ready = true; push();
    if (got) { try { if (sessionStorage.getItem("umk-sync-reload") === location.pathname) return; sessionStorage.setItem("umk-sync-reload", location.pathname); } catch (e) {} location.reload(); }
  }).catch(function () { ready = true; });
})();
