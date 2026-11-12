/* Use More Kerb: get people to add the app to their home screen in as few taps as possible.
   Loaded on every page by gate.js. Shows a sheet a few seconds after the page opens (not when already running
   as the app); "Not now" hides it for 3 days. Pages can open it any time with window.UMKInstall.show().
   - Android Chrome/Edge/Samsung: one Install button that brings up the phone's own install box (2 taps in all).
   - Inside Instagram, TikTok, Discord, Facebook etc: those can't add apps to the home screen, so one button
     jumps to Safari (iPhone) or Chrome (Android) on the same page.
   - iPhone Safari / Chrome: Apple doesn't let websites install themselves, so it shows the exact taps with
     a pointer at the button to press. */
(function () {
  var D = document, H = D.documentElement, ua = navigator.userAgent;
  var IS_APP = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (IS_APP) return;
  var IOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var IPAD = /ipad/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var ANDROID = /android/i.test(ua);
  var INAPP = /Instagram|FBAN|FBAV|FB_IAB|musical_ly|BytedanceWebview|TikTok|Discord|Snapchat|Twitter|LinkedInApp|Line\/|GSA\//i.test(ua) || (ANDROID && /; wv\)/.test(ua));
  var CRIOS = /CriOS|FxiOS|EdgiOS/i.test(ua);
  var SAFARI_V = +((ua.match(/Version\/(\d+)/) || [])[1] || 0);
  var MOBILE = IOS || ANDROID;
  var LATER = "umk-install-later", ev = null;
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function gc(path, title) { try { window.goatcounter && window.goatcounter.count && window.goatcounter.count({ path: path, title: title || path, event: true }); } catch (e) {} }

  addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); ev = e; });
  addEventListener("appinstalled", function () { close(); gc("install-done", "Installed as an app"); });

  var SHARE = '<svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m8 7 4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
  var DOTS = '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>';
  var PLUS = '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
  var css = "#umkI.umkG{padding:0;background:none;min-height:0;color:#fff}#umkI{position:fixed;inset:0;z-index:2147483000;display:none;font-family:Barlow,system-ui,sans-serif;color:#fff}" +
    "#umkI.on{display:block}#umkI .bg{position:absolute;inset:0;background:rgba(0,0,0,.6);animation:umkIf .2s}" +
    "#umkI .sh{position:absolute;left:0;right:0;bottom:0;max-width:520px;margin:0 auto;background:#121216 url(" + base() + "img/camo.png) center/cover;border-radius:22px 22px 0 0;border-top:3px solid #FF0074;padding:20px 20px calc(22px + env(safe-area-inset-bottom,0px));box-shadow:0 -12px 40px rgba(0,0,0,.6);animation:umkIu .28s cubic-bezier(.2,.9,.3,1)}" +
    "#umkI.top .sh{top:0;bottom:auto;border-radius:0 0 22px 22px;border-top:0;border-bottom:3px solid #FF0074;padding-top:calc(18px + env(safe-area-inset-top,0px));animation:umkId .28s cubic-bezier(.2,.9,.3,1)}" +
    "#umkI .hd{display:flex;align-items:center;gap:12px;margin-bottom:12px}#umkI .hd img{width:54px;height:54px;border-radius:13px;box-shadow:0 4px 14px rgba(0,0,0,.5)}" +
    "#umkI h2{font:italic 900 21px/1.1 F1,'Arial Black',sans-serif;margin:0}#umkI .hd p{margin:3px 0 0;color:#c9cad0;font-size:13.5px}" +
    "#umkI .ol{margin:8px 0 0;padding:0;counter-reset:s;text-align:left}#umkI .li{counter-increment:s;display:flex;align-items:center;gap:12px;padding:10px 0;font-size:16px;font-weight:600;line-height:1.5;border-top:1px solid rgba(255,255,255,.08)}#umkI .li b{color:#fff}" +
    "#umkI .li>i:before{content:counter(s)}#umkI .li>i{font-style:normal;flex:none;width:28px;height:28px;border-radius:50%;background:#FF0074;font-weight:900;display:flex;align-items:center;justify-content:center;font-size:15px}" +
    "#umkI .ic{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;background:#2a2b31;vertical-align:middle;margin:0 2px}" +
    "#umkI .ic svg{width:19px;height:19px;fill:none;stroke:#2EA8FF;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}#umkI .ic.d svg{fill:#2EA8FF;stroke:none}#umkI .ic.p svg{stroke:#fff}" +
    "#umkI .go{display:block;width:100%;margin:14px 0 0;padding:15px;border:0;border-radius:14px;background:#FF0074;color:#fff;font:800 17px Barlow,system-ui,sans-serif;text-align:center;text-decoration:none;cursor:pointer;box-shadow:0 6px 18px rgba(255,0,116,.35)}" +
    "#umkI .no{display:block;width:100%;margin:8px 0 0;padding:10px;border:0;background:none;color:#a4a5ad;font:600 14px Barlow,system-ui,sans-serif;cursor:pointer}" +
    "#umkI .why{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 4px}#umkI .why span{font-size:12px;font-weight:700;background:rgba(0,190,0,.16);color:#7dff7d;border-radius:999px;padding:4px 9px}" +
    "#umkI .pt{position:fixed;z-index:2147483001;width:46px;height:46px;pointer-events:none;animation:umkIb 1s ease-in-out infinite}#umkI .pt svg{width:100%;height:100%;fill:#FF0074;filter:drop-shadow(0 2px 6px rgba(0,0,0,.7))}" +
    "@keyframes umkIf{from{opacity:0}}@keyframes umkIu{from{transform:translateY(100%)}}@keyframes umkId{from{transform:translateY(-100%)}}" +
    "@keyframes umkIb{0%,100%{transform:translateY(0)}50%{transform:translateY(10px)}}";

  function base() { var s = D.querySelector('script[src$="install.js"]'); return s ? s.src.replace(/install\.js.*$/, "") : "./"; }
  var box;
  function build() {
    if (box) return;
    var st = D.createElement("style"); st.textContent = css; D.head.appendChild(st);
    box = D.createElement("div"); box.id = "umkI"; box.className = "umkG"; box.setAttribute("role", "dialog"); box.setAttribute("aria-label", "Add the app to your home screen");
    D.body.appendChild(box);
  }
  function close(later) { if (box) box.classList.remove("on"); if (later) ls(LATER, String(Date.now())); }
  function head(sub) {
    return '<div class="hd"><img src="' + base() + 'apple-touch-icon.png" alt=""><div><h2>Get the Use More Kerb app</h2><p>' + sub + '</p></div></div>' +
      '<div class="why"><span>Free</span><span>Opens full screen</span><span>Works with no signal at the track</span></div>';
  }
  function pointer(where) {
    /* arrow pointing at the browser button to press: "down-right", "down-centre", "up-right" */
    var p = D.createElement("div"); p.className = "pt";
    var up = where.indexOf("up") === 0;
    p.innerHTML = '<svg viewBox="0 0 24 24" style="transform:rotate(' + (up ? 180 : 0) + 'deg)"><path d="M12 22 3 11h6V2h6v9h6z"/></svg>';
    if (up) { p.style.top = "calc(6px + env(safe-area-inset-top,0px))"; } else { p.style.bottom = "calc(4px + env(safe-area-inset-bottom,0px))"; }
    if (where.indexOf("right") > 0) p.style.right = "14px"; else p.style.left = "calc(50% - 23px)";
    return p;
  }

  function show(force) {
    if (!force) {
      if (!MOBILE) return false;
      var t = +ls(LATER) || 0; if (Date.now() - t < 3 * 864e5) return false;
    }
    build(); box.className = "umkG";
    var html = "", top = false, pt = null;
    if (INAPP && (IOS || ANDROID)) {
      var url = location.href.split("#")[0];
      var go = IOS ? "x-safari-" + url : "intent://" + url.replace(/^https?:\/\//, "") + "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" + encodeURIComponent(url) + ";end";
      html = head("You're in another app's browser, which can't add apps to your home screen.") +
        '<a class="go" id="umkIgo" href="' + go + '">Open in ' + (IOS ? "Safari" : "Chrome") + '</a>' +
        '<p style="color:#a4a5ad;font-size:13px;margin:10px 0 0;text-align:center">If nothing happens, tap ' + '<span class="ic d">' + DOTS + '</span> and choose <b>Open in ' + (IOS ? "Safari" : "browser") + '</b>.</p>';
    } else if (ev) {
      html = head("One tap and it's on your home screen.") + '<button class="go" id="umkIgo">Install the app</button>';
    } else if (IOS) {
      var shareStep = '<div class="li"><i></i><span>Tap <span class="ic">' + SHARE + '</span> <b>Share</b></span></div>';
      var addStep = '<div class="li"><i></i><span>Tap <span class="ic p">' + PLUS + '</span> <b>Add to Home Screen</b></span></div><div class="li"><i></i><span>Tap <b>Add</b> (top right)</span></div>';
      if (CRIOS) { html = head("Three taps and it's on your home screen."); html += '<div class="ol">' + shareStep.replace("<b>Share</b>", "<b>Share</b> (top right, by the address)") + addStep + "</div>"; top = false; pt = "up-right"; }
      else if (IPAD) { html = head("Three taps and it's on your home screen."); html += '<div class="ol">' + shareStep.replace("<b>Share</b>", "<b>Share</b> (top right)") + addStep + "</div>"; pt = "up-right"; }
      else if (SAFARI_V >= 26) {
        html = head("Four taps and it's on your home screen.");
        html += '<div class="ol"><div class="li"><i></i><span>Tap <span class="ic d">' + DOTS + '</span> (bottom right)</span></div>' + shareStep + addStep.replace("Tap <b>Add</b>", "Leave <b>Open as Web App</b> on, tap <b>Add</b>") + "</div>";
        top = true; pt = "down-right";
      } else {
        html = head("Three taps and it's on your home screen.");
        html += '<div class="ol">' + shareStep.replace("<b>Share</b>", "<b>Share</b> (bottom of the screen)") + addStep.replace("<b>Add to Home Screen</b>", "<b>Add to Home Screen</b> (scroll down a little)") + "</div>";
        top = true; pt = "down-centre";
      }
    } else if (ANDROID) {
      html = head("Two taps and it's on your home screen.") + '<div class="ol"><div class="li"><i></i><span>Tap <span class="ic d">' + DOTS.replace('cx="5" cy="12"', 'cx="12" cy="5"').replace('cx="19" cy="12"', 'cx="12" cy="19"') + '</span> (top right)</span></div><div class="li"><i></i><span>Tap <b>Add to Home screen</b> or <b>Install app</b></span></div></div>';
      top = false; pt = "up-right";
    } else {
      html = head("Install it from your browser's address bar or menu.") + '<div class="ol"><div class="li"><i></i><span>Look for the <b>Install</b> icon in the address bar, or open the browser menu</span></div><div class="li"><i></i><span>Choose <b>Install</b> or <b>Add to Home screen</b></span></div></div>';
    }
    html += '<button class="no" id="umkIno">' + (ev || INAPP ? "Not now" : "Done, or maybe later") + "</button>";
    box.innerHTML = '<div class="bg"></div><div class="sh">' + html + "</div>";
    if (top) box.classList.add("top");
    if (pt) box.appendChild(pointer(pt));
    box.classList.add("on");
    box.querySelector(".bg").onclick = function () { close(true); };
    D.getElementById("umkIno").onclick = function () { close(true); gc("install-later", "Install prompt: not now"); };
    var g = D.getElementById("umkIgo");
    if (g && ev) g.onclick = function () { var e = ev; ev = null; close(); e.prompt(); e.userChoice.then(function (r) { gc("install-" + r.outcome, "Install prompt: " + r.outcome); }).catch(function () {}); };
    else if (g) g.onclick = function () { gc("install-openbrowser", "Install prompt: open in browser"); };
    gc("install-shown", "Install prompt shown" + (INAPP ? " (in-app browser)" : ev ? " (one tap)" : IOS ? " (iPhone steps)" : ""));
    return true;
  }
  /* always-visible "Get the app" button under each page's header, so nobody has to wait for (or remember) the pop-up.
     Pages with their own install button (#instBar: hub, team manager) keep theirs. */
  function bar() {
    if (D.getElementById("instBar") || D.getElementById("umkIbar")) return;
    var hd = D.querySelector("header.top"); if (!hd || !hd.parentNode) return;
    var st = D.createElement("style");
    st.textContent = "#umkIbar{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;box-sizing:border-box;margin:4px 0 12px;padding:12px 14px;border:0;border-radius:14px;background:#FF0074;color:#fff;font:800 15px/1.2 Barlow,system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(255,0,116,.28);-webkit-tap-highlight-color:transparent}" +
      "#umkIbar svg{flex:none;width:20px;height:20px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}#umkIbar:active{transform:scale(.98)}";
    D.head.appendChild(st);
    var b = D.createElement("button"); b.id = "umkIbar"; b.type = "button";
    b.innerHTML = PLUS + "<span>" + (INAPP ? "Open in " + (IOS ? "Safari" : "Chrome") + " to get the app" : "Add the app to your Home Screen") + "</span>";
    b.onclick = function () { gc("install-bar", "Install bar tapped"); show(true); };
    hd.parentNode.insertBefore(b, hd.nextSibling);
  }
  addEventListener("appinstalled", function () { var b = D.getElementById("umkIbar"); if (b) b.remove(); });
  window.UMKInstall = { show: function () { return show(true); }, available: true };

  /* pop up once the opening animation and any sign-in screen are out of the way */
  function auto(n) {
    var busy = D.querySelector("#splash:not(.out), .sheet.on") || H.classList.contains("intro");
    if (busy && n < 60) { setTimeout(function () { auto(n + 1); }, 500); return; }
    show(false);
  }
  function start() { bar(); if (/[?&]install=1/.test(location.search)) { setTimeout(function () { show(true); }, 900); return; } setTimeout(function () { auto(0); }, 2500); }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", start); else start();
})();
