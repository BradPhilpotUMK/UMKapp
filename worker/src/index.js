/* Use More Kerb app service (Cloudflare Workers, free plan). Replaces the old Netlify functions.
   Routes (the last part of the path decides, so /discord-auth and /.netlify/functions/discord-auth both work):
     /discord-auth  Discord sign-in (start, callback, poll, verify)
     /sync          each signed-in person's saved app data
     /coach         Race Coach AI answers (needs the ANTHROPIC_API_KEY secret; without it the app's own guide is used)
   Storage: the D1 database bound as DB (tables are created automatically).
   Secrets (Cloudflare: Workers & Pages > umk-api > Settings > Variables and secrets):
     DISCORD_CLIENT_SECRET  only if the Discord app isn't a Public Client
     ANTHROPIC_API_KEY      optional; without it Race Coach uses Cloudflare's free Workers AI
   The pass signing key is made automatically the first time and kept in the database. */

const enc = new TextEncoder();
const b64u = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const b64uStr = s => b64u(enc.encode(s));
const unb64uStr = s => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)));
const rand = n => b64u(crypto.getRandomValues(new Uint8Array(n)));
const list = s => String(s || "").split(",").map(x => x.trim()).filter(Boolean);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

async function setup(env) {
  if (setup.done) return;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT, exp INTEGER)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS sync (u TEXT PRIMARY KEY, data TEXT, at INTEGER)")
  ]);
  setup.done = true;
}
async function kvGet(env, k) { const r = await env.DB.prepare("SELECT v, exp FROM kv WHERE k=?").bind(k).first(); if (!r) return null; if (r.exp && r.exp < Date.now()) { await kvDel(env, k); return null; } return JSON.parse(r.v); }
async function kvSet(env, k, v, ttlMs) { await env.DB.prepare("INSERT OR REPLACE INTO kv (k, v, exp) VALUES (?, ?, ?)").bind(k, JSON.stringify(v), ttlMs ? Date.now() + ttlMs : null).run(); }
async function kvDel(env, k) { await env.DB.prepare("DELETE FROM kv WHERE k=?").bind(k).run(); }

let KEY = null;
async function hmacKey(env) {
  if (KEY) return KEY;
  let s = await kvGet(env, "config/pass-secret");
  if (!s) { s = rand(48); await env.DB.prepare("INSERT OR IGNORE INTO kv (k, v, exp) VALUES (?, ?, NULL)").bind("config/pass-secret", JSON.stringify(s)).run(); s = await kvGet(env, "config/pass-secret"); }
  KEY = await crypto.subtle.importKey("raw", enc.encode(s), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  return KEY;
}
async function sign(env, obj) { const body = b64uStr(JSON.stringify(obj)); return body + "." + b64u(await crypto.subtle.sign("HMAC", await hmacKey(env), enc.encode(body))); }
async function unsign(env, tok) {
  const [body, mac] = String(tok || "").split(".");
  if (!body || !mac) return null;
  try {
    const sig = Uint8Array.from(atob(mac.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
    if (!(await crypto.subtle.verify("HMAC", await hmacKey(env), sig, enc.encode(body)))) return null;
    return JSON.parse(unb64uStr(body));
  } catch { return null; }
}
async function sha256b64u(s) { return b64u(await crypto.subtle.digest("SHA-256", enc.encode(s))); }

const cors = origin => ({ "Access-Control-Allow-Origin": origin || "*", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Vary": "Origin", "Cache-Control": "no-store" });
const json = (obj, status, origin) => new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json", ...cors(origin) } });
function page(title, msg, link, linkText) {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>html,body{margin:0;background:#0b0b0c;color:#F1F0EC;font:16px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
main{max-width:420px;margin:0 auto;padding:56px 22px;text-align:center}h1{font-size:26px;margin:0 0 10px}p{color:#b9b8b3;margin:0 0 22px}
a{display:inline-block;background:#FF0074;color:#fff;font-weight:800;text-decoration:none;padding:13px 20px;border-radius:14px}</style></head>
<body><main><h1>${esc(title)}</h1><p>${esc(msg)}</p>${link ? `<a href="${esc(link)}">${esc(linkText)}</a>` : ""}</main></body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
const DENIED = {
  notinserver: ["Not in the Discord yet", "Your Discord account isn't in the Use More Kerb Discord server. Join it, then sign in again."],
  cancelled: ["Sign-in cancelled", "No problem. Head back to the app whenever you're ready."],
  error: ["Something went wrong", "Discord didn't answer properly. Please try again in a minute."]
};
function okReturn(env, ret, self) {
  try { const u = new URL(ret); if (u.protocol !== "https:" && u.hostname !== "localhost") return false; return u.origin === self.origin || list(env.ALLOWED_HOSTS).includes(u.hostname); } catch { return false; }
}

async function discordAuth(req, env, url, origin) {
  const self = new URL(url.origin + url.pathname), q = url.searchParams;
  if (q.has("verify")) { const p = await unsign(env, q.get("verify")); const ok = !!(p && p.exp > Date.now()); return json({ ok, m: ok ? p.m !== false : false }, 200, origin); }
  if (q.has("poll")) {
    const sid = q.get("poll"); if (!/^[A-Za-z0-9_-]{16,64}$/.test(sid)) return json({ error: "bad" }, 400, origin);
    const r = await kvGet(env, "s/" + sid); if (!r) return json({ pending: true }, 200, origin);
    await kvDel(env, "s/" + sid); return json(r, 200, origin);
  }
  if (q.has("start")) {
    const sid = q.get("sid") || "", ret = q.get("ret") || "";
    if (!/^[A-Za-z0-9_-]{16,64}$/.test(sid) || !okReturn(env, ret, self)) return page("Something went wrong", "That sign-in link isn't valid.", "", "");
    const state = await sign(env, { sid, ret, ts: Date.now(), n: rand(6) });
    const verifier = rand(48);
    await kvSet(env, "v/" + sid, { verifier }, 20 * 60 * 1000);
    const d = new URL("https://discord.com/oauth2/authorize");
    d.search = new URLSearchParams({ client_id: env.DISCORD_CLIENT_ID, response_type: "code", redirect_uri: self.href, scope: "identify guilds.members.read", state, prompt: "none", code_challenge: await sha256b64u(verifier), code_challenge_method: "S256" });
    return Response.redirect(d.href, 302);
  }
  const st = await unsign(env, q.get("state"));
  if (!st || Date.now() - st.ts > 15 * 60 * 1000 || !okReturn(env, st.ret, self)) return page("Sign-in expired", "Please go back to the app and tap Sign in with Discord again.", "", "");
  const finish = async (result) => {
    await kvSet(env, "s/" + st.sid, { ...result, at: Date.now() }, 20 * 60 * 1000);
    const back = st.ret + "#" + (result.token ? "umkpass=" + result.token : "umkdenied=" + result.denied);
    if (result.token) return page("You're in!", result.m ? "Welcome, Team Use More Kerb member. Head back to the app and everything's unlocked." : "Head back to the app. Where's Brad racing, Standings and the Store are open to you; channel members unlock everything else.", back, "Open the app");
    const [t, m] = DENIED[result.denied] || DENIED.error; return page(t, m, back, "Back to the app");
  };
  if (q.get("error")) return finish({ denied: "cancelled" });
  try {
    const v = await kvGet(env, "v/" + st.sid); await kvDel(env, "v/" + st.sid);
    const form = { client_id: env.DISCORD_CLIENT_ID, grant_type: "authorization_code", code: q.get("code") || "", redirect_uri: self.href };
    if (v && v.verifier) form.code_verifier = v.verifier;
    if (env.DISCORD_CLIENT_SECRET) form.client_secret = env.DISCORD_CLIENT_SECRET;
    const tok = await fetch("https://discord.com/api/oauth2/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(form) }).then(r => r.json());
    if (!tok.access_token) return finish({ denied: "error" });
    const auth = { Authorization: "Bearer " + tok.access_token };
    const mr = await fetch(`https://discord.com/api/users/@me/guilds/${env.DISCORD_GUILD_ID}/member`, { headers: auth });
    let userId = "", name = "", roles = [];
    if (mr.ok) { const m = await mr.json(); userId = m.user?.id || ""; name = m.nick || m.user?.global_name || m.user?.username || ""; roles = m.roles || []; }
    else { const u = await fetch("https://discord.com/api/users/@me", { headers: auth }).then(r => r.ok ? r.json() : {}); userId = u.id || ""; name = u.global_name || u.username || ""; }
    if (!userId) return finish({ denied: "error" });
    const extra = list(env.DISCORD_EXTRA_USER_IDS).includes(userId);
    if (!extra && !mr.ok) return finish({ denied: mr.status === 404 ? "notinserver" : "error" });
    const member = extra || roles.some(r => list(env.DISCORD_ROLE_IDS).includes(r));
    const exp = Date.now() + (Number(env.PASS_DAYS) || 180) * 864e5;
    return finish({ token: await sign(env, { u: userId, exp, m: member, n: String(name || "").slice(0, 60) }), exp, name, m: member });
  } catch (e) { return finish({ denied: "error" }); }
}

const SYNC_KEY = /^umk-[a-z0-9-]{1,48}$/, MAX_ITEM = 600 * 1024, MAX_ALL = 3 * 1024 * 1024;
async function syncRoute(req, env, origin) {
  const pass = await unsign(env, (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""));
  if (!pass || !(pass.exp > Date.now()) || !pass.u) return json({ error: "signin" }, 401, origin);
  const u = String(pass.u).replace(/\D/g, "");
  const row = await env.DB.prepare("SELECT data FROM sync WHERE u=?").bind(u).first();
  const have = row ? JSON.parse(row.data) : { items: {} };
  if (req.method === "GET") return json(have, 200, origin);
  if (req.method !== "POST") return json({ error: "bad" }, 405, origin);
  let body; try { body = await req.json(); } catch { return json({ error: "bad" }, 400, origin); }
  const items = body && typeof body.items === "object" && body.items ? body.items : {};
  let changed = false;
  for (const [k, it] of Object.entries(items)) {
    if (!SYNC_KEY.test(k) || !it || typeof it.t !== "number") continue;
    if (it.v !== null && (typeof it.v !== "string" || it.v.length > MAX_ITEM)) continue;
    const cur = have.items[k];
    if (!cur || it.t > cur.t) { have.items[k] = { v: it.v, t: Math.min(it.t, Date.now() + 60000) }; changed = true; }
  }
  if (changed) {
    have.at = Date.now(); const data = JSON.stringify(have);
    if (data.length > MAX_ALL) return json({ error: "full" }, 413, origin);
    await env.DB.prepare("INSERT OR REPLACE INTO sync (u, data, at) VALUES (?, ?, ?)").bind(u, data, have.at).run();
  }
  return json(have, 200, origin);
}

const COACH_SYSTEM = `You are the Use More Kerb Race Coach, an expert kart racing driver and engineer helping UK and European karters.
Answer the driver's problem concisely for a phone screen. Use these sections with short bullet points:
## Most likely cause
## Fix it with your driving
## Fix it with setup (owner karts only: list changes in the order to try them, one at a time, with a few words on why)
## Check first
Use general CIK-style sprint kart principles (track width, ride height, caster, camber, Ackermann, toe, seat position, axle stiffness, hub length, tyre pressures, torsion bars, gearing, carburation).
If the driver is in a RENTAL kart, leave out the setup section entirely and focus on driving technique, body position, lines, braking and momentum.
Never invent specific numbers you are unsure of. If a problem could be a safety issue (brakes, steering, seizing engine, bent parts), say to stop and check the kart first.
Stay on karting. No preamble. Use British English. Never use em dashes.`;
async function coach(req, env, origin) {
  if (req.method !== "POST") return json({ error: "POST only" }, 405, origin);
  if (!env.ANTHROPIC_API_KEY && !env.AI) return json({ error: "AI answers aren't switched on yet." }, 503, origin);
  let body; try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400, origin); }
  const qn = String(body.question || "").trim().slice(0, 600);
  if (qn.length < 4) return json({ error: "Describe the problem in a few words." }, 400, origin);
  const ip = req.headers.get("cf-connecting-ip") || "?", day = new Date().toISOString().slice(0, 10), k = "coach/" + ip + "/" + day;
  const n = ((await kvGet(env, k)) || 0) + 1;
  const all = "coach/all/" + day, total = ((await kvGet(env, all)) || 0) + 1;
  if (total > (Number(env.COACH_DAILY_TOTAL) || 150)) return json({ error: "The AI coach has answered all it can for today. The guide still works, and the AI is back tomorrow." }, 429, origin);
  if (n > (Number(env.COACH_DAILY_LIMIT) || 20)) return json({ error: "You've reached today's limit for AI answers. The guide still works." }, 429, origin);
  await kvSet(env, k, n, 864e5); await kvSet(env, all, total, 864e5);
  const rental = body.mode === "rental";
  const conds = Array.isArray(body.conditions) ? body.conditions.filter(c => ["dry", "wet", "cold", "hot"].includes(c)) : [];
  const user = `Kart: ${rental ? "RENTAL kart (driving advice only, no setup)" : "owner kart"}.` + (conds.length ? ` Conditions: ${conds.join(", ")}.` : "") + `\nProblem: ${qn}`;
  const tidy = t => String(t || "").replace(/<think>[\s\S]*?<\/think>/g, "").replace(/\u2014/g, ", ").trim();
  if (!env.ANTHROPIC_API_KEY) {
    /* free: Cloudflare Workers AI (10,000 free units a day; on the free plan it simply stops for the day if that runs out) */
    try {
      const out = await env.AI.run(env.COACH_FREE_MODEL || "@cf/google/gemma-4-26b-a4b-it", { messages: [{ role: "system", content: COACH_SYSTEM }, { role: "user", content: user }], max_tokens: 700, temperature: 0.4 });
      const msg = out && out.choices && out.choices[0] && out.choices[0].message;
      const answer = tidy(out && (typeof out.response === "string" ? out.response : (out.response && JSON.stringify(out.response))) || (msg && (msg.content || msg.reasoning_content)));
      if (!answer) return json({ error: "The AI coach is unavailable right now.", detail: JSON.stringify(out).slice(0, 300) }, 502, origin);
      return json({ answer }, 200, origin);
    } catch (e) { return json({ error: "The AI coach is busy right now. The guide still works.", detail: String(e && e.message || e).slice(0, 160) }, 502, origin); }
  }
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "content-type": "application/json", "x-api-key": env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: env.COACH_MODEL || "claude-haiku-5-5", max_tokens: 700, system: COACH_SYSTEM, messages: [{ role: "user", content: user }] }) });
    const d = await r.json(); if (!r.ok) return json({ error: "The AI coach is unavailable right now." }, 502, origin);
    return json({ answer: tidy((d.content || []).filter(c => c.type === "text").map(c => c.text).join("\n")) }, 200, origin);
  } catch { return json({ error: "The AI coach is unavailable right now." }, 502, origin); }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url), origin = req.headers.get("origin");
    if (req.method === "OPTIONS") return new Response(null, { headers: cors(origin) });
    const route = url.pathname.replace(/\/+$/, "").split("/").pop();
    try {
      await setup(env);
      if (route === "discord-auth") return await discordAuth(req, env, url, origin);
      if (route === "sync") return await syncRoute(req, env, origin);
      if (route === "coach") return await coach(req, env, origin);
      if (route === "race-entry") return json({ error: "discord" }, 410, origin);
      if (route === "" || route === "health") return json({ ok: true, service: "umk-api" }, 200, origin);
      return json({ error: "not found" }, 404, origin);
    } catch (e) { return json({ error: "server", detail: String(e && e.message || e).slice(0, 200) }, 500, origin); }
  },
  /* tidy up old sign-in sessions once a day */
  async scheduled(ev, env) { await setup(env); await env.DB.prepare("DELETE FROM kv WHERE exp IS NOT NULL AND exp < ?").bind(Date.now()).run(); }
};
