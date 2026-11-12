/* Race Coach AI answers. Runs on Netlify only.
   Needs the environment variable ANTHROPIC_API_KEY (Netlify: Site configuration > Environment variables).
   Optional: COACH_MODEL (defaults to claude-haiku-5-5), COACH_DAILY_LIMIT (questions per visitor per day, default 20). */
const hits = new Map(); // best-effort per-visitor limit (resets when Netlify restarts the function)

const SYSTEM = `You are the Use More Kerb Race Coach, an expert kart racing driver and engineer helping UK and European karters.
Answer the driver's problem concisely for a phone screen. Use these sections with short bullet points:
## Most likely cause
## Fix it with your driving
## Fix it with setup (owner karts only: list changes in the order to try them, one at a time, with a few words on why)
## Check first
Use general CIK-style sprint kart principles (track width, ride height, caster, camber, Ackermann, toe, seat position, axle stiffness, hub length, tyre pressures, torsion bars, gearing, carburation). Say when advice depends on the chassis maker.
If the driver is in a RENTAL kart, leave out the setup section entirely and focus on driving technique, body position, lines, braking and momentum.
Never invent specific numbers you are unsure of. If a problem could be a safety issue (brakes, steering, seizing engine, bent parts), say to stop and check the kart first.
For Rotax Senior MAX engines, use the team's own notes: an engine needs fuel, spark and compression; starter only clicks = battery, earth, then starter motor; starter spins freely = Bendix; cranks but no spark = plug, coil, wiring harness, crank position sensor, ECU in that order; spark but no start = choke, clean carb and check floats, carb and tank vents, fuel reaching carb, pump hoses on the right ports, air leaks (zip-tie hoses), blocked exhaust, reed petals, compression; no power out of corners = exhaust valve should open at about 8,000 rpm, clean the power valve, vacuum hoses, green one-way valve, solenoid, ECU, impulse hose leaks, needle position 3 or 4 and clip, rear axle moving in bearings; popping on the straight = lean, bogging at about 13,000 rpm = rich, rev limit about 14,500 rpm; revs but no drive = clutch or flywheel nut (Loctite, experienced builders only); over 60°C with flaps open = coolant level and water pump gears; vibration = balance shaft timing marks.
Stay on karting. No preamble.`;

export default async (req) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return json({ error: "AI answers aren't switched on yet." }, 503);

  let body; try { body = await req.json(); } catch { return json({ error: "Bad request" }, 400); }
  const q = String(body.question || "").trim().slice(0, 600);
  if (q.length < 4) return json({ error: "Describe the problem in a few words." }, 400);
  const rental = body.mode === "rental";
  const conds = Array.isArray(body.conditions) ? body.conditions.filter(c => ["dry","wet","cold","hot"].includes(c)) : [];

  const ip = req.headers.get("x-nf-client-connection-ip") || req.headers.get("x-forwarded-for") || "?";
  const day = new Date().toISOString().slice(0, 10), k = ip + "|" + day, n = (hits.get(k) || 0) + 1;
  const limit = +process.env.COACH_DAILY_LIMIT || 20;
  if (n > limit) return json({ error: "You've reached today's limit for AI answers. The guide still works." }, 429);
  hits.set(k, n); if (hits.size > 5000) hits.clear();

  const user = `Kart: ${rental ? "RENTAL kart (driving advice only, no setup)" : "owner kart"}.` +
    (conds.length ? ` Conditions: ${conds.join(", ")}.` : "") + `\nProblem: ${q}`;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: process.env.COACH_MODEL || "claude-haiku-5-5", max_tokens: 700, system: SYSTEM, messages: [{ role: "user", content: user }] })
    });
    const d = await r.json();
    if (!r.ok) return json({ error: "The AI coach is unavailable right now." }, 502);
    const answer = (d.content || []).filter(c => c.type === "text").map(c => c.text).join("\n").trim();
    return json({ answer });
  } catch (e) {
    return json({ error: "The AI coach is unavailable right now." }, 502);
  }
};

function json(o, status = 200) {
  return new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
}
