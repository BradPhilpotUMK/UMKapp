/* Members' Championship race sign-ups. Runs on Netlify only.
   Members sign up in the app (signed in with Discord, member role checked by discord-auth.mjs).
   Races and grid sizes come from data/members.json (rounds[].id, rounds[].capacity, rounds[].date).
   The first `capacity` entries are on the grid, the rest are on the waiting list; a withdrawal moves the next person up.

   Uses the same environment variables as discord-auth.mjs (UMK_PASS_SECRET, DISCORD_EXTRA_USER_IDS = organisers).
   Optional: DISCORD_WEBHOOK_URL  a webhook for #race-entry (Edit Channel > Integrations > Webhooks > New Webhook > Copy URL),
             so each sign-up and withdrawal is posted in Discord. */
import { createHmac, timingSafeEqual } from "node:crypto";
import { getStore } from "@netlify/blobs";

const env = k => (process.env[k] || "").trim();
const list = k => env(k).split(",").map(s => s.trim()).filter(Boolean);

function unsign(tok) {
  const [body, mac] = String(tok || "").split(".");
  if (!body || !mac || !env("UMK_PASS_SECRET")) return null;
  const want = createHmac("sha256", env("UMK_PASS_SECRET")).update(body).digest("base64url");
  const a = Buffer.from(mac), b = Buffer.from(want);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try { const p = JSON.parse(Buffer.from(body, "base64url").toString()); return p && p.exp > Date.now() ? p : null; } catch { return null; }
}

const cors = origin => ({ "Access-Control-Allow-Origin": origin || "*", "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Vary": "Origin", "Cache-Control": "no-store" });
const json = (obj, status, origin) => new Response(JSON.stringify(obj), { status: status || 200, headers: { "Content-Type": "application/json", ...cors(origin) } });
const clean = (s, n) => String(s || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, n);

/* race details come from the main app address (GitHub Pages), so editing data/members.json never needs a Netlify publish */
const ROUNDS_URL = env("UMK_ROUNDS_URL") || "https://bradphilpotumk.github.io/season-planner/data/members.json";
async function rounds(origin) {
  for (const u of [ROUNDS_URL + "?t=" + Date.now(), origin + "/data/members.json"]) {
    try { const r = await fetch(u, { cache: "no-store" }); if (r.ok) { const d = await r.json(); if (Array.isArray(d.rounds)) return d.rounds; } } catch {}
  }
  return [];
}

async function post(text) {
  const url = env("DISCORD_WEBHOOK_URL");
  if (!url) return;
  try { await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: text, allowed_mentions: { parse: [] } }) }); } catch {}
}

function view(ev, data, me, admin) {
  const cap = Number(ev.capacity) || 30;
  const entries = data.entries || [];
  const out = {
    event: { id: ev.id, title: ev.title, date: ev.date, time: ev.time, venue: ev.venue, format: ev.format, price: ev.price, payment: ev.payment || null, capacity: cap, open: isOpen(ev) },
    onGrid: Math.min(entries.length, cap), waiting: Math.max(0, entries.length - cap),
    grid: entries.slice(0, cap).map(e => e.racingName),
    waitlist: entries.slice(cap).map(e => e.racingName)
  };
  const i = entries.findIndex(e => e.u === me);
  if (i >= 0) out.me = { status: i < cap ? "grid" : "waiting", pos: i < cap ? i + 1 : i - cap + 1, racingName: entries[i].racingName, weight: entries[i].weight };
  if (admin) out.admin = entries.map((e, k) => ({ u: e.u, racingName: e.racingName, weight: e.weight, discordName: e.discordName || "", at: e.at, paid: !!e.paid, status: k < cap ? "grid" : "waiting" }));
  return out;
}
function isOpen(ev) {
  if (ev.signupOpen === false) return false;
  if (!ev.date) return true;
  const [y, m, d] = ev.date.split("-").map(Number);
  const [hh, mm] = String(ev.time || "23:59").split(":").map(Number);
  return Date.now() < Date.UTC(y, m - 1, d, hh || 0, mm || 0) - 60 * 60 * 1000; /* closes an hour before the start (UK winter time) */
}

export default async (req) => {
  const url = new URL(req.url), origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(origin) });

  const pass = unsign((req.headers.get("authorization") || "").replace(/^Bearer\s+/i, ""));
  if (!pass) return json({ error: "signin" }, 401, origin);
  const admin = list("DISCORD_EXTRA_USER_IDS").includes(pass.u);
  if (pass.m === false && !admin) return json({ error: "members" }, 403, origin);

  let body = {};
  if (req.method === "POST") { try { body = await req.json(); } catch { return json({ error: "bad" }, 400, origin); } }
  const id = clean(url.searchParams.get("event") || body.event, 80);
  const ev = (await rounds(url.origin)).find(r => r.id === id);
  if (!ev) return json({ error: "noevent" }, 404, origin);

  const store = getStore("umk-races"), key = "event/" + id;
  if (req.method === "GET") {
    const data = (await store.get(key, { type: "json" })) || { entries: [] };
    return json(view(ev, data, pass.u, admin && url.searchParams.has("admin")), 200, origin);
  }

  const act = body.action;
  if (["paid", "remove"].includes(act) && !admin) return json({ error: "forbidden" }, 403, origin);
  if (["signup", "withdraw"].includes(act) && !isOpen(ev) && !admin) return json({ error: "closed" }, 409, origin);

  /* read-modify-write, retried if two people sign up at the same moment */
  for (let attempt = 0; attempt < 6; attempt++) {
    const got = await store.getWithMetadata(key, { type: "json" });
    const data = (got && got.data) || { entries: [] };
    const entries = data.entries || (data.entries = []);
    const cap = Number(ev.capacity) || 30;
    let note = "";

    if (act === "signup") {
      const racingName = clean(body.racingName, 40);
      const weight = Math.round(Number(body.weight) * 10) / 10;
      if (racingName.length < 2) return json({ error: "name" }, 400, origin);
      if (!(weight >= 25 && weight <= 200)) return json({ error: "weight" }, 400, origin);
      const i = entries.findIndex(e => e.u === pass.u);
      if (i >= 0) { entries[i].racingName = racingName; entries[i].weight = weight; }
      else {
        entries.push({ u: pass.u, racingName, weight, discordName: clean(pass.n, 60), at: Date.now(), paid: false });
        const n = entries.length;
        note = n <= cap ? `🏁 **${racingName}** signed up for ${ev.title} (${n}/${cap} on the grid)` : `⏳ **${racingName}** joined the waiting list for ${ev.title} (#${n - cap})`;
      }
    } else if (act === "withdraw" || act === "remove") {
      const who = act === "remove" ? clean(body.u, 40) : pass.u;
      const i = entries.findIndex(e => e.u === who);
      if (i < 0) return json(view(ev, data, pass.u, admin), 200, origin);
      const [gone] = entries.splice(i, 1);
      note = `↩️ **${gone.racingName}** ${act === "remove" ? "was removed from" : "withdrew from"} ${ev.title}`;
      if (i < cap && entries.length >= cap) note += `. **${entries[cap - 1].racingName}** moves up from the waiting list onto the grid`;
    } else if (act === "paid") {
      const e = entries.find(x => x.u === clean(body.u, 40));
      if (e) e.paid = !!body.paid;
    } else return json({ error: "bad" }, 400, origin);

    const opts = got && got.etag ? { onlyIfMatch: got.etag } : { onlyIfNew: true };
    const res = await store.setJSON(key, data, opts);
    if (res && res.modified === false) continue; /* someone else wrote first: try again with fresh data */
    if (note) await post(note);
    return json(view(ev, data, pass.u, admin && body.admin), 200, origin);
  }
  return json({ error: "busy" }, 503, origin);
};
