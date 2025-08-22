import { Pitcher, Pitch, PitchGameStats, PitchRatings } from '@/types/player';

// ───────────────────────── Helpers & constants ─────────────────────────
const firstNames = ['Jake','Tyler','Brandon','Austin','Kyle','Matt','Ryan','Alex','Chris','Jordan','Nick','Zach','Trevor','Cole','Dylan','Blake','Lucas','Mason','Hunter','Logan'];
const lastNames  = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin'];

const pitchTypes = ['Four-Seam FB','Two-Seam FB','Sinker','Cutter','Slider','Curveball','Changeup','Splitter','Knuckleball','Sweeper','Slurve'];
const armAngles  = ['Over the Top','High 3/4','3/4','Low 3/4','Sidearm','Submarine'];

function randomBetween(min: number, max: number): number { return Math.random() * (max - min) + min; }
function randomInt(min: number, max: number): number { return Math.floor(randomBetween(min, max + 1)); }
function randomChoice<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(x:number, lo:number, hi:number){ return Math.max(lo, Math.min(hi, x)); }

// Gaussian rating (20–80, step 5)
function generateRating(mean = 50, stddev = 10): number {
  const u = 1 - Math.random(), v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  const raw = mean + z * stddev;
  const clamped = Math.max(20, Math.min(80, raw));
  return Math.round(clamped / 5) * 5;
}

function getProspectTier(potential: number): string {
  if (potential >= 75) return 'Top 100';
  if (potential >= 65) return 'High-Ace';
  if (potential >= 55) return 'Mid-Rotation';
  if (potential >= 45) return 'Org Guy';
  return 'UDFA';
}

// ───────────────────────── Pitch baselines (per type) ─────────────────────────
// Means/sd are example MLB-ish; tune later.
type Baseline = { mean:number; sd:number };
type PitchBaselines = { velo:Baseline; spin:Baseline; ivb:Baseline; ihb:Baseline; cmd:Baseline };
const DEFAULT_BASELINES: Record<string, PitchBaselines> = {
  'Four-Seam FB': { velo:{mean:94.2,sd:2.0}, spin:{mean:2350,sd:250}, ivb:{mean:15.5,sd:2.5}, ihb:{mean:-2.0,sd:2.0}, cmd:{mean:0.55,sd:0.10} },
  'Two-Seam FB' : { velo:{mean:93.0,sd:2.0}, spin:{mean:2200,sd:230}, ivb:{mean:13.0,sd:2.3}, ihb:{mean:+10.0,sd:2.5}, cmd:{mean:0.55,sd:0.10} },
  'Sinker'      : { velo:{mean:93.6,sd:1.9}, spin:{mean:2150,sd:230}, ivb:{mean: 9.0,sd:2.5}, ihb:{mean:+14.0,sd:2.8}, cmd:{mean:0.56,sd:0.10} },
  'Cutter'      : { velo:{mean:90.6,sd:2.2}, spin:{mean:2400,sd:260}, ivb:{mean:12.0,sd:2.0}, ihb:{mean:-4.0,sd:2.5}, cmd:{mean:0.56,sd:0.10} },
  'Slider'      : { velo:{mean:85.9,sd:2.3}, spin:{mean:2450,sd:270}, ivb:{mean: 2.0,sd:3.0}, ihb:{mean:-6.0,sd:3.0}, cmd:{mean:0.54,sd:0.10} },
  'Curveball'   : { velo:{mean:79.5,sd:2.6}, spin:{mean:2600,sd:300}, ivb:{mean:-12.0,sd:3.0}, ihb:{mean:-4.0,sd:3.0}, cmd:{mean:0.52,sd:0.10} },
  'Sweeper'     : { velo:{mean:83.8,sd:2.2}, spin:{mean:2500,sd:280}, ivb:{mean: 0.0,sd:3.0}, ihb:{mean:-14.0,sd:3.5}, cmd:{mean:0.52,sd:0.10} },
  'Changeup'    : { velo:{mean:86.5,sd:2.0}, spin:{mean:1800,sd:220}, ivb:{mean: 9.0,sd:2.5}, ihb:{mean:+12.0,sd:2.8}, cmd:{mean:0.56,sd:0.10} },
  'Splitter'    : { velo:{mean:86.0,sd:2.1}, spin:{mean:1500,sd:220}, ivb:{mean: 3.0,sd:3.0}, ihb:{mean:+ 8.0,sd:3.0}, cmd:{mean:0.53,sd:0.10} },
  'Knuckleball' : { velo:{mean:68.0,sd:2.0}, spin:{mean: 70 ,sd:40 }, ivb:{mean: 0.0,sd:6.0}, ihb:{mean: 0.0,sd:6.0}, cmd:{mean:0.45,sd:0.12} },
  'Slurve'      : { velo:{mean:81.0,sd:2.4}, spin:{mean:2500,sd:280}, ivb:{mean:-6.0,sd:3.0}, ihb:{mean:-8.0,sd:3.0}, cmd:{mean:0.53,sd:0.10} },
};

// shape weights for a single “quality” score by type
const SHAPE_WEIGHTS: Record<string, {velo:number;spin:number;ivb:number;ihb:number;cmd:number}> = {
  'Four-Seam FB': { velo:0.40, spin:0.20, ivb:0.30, ihb:0.00, cmd:0.10 },
  'Two-Seam FB' : { velo:0.25, spin:0.15, ivb:0.15, ihb:0.35, cmd:0.10 },
  'Sinker'      : { velo:0.25, spin:0.10, ivb:0.15, ihb:0.40, cmd:0.10 },
  'Cutter'      : { velo:0.30, spin:0.20, ivb:0.20, ihb:0.20, cmd:0.10 },
  'Slider'      : { velo:0.20, spin:0.25, ivb:0.15, ihb:0.30, cmd:0.10 },
  'Curveball'   : { velo:0.10, spin:0.30, ivb:0.40, ihb:0.10, cmd:0.10 },
  'Sweeper'     : { velo:0.10, spin:0.25, ivb:0.10, ihb:0.45, cmd:0.10 },
  'Changeup'    : { velo:0.10, spin:0.15, ivb:0.30, ihb:0.35, cmd:0.10 },
  'Splitter'    : { velo:0.10, spin:0.15, ivb:0.35, ihb:0.30, cmd:0.10 },
  'Knuckleball' : { velo:0.05, spin:0.10, ivb:0.35, ihb:0.35, cmd:0.15 },
  'Slurve'      : { velo:0.15, spin:0.25, ivb:0.30, ihb:0.20, cmd:0.10 },
};

// normalizers
function zFrom(x:number, mean:number, sd:number){ return (x - mean) / Math.max(1e-9, sd); }
function phi(z:number){ return 1/(1+Math.exp(-1.702*z)); } // fast ≈ CDF
function pctTo2080(p:number){ const pp = clamp(p, 0.001, 0.999); return Math.round(20 + 60 * (pp - 0.05) / 0.90); }
function rateAttr(x:number, base:Baseline){ const z=zFrom(x, base.mean, base.sd); const p=phi(z); return { z, percentile:Math.round(p*100), rating20_80: clamp(pctTo2080(p),20,80) }; }

// simple IVB/IHB estimators if you want to synthesize from spin
function estimateIVB(spinRate:number, spinEff:number, velo:number){ const k=0.012; return k * (spinRate*spinEff) / Math.max(1, velo); }
function estimateIHB(spinRate:number, spinEff:number, axisDeg:number, handed:'R'|'L'){
  const sideFrac = Math.sin((axisDeg*Math.PI)/180);
  const k = 0.010; const sign = (handed==='R') ? +1 : -1;
  return sign * k * spinRate * spinEff * sideFrac / 100;
}

// init tracker
function emptyPitchGameStats(): PitchGameStats {
  return { thrown:0, swings:0, takes:0, inZone:0, calledStrikes:0, whiffs:0, fouls:0, ballsInPlay:0, grounders:0, flyballs:0, liners:0, popups:0, hits:0, hrs:0 };
}

// ───────────────────────── Pitch generator (type‑aware) ─────────────────────────
function generatePitch(type: string, throwsHL: 'R'|'L'): Pitch {
  // Handedness nudges horizontal break sign
  const handedSign = (throwsHL==='R') ? +1 : -1;

  // Base around the DEFAULT_BASELINES, with realistic noise per type
  const b = DEFAULT_BASELINES[type] ?? DEFAULT_BASELINES['Four-Seam FB'];
  const velo = clamp(randomBetween(b.velo.mean - b.velo.sd, b.velo.mean + b.velo.sd), b.velo.mean-3*b.velo.sd, b.velo.mean+3*b.velo.sd);
  const spin = clamp(randomBetween(b.spin.mean - b.spin.sd, b.spin.mean + b.spin.sd), 200, 3200);
  const spinEff = clamp(randomBetween(0.75, 0.98), 0.3, 0.99); // you can type‑tune this later
  const axis = randomInt(10, 170);      // 10–170° to avoid degenerate values
  const gyro = type==='Slider' || type==='Sweeper' ? randomInt(30, 80) : randomInt(0, 40);

  // IVB/IHB: use baseline ± sd, but keep physical coherence with spinEff/axis
  let ivb = clamp(randomBetween(b.ivb.mean - b.ivb.sd, b.ivb.mean + b.ivb.sd), b.ivb.mean-3*b.ivb.sd, b.ivb.mean+3*b.ivb.sd);
  let ihb = clamp(randomBetween(b.ihb.mean - b.ihb.sd, b.ihb.mean + b.ihb.sd), b.ihb.mean-3*b.ihb.sd, b.ihb.mean+3*b.ihb.sd);

  // small nudge from the estimator to tie spin to break loosely
  ivb = 0.7*ivb + 0.3*estimateIVB(spin, spinEff, velo);
  ihb = 0.7*ihb + 0.3*estimateIHB(spin, spinEff, axis, throwsHL);
  ihb *= handedSign > 0 ? 1 : -1; // ensure sign convention by handedness

  const command01 = clamp(randomBetween(b.cmd.mean - b.cmd.sd, b.cmd.mean + b.cmd.sd), 0.2, 0.85);

  const seamWake = Math.random() > 0.5;
  const releaseHt = parseFloat(randomBetween(5.5, 7.2).toFixed(1));
  const releaseSide = parseFloat(randomBetween(-2.5, 2.5).toFixed(1)); // − = 3B side for RHP
  const ext = parseFloat(randomBetween(5.8, 7.6).toFixed(1));

  // Compute ratings
  const rVelo = rateAttr(velo, b.velo);
  const rSpin = rateAttr(spin, b.spin);
  const rIVB  = rateAttr(ivb,  b.ivb);
  const rIHB  = rateAttr(ihb,  b.ihb);
  const rCMD  = rateAttr(command01, b.cmd);

  const w = SHAPE_WEIGHTS[type] ?? SHAPE_WEIGHTS['Four-Seam FB'];
  const zShape = rVelo.z*w.velo + rSpin.z*w.spin + rIVB.z*w.ivb + rIHB.z*w.ihb + rCMD.z*w.cmd;
  const pShape = phi(zShape);
  const shape = { z:zShape, percentile: Math.round(100*pShape), rating20_80: clamp(pctTo2080(pShape),20,80) };

  const ratings: PitchRatings = {
    velocity: rVelo, spin: rSpin, verticalBreak: rIVB, horizontalBreak: rIHB, command: rCMD, shapeScore: shape
  };

  // Optional usage weight — set later when you assemble a mix
  const usage = undefined;

  const p: Pitch = {
    type,
    usage,
    pitchGrade: Math.round((ratings.shapeScore.rating20_80 + ratings.velocity.rating20_80) / 2), // keep your field
    spinRate: Math.round(spin),
    gyroDegree: gyro,
    spinDirection: axis,
    seamWakeEffect: seamWake,
    inducedBreak: { vertical: parseFloat(ivb.toFixed(1)), horizontal: parseFloat(ihb.toFixed(1)) },

    spinEff: parseFloat(spinEff.toFixed(2)),
    ivb: parseFloat(ivb.toFixed(1)),
    ihb: parseFloat(ihb.toFixed(1)),
    releaseHt: releaseHt,
    releaseSide: releaseSide,
    extensionFt: ext,
    command01,

    ratings,
    game: emptyPitchGameStats(),
  };

  return p;
}

// ───────────────────────── Pitcher generator ─────────────────────────
function generatePitcher(position: 'SP' | 'RP', rosterSpot: 'Starter' | 'Reliever' | 'Farm'): Pitcher {
  const firstName = randomChoice(firstNames);
  const lastName = randomChoice(lastNames);
  const ageDistribution = [
    ...Array(8).fill(18), // more prospects
    ...Array(10).fill(19),
    ...Array(12).fill(20),
    ...Array(14).fill(21),
    ...Array(15).fill(22),
    ...Array(14).fill(23),
    ...Array(12).fill(24),
    ...Array(10).fill(25),
    ...Array(9).fill(26),
    ...Array(9).fill(27),
    ...Array(8).fill(28),
    ...Array(7).fill(29),
    ...Array(6).fill(30),
    ...Array(5).fill(31),
    ...Array(4).fill(32),
    ...Array(3).fill(33),
    ...Array(2).fill(34),
    ...Array(1).fill(35),
    ...Array(1).fill(36)
  ];
  const age = randomChoice(ageDistribution);
  const isYoung = age <= 25;
  const throws: 'R'|'L' = Math.random() > 0.7 ? 'L' : 'R';

  let potential: number;
  let overall: number;

  if (age <= 22) {
    potential = generateRating(60, 12);          // high ceiling
    overall = generateRating(35, 8);             // low current skill
  } else if (age <= 25) {
    potential = generateRating(55, 10);
    overall = generateRating(potential - 15, 7);  // still developing
  } else if (age <= 30) {
    potential = generateRating(50, 8);
    overall = generateRating(potential - randomInt(0, 5), 5); // close to peak
  } else {
    potential = generateRating(45, 6);
    overall = generateRating(potential - randomInt(3, 10), 6); // declining
  }


  // Correlated traits
  const velocity = generateRating();
  const movement = generateRating(velocity - 5, 7);
  const control  = generateRating(55 - (velocity - 50) / 2, 7);
  const command  = generateRating((control + movement) / 2, 6);
  const stamina  = generateRating(position === 'SP' ? 60 : 40, 10);
  const durability = generateRating(50, 10);
  const development = generateRating(isYoung ? 60 : 40, 10);
  

  const injuryRisk = 100 - durability + Math.floor(Math.random() * 10);
  const projectionDelta = clamp(Math.round((potential - overall) / ((36 - age + 1) / 3)), -5, 20);

  // Build pitch mix (3–6 types), then assign light usage weights
  const mixCount = randomInt(3, 6);
  // Bias the first pitch to a FB-ish for realism
  const primaryPool = ['Four-Seam FB','Two-Seam FB','Sinker','Cutter'];
  const otherPool = pitchTypes.filter(t => !primaryPool.includes(t));

  const mixTypes: string[] = [];
  mixTypes.push(randomChoice(primaryPool));
  while (mixTypes.length < mixCount) {
    const t = randomChoice(otherPool);
    if (!mixTypes.includes(t)) mixTypes.push(t);
  }

  let pitchMix = mixTypes.map(t => generatePitch(t, throws));
  // assign usage % that sums ~1
  const baseWeights = pitchMix.map(p => {
    const isFB = /FB|Cutter|Sinker|Two-Seam/.test(p.type);
    const w = isFB ? randomBetween(0.18, 0.38) : randomBetween(0.08, 0.28);
    return Math.max(0.05, w);
  });
  const sum = baseWeights.reduce((a,b)=>a+b,0);
  pitchMix = pitchMix.map((p,i)=> ({ ...p, usage: parseFloat((baseWeights[i]/sum).toFixed(2)) }));

  // Mechanics
  const armAngle = randomChoice(armAngles);
  const releaseHeight = parseFloat(randomBetween(5.5, 7.2).toFixed(1));
  const extension = parseFloat(randomBetween(5.8, 7.5).toFixed(1));
  const attackAngle = parseFloat(randomBetween(3, 8).toFixed(1));
  const releaseConsistency = generateRating();
  const releaseDifferential = parseFloat(randomBetween(0.8, 4.2).toFixed(1));
  const armSlotVariance = parseFloat(randomBetween(1.0, 6.5).toFixed(1));

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `${firstName} ${lastName}`,
    position,
    rosterSpot,
    throws,
    age,
    overall,
    potential,
    contractAAV: parseFloat(randomBetween(0.5, 35.0).toFixed(1)),

    // Scouting ratings
    velocity,
    movement,
    control,
    command,
    stamina,
    development,
    durability,

    // Mechanics
    armAngle,
    releaseHeight,
    extension,
    attackAngle,
    releaseConsistency,
    releaseDifferential,
    armSlotVariance,

    // New pitch objects with ratings + trackers
    pitchMix,

    // Advanced dev + risk model
    prospectTier: getProspectTier(potential),
    injuryRisk,
    projectionDelta,
  };
}

export function generatePitchers(): Pitcher[] {
  const starters = Array.from({ length: 5 }, () => generatePitcher('SP', 'Starter'));
  const relievers = Array.from({ length: 10 }, () => generatePitcher('RP', 'Reliever'));
  const farm = Array.from({ length: 10 }, () => generatePitcher('RP', 'Farm'));
  return [...starters, ...relievers, ...farm];
}
