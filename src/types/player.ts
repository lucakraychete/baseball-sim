// ======= Pitch-level helpers =======
export type PitchType =
  | 'Four-Seam FB' | 'Two-Seam FB' | 'Sinker' | 'Cutter'
  | 'Slider' | 'Curveball' | 'Sweeper' | 'Changeup'
  | 'Splitter' | 'Knuckleball' | 'Slurve';

export type Rated = {
  rating20_80: number;   // 20–80 scouting scale
  percentile: number;    // 0–100
  z: number;             // z-score vs type baseline
};

export type PitchRatings = {
  velocity: Rated;
  spin: Rated;
  verticalBreak: Rated;   // IVB
  horizontalBreak: Rated; // IHB
  command: Rated;         // 0–1 → rated vs baseline
  shapeScore: Rated;      // type-aware composite
};

export type PitchGameStats = {
  thrown: number;
  swings: number;
  takes: number;
  inZone: number;
  calledStrikes: number;
  whiffs: number;
  fouls: number;
  ballsInPlay: number;
  grounders: number;
  flyballs: number;
  liners: number;
  popups: number;
  hits: number;
  hrs: number;
};

// ======= Pitch & Pitcher =======
export interface Pitch {
  // Existing
  type: string;                 // keep string for now to avoid breaking callers
  pitchGrade: number;
  spinRate: number;
  gyroDegree: number;
  spinDirection: number;
  seamWakeEffect: boolean;
  inducedBreak: { vertical: number; horizontal: number };

  // NEW (all optional for backward compat)
  usage?: number;               // 0–1 allocation in mix
  spinEff?: number;             // 0–1 useful spin
  ivb?: number;                 // induced vert break (+up), in
  ihb?: number;                 // induced horiz break (+arm side), in
  releaseHt?: number;           // ft
  releaseSide?: number;         // ft (− = 3B side for RHP)
  extensionFt?: number;         // ft (per‑pitch offset if you want)
  command01?: number;           // 0–1 location tightness

  ratings?: PitchRatings;       // computed, type-aware
  game?: PitchGameStats;        // per-sim tracker (CSW, GB%, etc.)
}

export interface Pitcher {
  id: string;
  name: string;
  position: 'SP' | 'RP';
  throws: 'R' | 'L';
  age: number;
  overall: number;
  potential: number;
  contractAAV: number;

  // Ratings
  velocity: number;
  movement: number;
  control: number;
  command: number;
  stamina: number;
  development: number;
  durability: number;

  // Mechanics
  armAngle: string;
  releaseHeight: number;
  extension: number;
  attackAngle: number;
  releaseConsistency: number;
  releaseDifferential: number;
  armSlotVariance: number;

  // Pitches
  pitchMix: Pitch[];

  // NEW
  prospectTier: string;
  injuryRisk: number;
  projectionDelta: number;
  rosterSpot?: 'Starter' | 'Reliever' | 'Farm';
}
