/* Members-only lock for the Use More Kerb app.
   Load it first thing in <head> on every page. Switch it on by setting enabled:true below
   once the Discord sign-in is set up on Netlify (see netlify/functions/discord-auth.mjs). */
(function () {
  var CFG = {
    enabled: false,
    netlify: "",              /* the Netlify address, e.g. "https://use-more-kerb.netlify.app" (used when the app is opened from GitHub Pages) */
    discordInvite: "",        /* invite link to the Use More Kerb Discord server */
    join: "https://www.youtube.com/@BradPhilpot/join",
    trailer: "JAPL-rYNekY"
  };
  var KEY = "umk-pass", D = document, H = D.documentElement;
  var base = (function () { try { return new URL(".", D.currentScript.src).href; } catch (e) { return "/"; } })();
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function track(path, title) { try { window.goatcounter && goatcounter.count && goatcounter.count({ path: path, title: title, event: true }); } catch (e) {} }

  /* coming back from Discord in this same window */
  var denied = "";
  var m = location.hash.match(/umkpass=([A-Za-z0-9_.-]+)|umkdenied=([a-z]+)/);
  if (m) {
    if (m[1]) savePass(m[1]); else denied = m[2];
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  }
  function savePass(t, exp) {
    if (!exp) { try { exp = JSON.parse(atob(t.split(".")[0].replace(/-/g, "+").replace(/_/g, "/"))).exp; } catch (e) { exp = Date.now() + 90 * 864e5; } }
    ls(KEY, JSON.stringify({ t: t, exp: exp, checked: Date.now() }));
  }
  function pass() { try { var p = JSON.parse(ls(KEY) || "null"); return p && p.t && p.exp > Date.now() ? p : null; } catch (e) { return null; } }

  if (!CFG.enabled) return;
  var api = (/github\.io$/.test(location.hostname) && CFG.netlify ? CFG.netlify.replace(/\/$/, "") : location.origin) + "/.netlify/functions/discord-auth";

  var p = pass();
  if (p) {
    /* re-check now and then, in the background */
    if (navigator.onLine !== false && Date.now() - (p.checked || 0) > 864e5) {
      fetch(api + "?verify=" + encodeURIComponent(p.t), { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (r) {
        if (r && r.ok === false) { ls(KEY, null); location.reload(); }
        else if (r && r.ok) { p.checked = Date.now(); ls(KEY, JSON.stringify(p)); }
      }).catch(function () {});
    }
    return;
  }

  /* locked */
  H.classList.add("umk-locked");
  var css = D.createElement("style");
  css.textContent = "html.umk-locked,html.umk-locked body{background:#0b0b0c!important;overflow:auto!important;height:auto!important}" +
    "html.umk-locked body>*:not(#umkGate){display:none!important}" +
    "#umkGate{position:relative;min-height:100vh;box-sizing:border-box;padding:calc(28px + env(safe-area-inset-top,0px)) 18px calc(30px + env(safe-area-inset-bottom,0px));color:#F1F0EC;font:16px/1.45 Barlow,system-ui,-apple-system,Segoe UI,sans-serif;background:radial-gradient(90% 50% at 50% 0%,rgba(255,28,232,.22),transparent 70%),#0b0b0c}" +
    "#umkGate *{box-sizing:border-box}#umkGate .w{max-width:440px;margin:0 auto;text-align:center}" +
    "#umkGate .wm{width:min(230px,62vw);height:auto;display:block;margin:0 auto 18px}" +
    "#umkGate .st{width:118px;height:118px;display:block;margin:0 auto 10px;filter:drop-shadow(0 8px 18px rgba(0,0,0,.6))}" +
    "#umkGate .pill{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;background:#FF1CE8;color:#14051A;border-radius:999px;padding:4px 10px;margin-bottom:10px}" +
    "#umkGate h1{font:900 26px/1.15 F1,'Arial Black',sans-serif;margin:0 0 10px;letter-spacing:-.01em}" +
    "#umkGate p{color:#b9b8b3;margin:0 0 16px;font-size:15px}" +
    "#umkGate .btn{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;border:0;border-radius:16px;padding:15px 18px;font:800 16.5px/1 inherit;font-family:inherit;text-decoration:none;cursor:pointer}" +
    "#umkGate .dc{background:#5865F2;color:#fff}#umkGate .dc svg{width:24px;height:24px;fill:#fff}" +
    "#umkGate .yt{background:#FF0033;color:#fff;margin-top:12px}" +
    "#umkGate .msg{min-height:22px;margin:12px 0 0;font-size:14px;color:#F5C542}#umkGate .msg.bad{color:#ff7a8a}" +
    "#umkGate h2{font:800 18px/1.2 F1,'Arial Black',sans-serif;margin:30px 0 10px;text-align:left}" +
    "#umkGate .vid{position:relative;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#000;border:1px solid #2a2b30}" +
    "#umkGate .vid iframe{position:absolute;inset:0;width:100%;height:100%;border:0}" +
    "#umkGate ol{text-align:left;margin:0;padding:0;list-style:none;counter-reset:s}" +
    "#umkGate li{counter-increment:s;position:relative;padding:12px 12px 12px 48px;margin-bottom:8px;background:#17181c;border:1px solid #2a2b30;border-radius:14px;font-size:14.5px;color:#d8d7d2}" +
    "#umkGate li:before{content:counter(s);position:absolute;left:12px;top:11px;width:26px;height:26px;border-radius:50%;background:#2a2b30;color:#F1F0EC;display:grid;place-items:center;font-weight:800;font-size:13px}" +
    "#umkGate li b{color:#F1F0EC}#umkGate li a{color:#22F522}";
  (D.head || H).appendChild(css);

  var REASON = {
    notinserver: "Your Discord account isn't in the Use More Kerb Discord server yet. Join it (step 3 below), then sign in again.",
    norole: "You're in the Discord, but without the Team Use More Kerb member role yet. Check step 2 below, give it a few minutes, then try again.",
    cancelled: "Sign-in cancelled.",
    error: "Discord didn't answer properly. Please try again in a minute."
  };
  var invite = CFG.discordInvite ? '<a href="' + CFG.discordInvite + '" target="_blank" rel="noopener">Join the Use More Kerb Discord</a>' : "Join the Use More Kerb Discord server";

  function build() {
    if (D.getElementById("umkGate")) return;
    var g = D.createElement("div"); g.id = "umkGate";
    g.innerHTML = '<div class="w">' +
      '<img class="wm" src="' + base + 'team/wm.png" alt="Use More Kerb">' +
      '<img class="st" src="' + base + 'brad-logo.png" alt="">' +
      '<span class="pill">Members only</span>' +
      '<h1>The app for Team Use More Kerb</h1>' +
      '<p>Race calendars, standings, the Setup Coach, Team Manager and the Members’ Championship, all for channel members. Sign in with Discord to unlock it.</p>' +
      '<button class="btn dc" id="umkSignIn" type="button">Sign in with Discord</button>' +
      '<p class="msg" id="umkMsg" role="status"></p>' +
      '<h2>Not a member yet?</h2>' +
      '<div class="vid"><iframe src="https://www.youtube-nocookie.com/embed/' + CFG.trailer + '?rel=0&amp;playsinline=1" title="BUT WHY: Team Use More Kerb members trailer" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>' +
      '<a class="btn yt" id="umkJoin" href="' + CFG.join + '" target="_blank" rel="noopener">Join on YouTube from £2.99 a month</a>' +
      '<h2>How to unlock the app</h2><ol>' +
      '<li><b>Join the channel on YouTube</b> (Team Use More Kerb or above).</li>' +
      '<li><b>Link YouTube to Discord:</b> in Discord, go to Settings › Connections › YouTube and connect the account you joined with.</li>' +
      '<li><b>' + invite + '</b>. Your member role is added automatically (it can take up to an hour).</li>' +
      '<li><b>Come back here</b> and tap Sign in with Discord.</li></ol>' +
      '</div>';
    D.body.insertBefore(g, D.body.firstChild);
    var msg = D.getElementById("umkMsg");
    function say(t, bad) { msg.textContent = t; msg.className = "msg" + (bad ? " bad" : ""); }
    if (denied) say(REASON[denied] || REASON.error, denied !== "cancelled");
    D.getElementById("umkJoin").onclick = function () { track("gate-join", "Gate: join on YouTube"); };

    var polling = 0, sid = ls("umk-sid") || "";
    function poll() {
      if (!sid) return;
      fetch(api + "?poll=" + sid, { cache: "no-store" }).then(function (r) { return r.json(); }).then(function (r) {
        if (r.token) { savePass(r.token, r.exp); ls("umk-sid", null); track("gate-unlocked", "Gate: unlocked"); say("You're in! Opening the app…"); location.reload(); }
        else if (r.denied) { ls("umk-sid", null); sid = ""; clearInterval(polling); say(REASON[r.denied] || REASON.error, r.denied !== "cancelled"); }
      }).catch(function () {});
    }
    function startPolling() { clearInterval(polling); var until = Date.now() + 15 * 60 * 1000; polling = setInterval(function () { if (Date.now() > until) { clearInterval(polling); return; } if (D.visibilityState === "visible") poll(); }, 2500); }
    if (sid) { startPolling(); poll(); }
    D.addEventListener("visibilitychange", function () { if (D.visibilityState === "visible") poll(); });

    D.getElementById("umkSignIn").onclick = function () {
      if (navigator.onLine === false) { say("You're offline. Connect to the internet to sign in.", true); return; }
      var a = new Uint8Array(18); (window.crypto || window.msCrypto).getRandomValues(a);
      sid = Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
      ls("umk-sid", sid);
      track("gate-signin", "Gate: sign in with Discord");
      var url = api + "?start=1&sid=" + sid + "&ret=" + encodeURIComponent(location.href.split("#")[0]);
      say("Waiting for Discord… finish signing in, then come back here.");
      startPolling();
      var w = null; try { w = window.open(url, "_blank"); } catch (e) {}
      if (!w) location.href = url;
    };
  }
  if (D.body) build(); else D.addEventListener("DOMContentLoaded", build);
})();
