/* Members-only sign-in with Discord. Runs on Netlify only.
   Checks that the person is in the Use More Kerb Discord server and has one of the
   Team Use More Kerb member roles (given automatically by YouTube's Discord link).

   Environment variables (Netlify: Site configuration > Environment variables):
     DISCORD_CLIENT_ID       from the Discord Developer Portal (your application > OAuth2)
     DISCORD_CLIENT_SECRET   same page
     DISCORD_GUILD_ID        your Discord server ID
     DISCORD_ROLE_IDS        member role IDs that unlock the app, comma separated
     UMK_PASS_SECRET         any long random text (keeps passes from being forged)
   Optional:
     DISCORD_EXTRA_USER_IDS  Discord user IDs always let in (e.g. Brad, moderators), comma separated
     UMK_ALLOWED_HOSTS       other sites allowed to use this sign-in, default "bradphilpotumk.github.io"
     UMK_PASS_DAYS           how long a pass lasts before signing in again, default 30

   Discord redirect URL to register: https://<your-netlify-site>/.netlify/functions/discord-auth */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";

const env = k => (process.env[k] || "").trim();
const list = k => env(k).split(",").map(s => s.trim()).filter(Boolean);
const b64 = s => Buffer.from(s).toString("base64url");
const unb64 = s => Buffer.from(s, "base64url").toString();

function sign(obj) {
  const body = b64(JSON.stringify(obj));
  const mac = createHmac("sha256", env("UMK_PASS_SECRET")).update(body).digest("base64url");
  return body + "." + mac;
}
function unsign(tok) {
  const [body, mac] = String(tok || "").split(".");
  if (!body || !mac) return null;
  const want = createHmac("sha256", env("UMK_PASS_SECRET")).update(body).digest("base64url");
  const a = Buffer.from(mac), b = Buffer.from(want);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { return JSON.parse(unb64(body)); } catch { return null; }
}

function okReturn(ret, self) {
  try {
    const u = new URL(ret);
    if (u.protocol !== "https:" && u.hostname !== "localhost") return false;
    if (u.origin === self.origin) return true;
    const hosts = list("UMK_ALLOWED_HOSTS");
    return (hosts.length ? hosts : ["bradphilpotumk.github.io"]).includes(u.hostname);
  } catch { return false; }
}

const cors = origin => ({ "Access-Control-Allow-Origin": origin || "*", "Vary": "Origin", "Cache-Control": "no-store" });
const json = (obj, status, origin) => new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json", ...cors(origin) } });
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function page(title, msg, link, linkText) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>html,body{margin:0;background:#0b0b0c;color:#F1F0EC;font:16px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
main{max-width:420px;margin:0 auto;padding:56px 22px;text-align:center}h1{font-size:26px;margin:0 0 10px}p{color:#b9b8b3;margin:0 0 22px}
a{display:inline-block;background:#FF1CE8;color:#14051A;font-weight:800;text-decoration:none;padding:13px 20px;border-radius:14px}</style></head>
<body><main><h1>${esc(title)}</h1><p>${esc(msg)}</p>${link ? `<a href="${esc(link)}">${esc(linkText)}</a>` : ""}</main></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

const DENIED = {
  notinserver: ["Not in the Discord yet", "Your Discord account isn't in the Use More Kerb Discord server. Join it, then sign in again."],
  norole: ["Member role not found", "You're in the Discord, but without the Team Use More Kerb member role. Connect YouTube in Discord (Settings > Connections) with the account you joined on, wait a few minutes, then try again."],
  cancelled: ["Sign-in cancelled", "No problem. Head back to the app whenever you're ready."],
  error: ["Something went wrong", "Discord didn't answer properly. Please try again in a minute."]
};

export default async (req) => {
  const url = new URL(req.url);
  const self = new URL(url.origin + url.pathname);
  const q = url.searchParams;
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { headers: { ...cors(origin), "Access-Control-Allow-Methods": "GET", "Access-Control-Allow-Headers": "Content-Type" } });

  const ready = ["DISCORD_CLIENT_ID", "DISCORD_CLIENT_SECRET", "DISCORD_GUILD_ID", "DISCORD_ROLE_IDS", "UMK_PASS_SECRET"].every(env);
  if (!ready) return q.has("poll") || q.has("verify") ? json({ error: "not-configured" }, 503, origin)
    : page("Not switched on yet", "Members sign-in hasn't been set up yet.", "", "");

  const store = getStore("umk-gate");

  /* the app checks a pass is still valid */
  if (q.has("verify")) {
    const p = unsign(q.get("verify"));
    return json({ ok: !!(p && p.exp > Date.now()) }, 200, origin);
  }

  /* the app waits for the result of a sign-in that finished in another window */
  if (q.has("poll")) {
    const sid = q.get("poll");
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(sid)) return json({ error: "bad" }, 400, origin);
    const r = await store.get("s/" + sid, { type: "json" });
    if (!r) return json({ pending: true }, 200, origin);
    await store.delete("s/" + sid);
    return json(r, 200, origin);
  }

  /* start: send them to Discord */
  if (q.has("start")) {
    const sid = q.get("sid") || "", ret = q.get("ret") || "";
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(sid) || !okReturn(ret, self)) return page("Something went wrong", "That sign-in link isn't valid.", "", "");
    const state = sign({ sid, ret, ts: Date.now(), n: randomBytes(6).toString("hex") });
    const d = new URL("https://discord.com/oauth2/authorize");
    d.search = new URLSearchParams({ client_id: env("DISCORD_CLIENT_ID"), response_type: "code", redirect_uri: self.href, scope: "identify guilds.members.read", state, prompt: "none" });
    return Response.redirect(d.href, 302);
  }

  /* back from Discord */
  const st = unsign(q.get("state"));
  if (!st || Date.now() - st.ts > 15 * 60 * 1000 || !okReturn(st.ret, self)) return page("Sign-in expired", "Please go back to the app and tap Sign in with Discord again.", "", "");
  const finish = async (result) => {
    await store.setJSON("s/" + st.sid, { ...result, at: Date.now() });
    const back = st.ret + "#" + (result.token ? "umkpass=" + result.token : "umkdenied=" + result.denied);
    if (result.token) return page("You're in!", "Welcome to the Use More Kerb app. Head back to it and it'll be unlocked.", back, "Open the app");
    const [t, m] = DENIED[result.denied] || DENIED.error;
    return page(t, m, back, "Back to the app");
  };
  if (q.get("error")) return finish({ denied: "cancelled" });

  try {
    const tok = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: env("DISCORD_CLIENT_ID"), client_secret: env("DISCORD_CLIENT_SECRET"), grant_type: "authorization_code", code: q.get("code") || "", redirect_uri: self.href })
    }).then(r => r.json());
    if (!tok.access_token) return finish({ denied: "error" });
    const auth = { Authorization: "Bearer " + tok.access_token };
    const mr = await fetch(`https://discord.com/api/users/@me/guilds/${env("DISCORD_GUILD_ID")}/member`, { headers: auth });
    let userId = "", name = "", roles = [];
    if (mr.ok) { const m = await mr.json(); userId = m.user?.id || ""; name = m.nick || m.user?.global_name || m.user?.username || ""; roles = m.roles || []; }
    else { const u = await fetch("https://discord.com/api/users/@me", { headers: auth }).then(r => r.ok ? r.json() : {}); userId = u.id || ""; name = u.global_name || u.username || ""; }
    const extra = list("DISCORD_EXTRA_USER_IDS").includes(userId);
    if (!extra && !mr.ok) return finish({ denied: mr.status === 404 ? "notinserver" : "error" });
    const allowed = list("DISCORD_ROLE_IDS");
    if (!extra && !roles.some(r => allowed.includes(r))) return finish({ denied: "norole" });
    const days = Number(env("UMK_PASS_DAYS")) || 30;
    const exp = Date.now() + days * 864e5;
    return finish({ token: sign({ u: userId, exp }), exp, name });
  } catch (e) {
    return finish({ denied: "error" });
  }
};
