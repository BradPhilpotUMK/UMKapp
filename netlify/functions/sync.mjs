/* Saves each signed-in person's app data (Season Planner, Team Manager, favourites and so on) against their
   Discord sign-in, so it follows them to any phone or browser. Runs on Netlify only.
   GET  /.netlify/functions/sync                 -> { items: { key: { v, t } } }
   POST /.netlify/functions/sync  { items: {...} } -> merges newer items, returns everything
   Auth: "Authorization: Bearer <pass>" from discord-auth.mjs. Uses UMK_PASS_SECRET like the other functions. */
import { createHmac, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";

const env = k => (process.env[k] || "").trim();
function unsign(tok) {
  const [body, mac] = String(tok || "").split(".");
  if (!body || !mac || !env("UMK_PASS_SECRET")) return null;
  const want = createHmac("sha256", env("UMK_PASS_SECRET")).update(body).digest("base64url");
  const a = Buffer.from(mac), b = Buffer.from(want);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { const p = JSON.parse(Buffer.from(body, "base64url").toString()); return p && p.exp > Date.now() && p.u ? p : null; } catch { return null; }
}
const cors = origin => ({ "Access-Control-Allow-Origin": origin || "*", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Vary": "Origin", "Cache-Control": "no-store" });
const json = (obj, status, origin) => new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json", ...cors(origin) } });

const KEY = /^umk-[a-z0-9-]{1,48}$/, MAX_ITEM = 600 * 1024, MAX_ALL = 3 * 1024 * 1024;

export default async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(origin) });
  const pass = unsign((req.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""));
  if (!pass) return json({ error: "signin" }, 401, origin);
  const store = getStore({ name: "umk-sync", consistency: "strong" }), id = "u/" + String(pass.u).replace(/\D/g, "");
  const have = (await store.get(id, { type: "json" })) || { items: {} };
  if (req.method === "GET") return json(have, 200, origin);
  if (req.method !== "POST") return json({ error: "bad" }, 405, origin);
  let body; try { body = await req.json(); } catch { return json({ error: "bad" }, 400, origin); }
  const items = body && typeof body.items === "object" ? body.items : {};
  let changed = false;
  for (const [k, it] of Object.entries(items)) {
    if (!KEY.test(k) || !it || typeof it.t !== "number") continue;
    if (it.v !== null && (typeof it.v !== "string" || it.v.length > MAX_ITEM)) continue;
    const cur = have.items[k];
    if (!cur || it.t > cur.t) { have.items[k] = { v: it.v, t: Math.min(it.t, Date.now() + 60000) }; changed = true; }
  }
  if (changed) {
    if (JSON.stringify(have).length > MAX_ALL) return json({ error: "full" }, 413, origin);
    have.at = Date.now(); await store.setJSON(id, have);
  }
  return json(have, 200, origin);
};
