/* Sign-in and members' lock for the Use More Kerb app.
   Load it first thing in <head> on every page:
     <script src="gate.js" data-need="any"></script>     open to anyone signed in (hub, store, standings, Where's Brad racing)
     <script src="gate.js"></script>                     members only (planner, setup coach, team manager, members)
   Signing in needs a Discord account in the Use More Kerb server. Members (the YouTube Member role) unlock everything.
   Sign-in is checked by netlify/functions/discord-auth.mjs. Pages can call window.UMK.upgrade() to show the
   "become a member" sheet, and read window.UMK.member. */
(function () {
  var CFG = {
    enabled: true,
    netlify: "https://umkseasonplanner.netlify.app",   /* the Netlify address (used when the app is opened from GitHub Pages) */
    discordInvite: "https://discord.gg/DZDKW9fWmA",     /* invite link to the Use More Kerb Discord server */
    join: "https://www.youtube.com/@BradPhilpot/join",
    trailer: "JAPL-rYNekY"
  };
  var KEY = "umk-pass", D = document, H = D.documentElement, S = D.currentScript;
  var NEED = (S && S.getAttribute("data-need")) || "member";
  var base = (function () { try { return new URL(".", S.src).href; } catch (e) { return "/"; } })();
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function track(path, title) { try { window.goatcounter && goatcounter.count && goatcounter.count({ path: path, title: title, event: true }); } catch (e) {} }
  function payload(t) { try { return JSON.parse(atob(t.split(".")[0].replace(/-/g, "+").replace(/_/g, "/"))); } catch (e) { return {}; } }

  /* coming back from Discord in this same window */
  var denied = "";
  var hm = location.hash.match(/umkpass=([A-Za-z0-9_.-]+)|umkdenied=([a-z]+)/);
  if (hm) {
    if (hm[1]) savePass(hm[1]); else denied = hm[2];
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }
  function savePass(t, exp, m) {
    var pl = payload(t);
    if (!exp) exp = pl.exp || Date.now() + 90 * 864e5;
    if (m === undefined) m = pl.m !== false;
    ls(KEY, JSON.stringify({ t: t, exp: exp, m: m, checked: Date.now() }));
  }
  function pass() { try { var p = JSON.parse(ls(KEY) || "null"); if (!(p && p.t && p.exp > Date.now())) return null; if (p.m === undefined) p.m = payload(p.t).m !== false; return p; } catch (e) { return null; } }

  /* private test: ?gatetest=1 turns the lock on in this browser while it's switched off for everyone */
  var tq = location.search.match(/[?&]gatetest=([01])/);
  if (tq) ls("umk-gate-test", tq[1] === "1" ? "1" : null);
  var ON = CFG.enabled || ls("umk-gate-test") === "1";
  var api = (/github\.io$/.test(location.hostname) && CFG.netlify ? CFG.netlify.replace(/\/$/, "") : location.origin) + "/.netlify/functions/discord-auth";

  var P = ON ? pass() : { m: true };
  var UMK = window.UMK = { on: ON, signedIn: !!P, member: !!(P && P.m), upgrade: function () { sheet("modal"); }, signIn: function () { signIn(); } };

  /* ---------- styles ---------- */
  var css = D.createElement("style");
  css.textContent =
    "html.umk-locked,html.umk-locked body{background:#0b0b0c!important;overflow:auto!important;height:auto!important}" +
    "html.umk-locked body>*:not(.umkG){display:none!important}" +
    ".umkG{position:relative;min-height:100vh;box-sizing:border-box;padding:calc(28px + env(safe-area-inset-top,0px)) 18px calc(30px + env(safe-area-inset-bottom,0px));color:#F1F0EC;font:16px/1.45 Barlow,system-ui,-apple-system,Segoe UI,sans-serif;background:radial-gradient(90% 50% at 50% 0%,rgba(255,28,232,.22),transparent 70%),#0b0b0c}" +
    ".umkG.modal{position:fixed;inset:0;z-index:9999;overflow:auto;-webkit-overflow-scrolling:touch;min-height:0;animation:umkIn .22s ease-out}" +
    "@keyframes umkIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}" +
    ".umkG *{box-sizing:border-box}.umkG .w{max-width:440px;margin:0 auto;text-align:center;position:relative}" +
    ".umkG .x{position:absolute;right:-4px;top:-8px;width:38px;height:38px;border-radius:50%;border:1px solid #2a2b30;background:#17181c;color:#F1F0EC;font-size:22px;line-height:1;cursor:pointer}" +
    ".umkG .home{position:absolute;left:-2px;top:-6px;display:inline-flex;align-items:center;gap:2px;height:30px;padding:0 11px 0 6px;border-radius:999px;background:#26272d;border:1px solid rgba(241,240,236,.22);color:#F1F0EC;font-weight:700;font-size:13.5px;text-decoration:none}" +
    ".umkG .home svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}" +
    ".umkG .wm{width:min(230px,62vw);height:auto;display:block;margin:0 auto 18px}" +
    ".umkG .wm.sm{width:min(150px,40vw);margin-top:6px}" +
    ".umkG .st{width:112px;height:112px;display:block;margin:0 auto 10px;filter:drop-shadow(0 8px 18px rgba(0,0,0,.6))}" +
    ".umkG .pill{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;background:#FF1CE8;color:#14051A;border-radius:999px;padding:4px 10px;margin-bottom:10px}" +
    ".umkG .pill.lock{background:#F5C542}" +
    ".umkG h1{font:900 26px/1.15 F1,'Arial Black',sans-serif;margin:0 0 10px;letter-spacing:-.01em}" +
    ".umkG p{color:#b9b8b3;margin:0 0 16px;font-size:15px}" +
    ".umkG .btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;border:0;border-radius:16px;padding:15px 18px;font-weight:800;font-size:16.5px;line-height:1;font-family:inherit;text-decoration:none;cursor:pointer}" +
    ".umkG .dc{background:#5865F2;color:#fff}" +
    ".umkG .yt{background:#FF0033;color:#fff;margin-top:12px}" +
    ".umkG .ghost{background:transparent;color:#F1F0EC;border:1px solid #3a3b42;margin-top:10px;font-size:15px}" +
    ".umkG .msg{min-height:22px;margin:12px 0 0;font-size:14px;color:#F5C542}.umkG .msg.bad{color:#ff7a8a}" +
    ".umkG h2{font:800 18px/1.2 F1,'Arial Black',sans-serif;margin:28px 0 10px;text-align:left}" +
    ".umkG .vid{position:relative;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#000;border:1px solid #2a2b30}" +
    ".umkG .vid iframe{position:absolute;inset:0;width:100%;height:100%;border:0}" +
    ".umkG ul.get{list-style:none;margin:0 0 18px;padding:0;text-align:left;display:grid;gap:6px}" +
    ".umkG ul.get li{padding:9px 12px 9px 36px;position:relative;background:#17181c;border:1px solid #2a2b30;border-radius:12px;font-size:14.5px;color:#d8d7d2}" +
    ".umkG ul.get li:before{content:'';position:absolute;left:13px;top:50%;width:9px;height:9px;margin-top:-5px;border-radius:50%;background:#22F522}" +
    ".umkG ul.get b{color:#F1F0EC}" +
    ".umkG ol{text-align:left;margin:0;padding:0;list-style:none;counter-reset:s}" +
    ".umkG ol li{counter-increment:s;position:relative;padding:12px 12px 12px 48px;margin-bottom:8px;background:#17181c;border:1px solid #2a2b30;border-radius:14px;font-size:14.5px;color:#d8d7d2}" +
    ".umkG ol li:before{content:counter(s);position:absolute;left:12px;top:11px;width:26px;height:26px;border-radius:50%;background:#2a2b30;color:#F1F0EC;display:grid;place-items:center;font-weight:800;font-size:13px}" +
    ".umkG ol li b{color:#F1F0EC}.umkG a.lnk{color:#22F522}";
  (D.head || H).appendChild(css);

  var REASON = {
    notinserver: "Your Discord account isn't in the Use More Kerb Discord server yet. Join the server first, then sign in again.",
    cancelled: "Sign-in cancelled.",
    error: "Discord didn't answer properly. Please try again in a minute."
  };
  var invite = '<a class="lnk" href="' + CFG.discordInvite + '" target="_blank" rel="noopener">Use More Kerb Discord server</a>';

  /* ---------- sign-in (shared by the sign-in screen and "check again") ---------- */
  var polling = 0, sid = ls("umk-sid") || "", sayFn = function () {};
  function poll() {
    if (!sid) return;
    fetch(api + "?poll=" + sid, { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (r) {
      if (r.token) {
        savePass(r.token, r.exp, r.m); ls("umk-sid", null); sid = "";
        track(r.m ? "gate-member" : "gate-signedin", r.m ? "Gate: signed in as member" : "Gate: signed in (not member)");
        sayFn(r.m ? "You're in! Unlocking everything…" : "Signed in. Opening the app…"); location.reload();
      } else if (r.denied) { ls("umk-sid", null); sid = ""; clearInterval(polling); sayFn(REASON[r.denied] || REASON.error, r.denied !== "cancelled"); }
    }).catch(function () {});
  }
  function startPolling() { clearInterval(polling); var until = Date.now() + 15 * 60 * 1000; polling = setInterval(function () { if (Date.now() > until) { clearInterval(polling); return; } if (D.visibilityState === "visible") poll(); }, 2500); }
  D.addEventListener("visibilitychange", function () { if (D.visibilityState === "visible") poll(); });
  function signIn() {
    if (navigator.onLine === false) { sayFn("You're offline. Connect to the internet to sign in.", true); return; }
    var a = new Uint8Array(18); (window.crypto || window.msCrypto).getRandomValues(a);
    sid = Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
    ls("umk-sid", sid);
    track("gate-signin", "Gate: sign in with Discord");
    var url = api + "?start=1&sid=" + sid + "&ret=" + encodeURIComponent(location.href.split("#")[0]);
    sayFn("Waiting for Discord… finish signing in, then come back here.");
    startPolling();
    var w = null; try { w = window.open(url, "_blank"); } catch (e) {}
    if (!w) location.href = url;
  }
  function wire(root) {
    var msg = root.querySelector(".msg");
    sayFn = function (t, bad) { if (msg) { msg.textContent = t; msg.className = "msg" + (bad ? " bad" : ""); } };
    if (denied) sayFn(REASON[denied] || REASON.error, denied !== "cancelled");
    var b = root.querySelector("[data-signin]"); if (b) b.onclick = signIn;
    var j = root.querySelector("[data-join]"); if (j) j.onclick = function () { track("gate-join", "Gate: join on YouTube"); };
    if (sid) { startPolling(); poll(); }
    try { navigator.serviceWorker && navigator.serviceWorker.getRegistration().then(function (r) { r && r.update(); }); } catch (e) {}
  }
  function mount(el, full) {
    function go() {
      if (full) D.body.insertBefore(el, D.body.firstChild); else D.body.appendChild(el);
      wire(el);
    }
    if (D.body) go(); else D.addEventListener("DOMContentLoaded", go);
  }
  var homeChip = '<a class="home" href="' + base + '"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>Home</a>';

  /* ---------- the "become a member" sheet ---------- */
  function sheet(kind) {
    if (D.getElementById("umkUp")) return;
    var g = D.createElement("div"); g.id = "umkUp"; g.className = "umkG" + (kind === "modal" ? " modal" : "");
    g.setAttribute("role", "dialog"); g.setAttribute("aria-label", "Members only");
    g.innerHTML = '<div class="w">' +
      (kind === "modal" ? '<button class="x" type="button" aria-label="Close">×</button>' : homeChip) +
      '<img class="wm sm" src="' + base + 'team/wm.png" alt="Use More Kerb">' +
      '<img class="st" src="' + base + 'brad-logo.png" alt="">' +
      '<span class="pill lock">Members only</span>' +
      '<h1>Unlock the full app</h1>' +
      '<p>Become a Team Use More Kerb channel member to unlock every tool:</p>' +
      '<ul class="get"><li><b>Season Planner</b>: every UK, European and US race in one calendar</li>' +
      '<li><b>Setup Coach</b>: tell it what the kart’s doing, get the fix</li>' +
      '<li><b>Team Manager</b> for endurance teams, staff and payments</li>' +
      '<li><b>Members’ Championship</b>: race against the community</li></ul>' +
      '<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/' + CFG.trailer + '?rel=0&amp;playsinline=1" title="BUT WHY: Team Use More Kerb members trailer" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>' +
      '<a class="btn yt" data-join href="' + CFG.join + '" target="_blank" rel="noopener">Join on YouTube from £2.99 a month</a>' +
      '<h2>Already a member?</h2><ol>' +
      '<li><b>Link YouTube to Discord:</b> in Discord, go to Settings › Connections › YouTube and connect the account you joined with.</li>' +
      '<li>Your member role in the ' + invite + ' is added automatically (it can take up to an hour).</li>' +
      '<li>Then tap below to check again.</li></ol>' +
      '<button class="btn ghost" type="button" data-signin>I’m a member, check again</button>' +
      '<p class="msg" role="status"></p></div>';
    if (kind === "modal") {
      g.querySelector(".x").onclick = function () { g.remove(); D.documentElement.style.overflow = ""; };
      D.documentElement.style.overflow = "hidden";
      track("gate-upgrade", "Gate: members-only prompt");
    }
    mount(g, kind !== "modal");
  }

  if (!ON) return;

  /* ---------- signed in ---------- */
  if (P) {
    if (navigator.onLine !== false && Date.now() - (P.checked || 0) > 864e5) {
      fetch(api + "?verify=" + encodeURIComponent(P.t), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (r) {
        if (r && r.ok === false) { ls(KEY, null); location.reload(); }
        else if (r && r.ok) { P.checked = Date.now(); ls(KEY, JSON.stringify(P)); }
      }).catch(function () {});
    }
    if (NEED === "member" && !P.m) { H.classList.add("umk-locked"); sheet("page"); }
    return;
  }

  /* ---------- not signed in: sign-in screen ---------- */
  H.classList.add("umk-locked");
  var g = D.createElement("div"); g.id = "umkGate"; g.className = "umkG";
  g.innerHTML = '<div class="w">' +
    '<img class="wm" src="' + base + 'team/wm.png" alt="Use More Kerb">' +
    '<img class="st" src="' + base + 'brad-logo.png" alt="">' +
    '<span class="pill">Sign in to start</span>' +
    '<h1>The Use More Kerb app</h1>' +
    '<p>Sign in with Discord to open the app. Everyone in the Use More Kerb Discord gets Where’s Brad racing, Standings and the Store. Channel members unlock every tool.</p>' +
    '<button class="btn dc" type="button" data-signin>Sign in with Discord</button>' +
    '<p class="msg" role="status"></p>' +
    '<h2>How to get in</h2><ol>' +
    '<li><b>Join the ' + invite + '</b> (it’s free).</li>' +
    '<li><b>Tap Sign in with Discord</b> above and approve it.</li>' +
    '<li><b>Want every tool?</b> Become a channel member on YouTube and link YouTube to Discord (Settings › Connections). Your member role unlocks everything.</li></ol>' +
    '<a class="btn yt" data-join href="' + CFG.join + '" target="_blank" rel="noopener">Become a member on YouTube</a>' +
    '</div>';
  mount(g, true);
})();
