/* Use More Kerb Race Coach: troubleshooting guide.
   Each problem: what's happening, driving fixes (owner and rental), setup changes (owner karts, in the order to try them)
   and quick checks. "kw" holds the words and phrases people use for it; "ph" is the part of the corner.
   Setup advice is general CIK-style sprint kart practice: chassis makers differ, so change one thing at a time and
   check it against your chassis maker's guide. */
window.GUIDE = [
{
 id:"under-entry", cat:"Handling", ph:"entry", title:"Understeer on turn-in",
 kw:["understeer","push","pushing","won't turn","wont turn","doesn't turn","doesnt turn","front washes","washes out","front slides","plough","plow","no front grip","lazy front","front end","goes straight","turn in","turn-in","entry","into the corner","braking into"],
 what:"The front tyres can't find grip as you turn in, so the kart runs wide before the apex. It's usually too little weight on the front, too much speed into the corner, or a front end that isn't loading up.",
 drive:[
  "Brake a fraction earlier and carry a little brake into the turn-in (trail braking). It keeps weight on the front tyres.",
  "Turn in with one smooth, progressive input. A sudden big lock just scrubs the fronts.",
  "Slow in, fast out: give up a little entry speed so the kart rotates and you get on the power earlier.",
  "Pick a slightly later turn-in point so you don't need as much steering lock."],
 rental:[
  "Lean your upper body forward and towards the inside as you turn in. In a heavy rental kart this shifts weight onto the front.",
  "Use less steering lock. If the front is sliding, more lock makes it worse.",
  "Brake in a straight line and release smoothly as you turn in; don't stab the brake."],
 setup:[
  {do:"Widen the front track (spacers to the outside of the stub axles)",why:"More front grip and more steering bite on entry."},
  {do:"Move the seat forward (or raise it slightly)",why:"Puts more weight on the front tyres."},
  {do:"Add caster",why:"Increases weight transfer and inside rear lift so the kart rotates."},
  {do:"Add Ackermann (if your stub axles or steering arm allow)",why:"Sharper bite in slow, tight corners."},
  {do:"Set a little toe-out (1–2 mm total)",why:"Quicker response on turn-in."},
  {do:"Fit the front torsion bar (cold or low-grip track)",why:"Stiffens the front for more front bite when grip is low."},
  {do:"Drop front pressures by 0.1 bar (only if the fronts are getting up to temperature)",why:"Bigger contact patch at the front."}],
 check:["Front tyres up to temperature?","Front and rear pressures the same as your base setup?","Steering column and track rods not bent?"],
 cond:{cold:"On a cold track the front often won't bite at all: fit the front bar and run more caster before anything else.",wet:"In the wet, see the wet-weather setup entry: widen the front and raise everything."}
},
{
 id:"under-mid", cat:"Handling", ph:"mid", title:"Understeer mid-corner",
 kw:["understeer","push","mid corner","mid-corner","apex","middle of the corner","won't rotate","wont rotate","doesn't rotate","runs wide","miss the apex","missing the apex","wide at the apex","front scrubs"],
 what:"The kart turns in but stops rotating through the middle of the corner. Usually the inside rear wheel isn't lifting enough, so the rear axle fights the front.",
 drive:[
  "Get your braking done earlier and roll more speed to the apex instead of braking deep.",
  "Hold a steady, smaller steering angle through the middle; adding lock mid-corner just scrubs.",
  "Wait for the kart to point at the exit before going to full throttle."],
 rental:[
  "Lean out of the corner (towards the outside) mid-corner. It helps lift the inside rear wheel so the kart turns.",
  "Keep momentum: a smooth, wide entry with a late apex suits low-power rental karts.",
  "Don't over-slow. If you scrub too much speed the kart bogs and pushes on."],
 setup:[
  {do:"Add caster",why:"More inside rear lift mid-corner, so the kart rotates."},
  {do:"Widen the front track",why:"More front grip and leverage to lift the inside rear."},
  {do:"Raise the seat slightly",why:"Higher centre of gravity means more weight transfer and lift."},
  {do:"Widen the rear track a little",why:"Frees the rear so it slides into the apex."},
  {do:"Fit a stiffer rear axle (warm, grippy track)",why:"Less rear grip, so the rear stops fighting the front."}],
 check:["Inside rear lifting? Watch onboard footage or ask someone at the apex.","Rear tyres not overheating?"],
 cond:{hot:"On a hot, rubbered-in track the rear often has too much grip: widen the rear and go to a stiffer axle first."}
},
{
 id:"under-exit", cat:"Handling", ph:"exit", title:"Understeer on the exit (pushes on the power)",
 kw:["understeer","push","exit","on the power","on throttle","throttle","pushes out","runs wide on exit","won't hold the line","drifts wide","wide on exit","out of the corner"],
 what:"Once you're on the power the front loses grip and the kart drifts wide. Often the rear has more grip than the front, or you're asking for throttle while still holding lots of lock.",
 drive:[
  "Unwind the steering as you add throttle. Throttle and lock fight each other.",
  "Squeeze the throttle progressively instead of going flat while still turning.",
  "Use a later apex so you're straighter when you go to full power."],
 rental:[
  "Straighten the wheel before full throttle. Rental karts have little power, so scrubbing costs a lot of exit speed.",
  "Use all of the track on exit; let the kart run out to the kerb instead of holding it tight."],
 setup:[
  {do:"Widen the rear track or fit a stiffer rear axle",why:"If the rear has more grip than the front, it pushes the front wide on the power."},
  {do:"Move the seat forward",why:"More front weight under power."},
  {do:"Widen the front track",why:"More front grip all through the corner."},
  {do:"Check rear ride height: try raising the rear",why:"More weight transfer on exit."}],
 check:["Are the fronts worn on the outside edge (too much scrub)?","Chain tension and rear bearings free?"]
},
{
 id:"over-entry", cat:"Handling", ph:"entry", title:"Oversteer on turn-in (rear steps out)",
 kw:["oversteer","loose","snap","snappy","rear steps out","rear comes round","rear slides","spin","spins","spinning","tail happy","back end","rear end","turn in","entry","braking","into the corner","rear lets go"],
 what:"The rear loses grip as you brake and turn in, so the kart rotates too much or spins. Often too much rear brake bias, braking while turning hard, or too little rear grip.",
 drive:[
  "Finish most of your braking in a straight line before turning in.",
  "Release the brake smoothly as you start turning; a sudden release or a stab of brake unsettles the rear.",
  "Turn in a little more gently. A sharp input on a kart with lots of front grip will flick the rear."],
 rental:[
  "Brake earlier and in a straight line; rental karts usually only brake the rear axle, so braking while turning spins them easily.",
  "Avoid using brake and throttle at the same time.",
  "Lean back slightly into the seat on entry rather than throwing your weight forward."],
 setup:[
  {do:"Narrow the rear track",why:"More rear grip."},
  {do:"Move the seat back",why:"Puts more weight on the rear."},
  {do:"Reduce front track width or caster",why:"Less front bite so the front doesn't overpower the rear."},
  {do:"Set less toe-out (towards zero)",why:"Calmer turn-in."},
  {do:"Fit a softer rear axle (cold or low grip)",why:"More rear grip."},
  {do:"Check brake balance and the rear brake pads/disc",why:"A grabbing or over-strong rear brake locks the rear on entry."}],
 check:["Rear pressures not too high?","Rear hubs tight and wheel nuts torqued?","Brake disc not warped and pads not contaminated?"],
 cond:{cold:"On a cold track the rear may just not be up to temperature yet: give it two or three laps and raise rear pressures slightly to warm them faster."}
},
{
 id:"over-exit", cat:"Handling", ph:"exit", title:"Oversteer on the power (loose on exit)",
 kw:["oversteer","loose","snap","rear steps out","rear slides","wheelspin","wheel spin","spin on exit","on the power","throttle","exit","traction","no traction","sliding on exit","power oversteer","rear lets go"],
 what:"The rear tyres can't put the power down and the back steps out on exit. Either too little rear grip, or too much throttle while still turning.",
 drive:[
  "Be more progressive with the throttle; squeeze rather than stab it.",
  "Unwind the steering as you add power so the rear isn't loaded sideways and longitudinally at once.",
  "Catch slides with small, quick corrections; don't lift sharply."],
 rental:[
  "Usually only an issue in the wet or on worn tyres in a rental kart: feed the throttle in gently and keep the wheel straighter."],
 setup:[
  {do:"Narrow the rear track",why:"More rear grip."},
  {do:"Fit a softer rear axle or longer rear hubs",why:"More rear grip."},
  {do:"Move the seat back",why:"More rear weight."},
  {do:"Lower rear pressures by 0.05–0.1 bar (if they're overheating)",why:"More rear contact patch."}],
 check:["Rear tyres worn or overheated?","Rear axle bent?","Rear hubs and keys tight?"]
},
{
 id:"hop", cat:"Handling", ph:"mid", title:"Hopping or bouncing in corners",
 kw:["hop","hopping","hops","bounce","bouncing","chatter","chattering","jump","jumping","skipping","shudder","shaking","judder","inside wheel lifts too much","front hops","rear hops"],
 what:"Too much grip and weight transfer: the inside rear lifts too high and slams back down, or the front tyres grab and release. Common on grippy, rubbered-in tracks or with too much caster.",
 drive:[
  "Use less steering lock and turn in more smoothly.",
  "Carry a little less entry speed and avoid braking deep into the turn.",
  "Let the kart run slightly wider rather than forcing it to the apex."],
 rental:[
  "Don't lean into the corner or throw your weight about; sit still and smooth.",
  "Less steering lock: hopping in a rental kart usually means you're asking for more than the front can give."],
 setup:[
  {do:"Reduce caster",why:"Less inside rear lift."},
  {do:"Narrow the front track",why:"Less front grip and less jacking."},
  {do:"Lower the seat or move it back",why:"Lower centre of gravity, less weight transfer."},
  {do:"Lower the rear ride height",why:"Less weight transfer."},
  {do:"Fit a stiffer rear axle or shorter rear hubs",why:"Frees up the rear on a high-grip track."},
  {do:"Raise tyre pressures by 0.05–0.1 bar",why:"Less grip and a firmer tyre."},
  {do:"Remove the front torsion bar if fitted",why:"Less front grip."}],
 check:["Front bumper/nassau panel and floor tray not touching the ground?","Seat bolts and stays tight?","Wheel alignment (toe) correct?"],
 cond:{hot:"Hopping usually shows up as the track rubbers in and gets hot: go stiffer and narrower at the front first."}
},
{
 id:"bog", cat:"Handling", ph:"exit", title:"Kart bogs down or binds in corners",
 kw:["bog","bogs","bogging","bind","binding","sticky","stuck","dragging","drags","heavy","grip too much","too much grip","slow out of corners","no drive","wont pull","won't pull","struggles out of corners","kills the revs","loses revs","scrubs speed"],
 what:"The kart has too much rear grip and the inside rear isn't lifting, so the rear axle scrubs and kills your speed and revs, especially in slow corners.",
 drive:[
  "Carry more speed into the corner and use a wider, rounder line so the kart isn't loaded so hard.",
  "Use less steering lock; more lock means more scrub.",
  "Don't over-brake: a kart that's bogging needs momentum."],
 rental:[
  "Lean towards the outside mid-corner to help lift the inside rear.",
  "Momentum is everything in a rental kart: brake less, use wider lines and avoid scrubbing the tyres."],
 setup:[
  {do:"Widen the rear track",why:"Less rear grip, so the rear slides instead of binding."},
  {do:"Fit a stiffer rear axle or shorter rear hubs",why:"Less rear grip."},
  {do:"Add caster or widen the front track",why:"More inside rear lift."},
  {do:"Raise the seat",why:"More weight transfer and lift."},
  {do:"Raise rear pressures by 0.05–0.1 bar",why:"Less rear grip."},
  {do:"Check gearing: try one tooth more on the rear sprocket",why:"If the engine is dropping below its torque band in slow corners."}],
 check:["Brakes not binding (spin the rear wheels by hand)?","Rear bearings and chain free?","Carb not too rich (see 'Engine bogs off the corner')?"],
 cond:{hot:"Binding gets worse as the track grips up: widen the rear and stiffen the axle through the day."}
},
{
 id:"straight", cat:"Speed", ph:"straight", title:"Slow on the straights",
 kw:["slow on the straight","slow on straights","straight line","top speed","no top speed","slow down the straight","speed trap","losing on the straight","straights","overtaken on the straight","no pace"],
 what:"Usually caused by a poor exit from the corner before the straight, but can also be gearing, drag from the chassis, binding brakes or the engine.",
 drive:[
  "Focus on the exit of the corner before the straight: a later apex and an earlier, cleaner throttle application is worth more than anything on the straight.",
  "Tuck in on the straight: elbows in, head down, sit back.",
  "Use the draft when you're close to another kart."],
 rental:[
  "Tuck in: head down, elbows in. Body position makes a big difference in a low-power rental kart.",
  "Use the slipstream wherever you can and avoid scrubbing speed in the corner before the straight."],
 setup:[
  {do:"Check gearing: one tooth fewer on the rear sprocket for more top speed",why:"If you're hitting the rev limit or peak power well before the braking zone."},
  {do:"Raise tyre pressures slightly",why:"Less rolling resistance."},
  {do:"Check the carb setting (see engine problems)",why:"A rich or lean engine won't pull at the top end."},
  {do:"Make sure the kart isn't binding (see 'Kart bogs down')",why:"Too much rear grip costs exit speed."}],
 check:["Brakes not dragging?","Chain tension and alignment correct?","Rear axle straight?","Tyres not over-inflated or worn?"]
},
{
 id:"brakes", cat:"Brakes", ph:"entry", title:"Unstable under braking or locking wheels",
 kw:["brake","brakes","braking","locking","lock up","locks up","lockup","rear locks","unstable under braking","brake pedal","spongy","long pedal","brakes fade","fading","won't stop","wont stop","braking distance"],
 what:"The rear locks or the kart snakes under braking. Usually too much pressure too suddenly, braking while turning, or a brake system problem.",
 drive:[
  "Brake hard initially, then ease off as the kart slows; don't hold maximum pressure all the way.",
  "Brake in a straight line, then release smoothly as you turn in.",
  "If a wheel locks, ease off the pedal until it rolls again; a locked tyre doesn't slow you down."],
 rental:[
  "Rental karts only brake the rear, so they lock easily: squeeze the pedal rather than stamping on it.",
  "Brake earlier and release before you turn in."],
 setup:[
  {do:"Bleed the brakes",why:"Air in the system gives a long, spongy pedal."},
  {do:"Check pads and disc (wear, contamination, warping)",why:"Grabbing or uneven brakes lock the rear."},
  {do:"Move the seat back slightly",why:"More rear weight makes the rear more stable under braking."},
  {do:"If you have front brakes (gearbox karts), adjust the balance towards the front",why:"Less rear locking."}],
 check:["Brake fluid level and condition?","Disc tight on its carrier?","Pedal free play?"]
},
{
 id:"tyres-hot", cat:"Tyres", ph:"any", title:"Grip drops off as the session goes on",
 kw:["grip drops","grip goes","grip goes away","drops off","fall off","falls off","overheating","overheat","tyres too hot","greasy","graining","pressures rising","fade","end of the race","later in the race","late in the session","after a few laps"],
 what:"The tyres are overheating: the pressure rises, the rubber goes greasy and the kart slides more as the laps go by.",
 drive:[
  "Be smoother: sliding the kart heats the tyres fast.",
  "Use less steering lock and avoid scrubbing the fronts.",
  "Manage the first laps; you don't need to push the tyres flat out from lap one in a long race."],
 rental:[
  "Smooth inputs and minimal sliding keep the tyres alive through a long rental race."],
 setup:[
  {do:"Lower cold pressures by 0.05–0.1 bar",why:"They'll rise less and stay in the right window."},
  {do:"Free up the kart (stiffer axle, wider rear track)",why:"A kart that binds and scrubs overheats the rears."},
  {do:"Reduce caster or narrow the front if the fronts are overheating",why:"Less scrub at the front."}],
 check:["Measure hot pressures straight after the session and compare to your target.","Look for graining or blistering on the tyre surface."],
 cond:{hot:"On a hot day start with lower cold pressures than usual."}
},
{
 id:"tyres-cold", cat:"Tyres", ph:"any", title:"No grip on the first laps (tyres won't warm up)",
 kw:["cold","cold tyres","no grip early","first laps","first lap","won't warm","wont warm","warm up","warm-up","slow to warm","takes ages","winter","freezing","low grip","no grip"],
 what:"The tyres aren't reaching working temperature, so the kart slides everywhere for the first few laps (or all session on a cold day).",
 drive:[
  "Weave and brake firmly on the warm-up lap to put heat in the tyres.",
  "Lean on the kart a little harder early on; a little sliding on the first lap brings the temperature up.",
  "Be patient on the first two laps and brake earlier until the grip comes in."],
 rental:[
  "Expect the first laps to be slippery; build up your braking points over two or three laps."],
 setup:[
  {do:"Raise cold pressures by 0.1–0.2 bar",why:"The tyres warm up faster."},
  {do:"Fit a softer rear axle and add the front torsion bar",why:"More mechanical grip on a cold track."},
  {do:"Narrow the rear track and widen the front",why:"More grip all round."},
  {do:"Cover the radiator partly (water-cooled engines)",why:"Keeps the engine at its working temperature on a cold day."}],
 check:["Correct tyre compound for the class and conditions?","Tyres not old and hardened?"],
 cond:{cold:"This is the normal cold-track problem: higher pressures, softer axle, front bar on."}
},
{
 id:"wet", cat:"Wet", ph:"any", title:"No grip in the wet",
 kw:["wet","rain","raining","damp","wets","wet tyres","aquaplaning","aquaplane","puddle","slippery","drizzle","drying","drying track"],
 what:"In the wet you need as much weight transfer and mechanical grip as possible, and a different driving line away from the rubbered-in dry line.",
 drive:[
  "Avoid the dry racing line: it's covered in rubber and is the slipperiest place on a wet track. Drive around the outside of corners on the cleaner tarmac.",
  "Be very smooth with brakes, steering and throttle.",
  "Brake earlier and in a straight line, and use the throttle gently on exit.",
  "Avoid painted kerbs and white lines."],
 rental:[
  "Take wider, cleaner lines off the rubbered racing line.",
  "Everything slower and smoother: early braking, gentle throttle, smaller steering inputs.",
  "Lean your body to help the kart turn, since you can't rely on the tyres."],
 setup:[
  {do:"Fit wet tyres and raise pressures (often around 1.0–1.4 bar cold; check your tyre maker's guide)",why:"Wets need pressure to clear water and warm up."},
  {do:"Raise the chassis: rear ride height up and front ride height up",why:"More weight transfer and grip."},
  {do:"Widen the front track and narrow the rear",why:"More front bite and rear traction."},
  {do:"Move the seat up and forward (if your seat allows)",why:"More weight transfer."},
  {do:"Add caster",why:"More inside rear lift to help the kart turn."},
  {do:"Fit a soft rear axle and the front torsion bar",why:"Maximum mechanical grip."},
  {do:"Gear down (more teeth on the rear sprocket)",why:"Lower top speed and more pull out of slow corners."},
  {do:"Tape over the air intake and protect electrics from water; richen the carb slightly",why:"Cold, damp air needs more fuel."}],
 check:["Wet tyres in good condition (not hardened)?","Visor treated so it doesn't fog?"]
},
{
 id:"kerbs", cat:"Handling", ph:"mid", title:"Kart unsettled over kerbs",
 kw:["kerb","kerbs","curb","curbs","rumble strip","sausage kerb","kerb strike","bumps","bumpy","bump","unsettled","launched","jumps over kerbs"],
 what:"The kart gets thrown off line or loses grip when you hit a kerb or bump. Usually the chassis is too stiff, the ride height too low, or the kerb is being taken at the wrong angle.",
 drive:[
  "Use only the flat part of the kerb, and take it with the steering as straight as possible.",
  "Avoid big kerbs while braking or at full lock.",
  "Keep a relaxed grip on the wheel so the kart can move over the kerb."],
 rental:["Rental karts hate kerbs: only use the flat inside edge and keep the wheels as straight as you can over them."],
 setup:[
  {do:"Raise the ride height front and rear slightly",why:"More clearance and less bottoming over kerbs."},
  {do:"Remove the front torsion bar or fit a softer axle",why:"A softer chassis absorbs kerbs better."},
  {do:"Lower tyre pressures slightly",why:"The tyre absorbs more of the hit."}],
 check:["Floor tray and nassau panel mounts not cracked?","Bent stub axles or track rods after a kerb strike?"]
},
{
 id:"nervous", cat:"Handling", ph:"any", title:"Kart feels nervous or unpredictable",
 kw:["nervous","twitchy","unpredictable","inconsistent","edgy","unstable","darty","darting","no confidence","weird","feels wrong","different every lap","pulls to one side","pulls left","pulls right","wanders"],
 what:"A kart that changes from corner to corner or lap to lap often has something loose, bent or misaligned rather than a setup balance problem.",
 drive:[
  "Concentrate on repeating your braking and turn-in points so you can tell if it's the kart or the driving.",
  "Relax your grip on the wheel; tense arms make the kart feel twitchy."],
 rental:[
  "Rental karts vary a lot. If one feels wrong, ask for a different kart if the format allows.",
  "Check the seat is held firmly and you're not sliding around in it; use padding if it's offered."],
 setup:[
  {do:"Check toe (front alignment) is the same both sides and set to your baseline",why:"Uneven toe makes the kart pull and dart."},
  {do:"Check the chassis is straight on a flat surface or chassis table",why:"A bent chassis handles differently left and right."},
  {do:"Set equal tyre pressures left and right",why:"Uneven pressures pull the kart to one side."},
  {do:"Check the axle is straight and the bearings are tight",why:"A bent or loose axle makes the rear unpredictable."}],
 check:["Wheel nuts, hubs and seat bolts tight?","Steering track rods straight and equal length?","Stub axles not bent after contact?"]
},
{
 id:"steering-heavy", cat:"Handling", ph:"any", title:"Steering heavy or kicking back",
 kw:["heavy steering","steering heavy","steering is heavy","arms hurt","tired arms","wheel kicks","kickback","kick back","steering kicks","fighting the wheel","wheel snaps","steering weight"],
 what:"Heavy steering usually comes from a lot of caster, a wide front track or a lot of front grip. Kickback through the wheel often means the front is grabbing and releasing (hopping).",
 drive:[
  "Use less steering lock and turn in earlier and more smoothly.",
  "Hold the wheel at quarter to three and relax your grip; let the kart self-centre on exit."],
 rental:["Rental karts are heavy to steer: sit close enough that your arms are bent, and use your shoulders, not just your arms."],
 setup:[
  {do:"Reduce caster",why:"Lighter steering and less kickback."},
  {do:"Narrow the front track",why:"Less steering force."},
  {do:"Check the steering wheel and seat position",why:"Arms should be slightly bent with the wrists reaching the top of the wheel."},
  {do:"Set a little toe-out",why:"Lighter feel at the start of the turn."}],
 check:["Steering column bearings free?","Track rod ends not seized?"]
},
{
 id:"bottoming", cat:"Handling", ph:"any", title:"Kart scraping or bottoming out",
 kw:["scrape","scraping","bottom","bottoming","bottoms out","sparks","floor tray","grounding","hitting the ground","seat touches","chassis touches"],
 what:"The seat, floor tray or chassis rails are touching the track, which unsettles the kart and kills its speed.",
 drive:["Avoid big kerbs and bumps where you can."],
 rental:["Usually not something you can change in a rental kart; take kerbs gently."],
 setup:[
  {do:"Raise the ride height front and rear",why:"More clearance."},
  {do:"Raise the seat or check the seat mounting",why:"The seat is often the lowest point."},
  {do:"Check the chassis for bends",why:"A bent rail sits lower on one side."}],
 check:["Look for scrape marks under the seat and chassis rails after the session."]
},
{
 id:"engine-bog", cat:"Engine", ph:"exit", title:"Engine bogs or hesitates off the corner",
 kw:["engine bogs","hesitate","hesitates","stutter","stutters","splutter","coughs","misfire","misfiring","four stroking","4 stroking","rich","too rich","flat spot","poor pickup","pickup","pick up","throttle response","sluggish engine","engine"],
 what:"The engine stumbles when you open the throttle out of slow corners. Often too rich (too much fuel), wrong gearing, or a dirty air filter.",
 drive:["Open the throttle progressively out of slow corners, and use a wider line so the revs don't drop so far."],
 rental:[],
 owner:true,
 setup:[
  {do:"Lean the carb slightly (low-speed needle or jet: small steps only)",why:"A rich mixture bogs at low revs."},
  {do:"Gear down one tooth (more teeth on the rear sprocket)",why:"Keeps revs higher out of slow corners."},
  {do:"Clean or replace the air filter",why:"A blocked filter makes the mixture rich."},
  {do:"Check the spark plug colour",why:"Black and sooty means rich, white means lean."}],
 check:["Fuel fresh and mixed at the right oil ratio?","Fuel filter and lines clear?","Spark plug gap and condition?"],
 cond:{cold:"Cold, dense air needs more fuel; humid or hot air needs less. Adjust the carb with the weather."}
},
{
 id:"engine-lean", cat:"Engine", ph:"straight", title:"Engine revs high then loses power (running lean)",
 kw:["lean","too lean","seize","seized","seizing","nip","nipped","tightens","tightening","loses power","power loss","overrevs","screaming","hot engine","overheating engine","engine temperature","water temperature"],
 what:"The engine is running lean (too little fuel): it may rev hard then tighten or lose power at the end of the straight. This can seize the engine, so stop and check.",
 drive:["If the engine tightens, pull in the clutch (or lift) immediately and coast off the circuit."],
 rental:[],
 owner:true,
 setup:[
  {do:"Richen the carb (high-speed needle or main jet: one step at a time)",why:"Prevents seizure and restores power."},
  {do:"Check for air leaks at the inlet manifold and carb gaskets",why:"An air leak leans the mixture."},
  {do:"Check engine temperature and radiator (water-cooled)",why:"Overheating causes nipping."}],
 check:["Spark plug white or blistered = lean.","Fuel flowing freely (pump, filter, tank breather)?"]
},
{
 id:"gearing", cat:"Speed", ph:"straight", title:"Gearing: hitting the limiter or slow out of corners",
 kw:["gearing","sprocket","gear ratio","rev limiter","limiter","bouncing off the limiter","hitting the limiter","run out of revs","not enough revs","short geared","long geared","teeth","axle sprocket"],
 what:"Gearing trades top speed against acceleration. Too short and you hit the limiter early on the straight; too long and the engine bogs out of slow corners.",
 drive:["Use data or listen to the engine: you want to reach peak revs just before the braking point on the longest straight."],
 rental:[],
 owner:true,
 setup:[
  {do:"Hitting the limiter early: take 1 tooth off the rear sprocket",why:"More top speed."},
  {do:"Slow out of corners and never reaching the limiter: add 1 tooth to the rear sprocket",why:"More acceleration."},
  {do:"Re-check chain tension after any sprocket change",why:"A loose chain can jump off."}],
 check:["Note the gearing that works at each track in your setup notes."]
},
{
 id:"chain", cat:"Engine", ph:"any", title:"Chain jumping or coming off",
 kw:["chain","chain off","chain came off","chain jumping","throws the chain","chain snapped","chain broke","chain noise"],
 what:"The chain is too loose, the sprockets are misaligned, or the sprockets and chain are worn.",
 drive:[],
 rental:[],
 owner:true,
 setup:[
  {do:"Set chain tension to about 1 cm of play at the middle",why:"Too loose and it jumps; too tight and it robs power and wears bearings."},
  {do:"Align the engine and axle sprockets with a straight edge",why:"Misalignment throws the chain off in corners."},
  {do:"Replace a worn chain and sprocket together",why:"Hooked teeth and a stretched chain jump."}],
 check:["Engine mount bolts tight (the engine can move under load)?","Chain guard fitted?"]
},
{
 id:"line", cat:"Driving", ph:"any", title:"Losing time but the kart feels fine",
 kw:["slow","losing time","lap time","lap times","pace","off the pace","faster","quicker","consistency","consistent","racing line","line","driving","technique","how to be faster","where am i losing","braking point","apex"],
 what:"If the kart feels balanced but you're off the pace, the gain is usually in your lines, braking points and exits.",
 drive:[
  "Focus on exits: a later apex and earlier throttle on the corner before each straight.",
  "Brake later and harder, but release smoothly as you turn in.",
  "Use all the track on entry and exit, right out to the kerbs.",
  "Look ahead: eyes up and through the corner to the exit.",
  "Compare onboard footage or data with a faster driver, corner by corner."],
 rental:[
  "Momentum is king: rental karts have little power, so carry speed, avoid scrubbing and use wide, round lines.",
  "Tuck in on the straights and use slipstreams.",
  "Use your body weight: lean forward on entry for front grip, outward mid-corner to lift the inside rear.",
  "Brake once, in a straight line, and get off the brake before turning."],
 setup:[
  {do:"Keep the setup at a known baseline while you work on driving",why:"Changing setup and driving at the same time makes it impossible to know what helped."}],
 check:["Are you consistent? Lap times within 0.2 s of each other before chasing setup."]
}
];

/* ---------- Rotax Senior MAX engine troubleshooting (from Brad's own Rotax notes) ----------
   "steps" are worked through in order. Remember: an engine needs fuel, spark and compression. */
window.GUIDE.push(
{
 id:"rotax-clicks", cat:"Rotax", engine:"Rotax Senior MAX", owner:true, ph:"any", title:"Rotax: starter only clicks, engine won't crank",
 kw:["rotax","starter","starter button","clicks","clicking","only clicks","won't crank","wont crank","doesn't crank","battery","flat battery","starter motor","won't start","wont start","doesn't start","no start"],
 what:"You press the starter button, it clicks and nothing turns over. Usually the battery, the earth connection or the starter motor.",
 drive:[],rental:[],setup:[],
 steps:["Try another fully charged battery.","Check the ground (earth) connection for corrosion or looseness.","If it still doesn't crank, tap the starter motor gently with the back of a hammer.","If that doesn't solve it, the starter motor may be faulty: replace it."],
 check:["Remember an engine needs three things to run: fuel, spark and compression."]
},
{
 id:"rotax-bendix", cat:"Rotax", engine:"Rotax Senior MAX", owner:true, ph:"any", title:"Rotax: starter spins fast but the engine doesn't turn",
 kw:["rotax","starter spins","spins fast","whirs","whirring","starter whines","bendix","engine doesn't turn","won't start","wont start","doesn't start"],
 what:"The starter motor spins freely but doesn't turn the engine over. Probably a Bendix problem.",
 drive:[],rental:[],setup:[],
 steps:["Clean and lubricate the Bendix.","If that doesn't solve it, replace the Bendix."],
 check:[]
},
{
 id:"rotax-nospark", cat:"Rotax", engine:"Rotax Senior MAX", owner:true, ph:"any", title:"Rotax: cranks normally but won't start (check spark)",
 kw:["rotax","cranks","turns over","cranks but won't start","cranks but wont start","won't fire","wont fire","no spark","spark","spark plug","plug","coil","ignition coil","ecu","wiring loom","wiring harness","crank sensor","crankshaft position sensor","pickup sensor","won't start","wont start","doesn't start","no start"],
 what:"The engine turns over at normal speed but won't fire. Check for spark first.",
 drive:[],rental:[],setup:[],
 steps:["Check for spark.","No spark: replace the spark plug.","Still no spark: try another ignition coil.","Still no spark: try another wiring harness (and test again with the second coil). The problem could be either the coil or the harness.","Still no spark: try another crankshaft position sensor.","Still nothing: try another ECU.","If that doesn't work, cry in a fetal position. (Then get the engine to your engine builder.)"],
 check:["If you do have spark, see 'Rotax: has spark but won't start'."]
},
{
 id:"rotax-sparknostart", cat:"Rotax", engine:"Rotax Senior MAX", owner:true, ph:"any", title:"Rotax: has spark but won't start",
 kw:["rotax","has spark","got spark","spark but","won't start","wont start","doesn't start","no start","no fuel","fuel","fuel pump","carb","carburettor","carburetor","floats","choke","flooded","pops","popping","few pops","exhaust blocked","reed","reeds","reed petals","compression","low compression"],
 what:"You have spark but the engine still won't run, so the problem is fuel, air or compression.",
 drive:[],rental:[],setup:[],
 steps:["If the engine is cold, pull the carburettor choke.","Clean the carburettor. Check the floats are fitted correctly and aren't upside down.","Check the carburettor vent hoses aren't blocked.","Check the fuel tank ventilation isn't blocked.","Try another carburettor.","Check fuel is reaching the carburettor (you should see it flowing through the fuel hose). If not, check or replace the fuel pump.","Make sure the fuel pump hoses are connected to the correct ports.","Check for air leaks at the fuel pump connections and hoses. Secure every hose connection with zip ties.","If it tries to start and makes a few pops, make sure the exhaust and exhaust manifold aren't blocked. People often put a cap or cloth over the exhaust and forget it: make sure the engine hasn't sucked it in.","Inspect the reed petals with a torch for cracks or damage.","Check compression with a compression gauge. Low compression points to the piston, rings or cylinder."],
 check:[]
},
{
 id:"rotax-nopower-exit", cat:"Rotax", engine:"Rotax Senior MAX", owner:true, ph:"exit", title:"Rotax: no power coming out of corners",
 kw:["rotax","no power","lack of power","down on power","flat","no pull","out of corners","out of the corner","exit","exhaust valve","power valve","valve","solenoid","one way valve","one-way valve","vacuum hose","needle","needle position","needle clip","bottom end","slow out of corners"],
 what:"The engine feels flat accelerating out of corners. Often the exhaust (power) valve isn't working, an air leak in the impulse hoses, or the needle position.",
 drive:[],rental:[],setup:[],
 steps:["Make sure the exhaust valve opens and closes properly: it should open at about 8,000 rpm. You can check it on the trolley.","Remove, inspect and clean the power valve.","If the exhaust valve opens immediately, check the vacuum hoses are connected correctly.","If the valve isn't opening or closing properly, check the green one-way valve and replace it if needed.","If it persists, try another solenoid.","If it still persists, try another ECU.","Check the fuel pump impulse hoses and connections for air leaks: you should feel the vacuum pulses in the hose feeding the exhaust valve. Secure all hose connections with zip ties.","Check the carburettor needle position (positions 3 or 4 work well in most conditions) and that the needle clip isn't broken.","Not engine-related, but check the rear axle isn't moving inside its bearings."],
 check:[]
},
{
 id:"rotax-straight", cat:"Rotax", engine:"Rotax Senior MAX", owner:true, ph:"straight", title:"Rotax: problems on the main straight",
 kw:["rotax","main straight","straight","popping","pops on the straight","lean","rich","bogging on the straight","bogs on the straight","13000","13,000","rpm","revs","not revving","won't rev","wont rev","rev limit","14500","14,500","limiter","telemetry","top end","top speed"],
 what:"How the engine behaves at the end of the straight tells you what's wrong with the mixture or gearing.",
 drive:[],rental:[],setup:[],
 steps:["Engine popping: probably running too lean. Richen it.","Engine bogging before the end of the main straight (rpm stops rising at around 13,000): probably running too rich. Lean it.","Engine not increasing rpm on the main straight: check the telemetry. Rotax engines have an rpm limit of about 14,500. Also check the gearing."],
 check:["Change the carburation in small steps and re-check on the next run."]
},
{
 id:"rotax-nodrive", cat:"Rotax", engine:"Rotax Senior MAX", owner:true, ph:"any", title:"Rotax: engine revs but the kart doesn't move",
 kw:["rotax","revs but","revs up","kart doesn't move","kart doesnt move","won't move","wont move","no drive","clutch","slipping clutch","clutch slipping","flywheel","flywheel nut"],
 what:"The engine revs freely but the drive isn't reaching the axle.",
 drive:[],rental:[],setup:[],
 steps:["Check the clutch.","Check the flywheel is still securely attached to the crankshaft.","The flywheel is held on the crankshaft with a small nut and needs Loctite. Don't attempt this repair yourself unless you're experienced."],
 check:["Chain still on and the sprockets tight?"]
},
{
 id:"rotax-hot", cat:"Rotax", engine:"Rotax Senior MAX", owner:true, ph:"any", title:"Rotax: running hot (over 60°C with flaps open)",
 kw:["rotax","hot","overheating","over heating","temperature","temp","water temp","60","60 degrees","radiator","radiator flaps","flaps","coolant","water pump"],
 what:"The engine temperature goes above 60°C even with the radiator flaps fully open.",
 drive:[],rental:[],setup:[],
 steps:["Check the coolant level.","Check the water pump gears."],
 check:[]
},
{
 id:"rotax-vibration", cat:"Rotax", engine:"Rotax Senior MAX", owner:true, ph:"any", title:"Rotax: engine vibration",
 kw:["rotax","vibration","vibrating","vibrates","shaking engine","engine shakes","balance shaft","balancer","timing marks"],
 what:"The engine vibrates more than normal.",
 drive:[],rental:[],setup:[],
 steps:["Check the gears and make sure the balance shaft timing marks are aligned correctly."],
 check:[]
});
