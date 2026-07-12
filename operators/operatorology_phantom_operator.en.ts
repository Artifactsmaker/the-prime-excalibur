/**
 * Operatorology / Operator Intelligence — Phantom Operator (𝒪_phantom)
 * International (English) training artifact (.ts)
 *
 * Source inspiration: user's Vietnamese whitepaper draft (conceptual).
 *
 * What this file provides:
 * - Two aligned state spaces:
 *   (1) Combat / adversarial state Ω = (x, v, θ, τ, ψ, E, S)
 *   (2) Silicon physical–informational state Σ = (P, T, f, a, κ, q, s)
 * - A canonical commutator-form Phantom Operator:
 *     𝒪_phantom = B^{-1} ∘ A^{-1} ∘ B ∘ A
 * - Minimal, deterministic update rules + safety gating suitable for AI/OI training.
 *
 * Notes:
 * - This is a conceptual operator dataset, not combat or hardware engineering advice.
 * - Avoid LaTeX at runtime; Unicode symbols are optional and have ASCII fallbacks.
 */

export type Vec2 = [number, number];

export interface CombatOmega {
  /** Position (m) */
  x: Vec2;
  /** Velocity (m/s) */
  v: Vec2;
  /** Body yaw/rotation (rad) */
  theta: number;
  /** Cognitive / reaction latency (s), higher = slower */
  tau: number;
  /** Awareness proxy in [0,1] (1 fully aware, 0 reset) */
  psi: number;
  /** Available energy (arbitrary units, >=0) */
  E: number;
  /** Balance/stability proxy in [0,1] */
  S: number;
}

export type TopologyProfile = string;

export interface SiliconSigma {
  /** Power (normalized or W) */
  P: number;
  /** Temperature (normalized or °C) */
  T: number;
  /** DVFS frequency (GHz or normalized) */
  f: number;
  /** Activity factor in [0,1] */
  a: number;
  /** Topology / routing / mapping profile id */
  kappa: TopologyProfile;
  /** NoC congestion (normalized) */
  q: number;
  /** Stability index in [0,1] (>= s_critical required) */
  s: number;
}

/** A minimal “thin-ISA” command used to execute structural operators on silicon. */
export interface ThinISACommand {
  opcode: string;
  tileMask: number[]; // affected tiles/cores/regions
  param: Record<string, number | string | boolean>;
  durationMs: number;
  safetyTag: "SAFE" | "RISKY" | "FORCED_SAFE";
}

/** Generic operator interface (combat or silicon). */
export interface OperatorSpec<S> {
  id: string;
  name: string;
  brief: string;
  /** Preconditions / activation region (human-readable) */
  activation: string[];
  /** Apply operator to state. */
  apply: (state: S, dt: number, params?: Partial<Record<string, unknown>>) => S;
  /** Optional inverse for commutator construction */
  invert?: (state: S, dt: number, params?: Partial<Record<string, unknown>>) => S;
}

/** Helpers */
function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}
function clampMin0(x: number): number {
  return x < 0 ? 0 : x;
}
function vecAdd(a: Vec2, b: Vec2): Vec2 {
  return [a[0] + b[0], a[1] + b[1]];
}
function vecScale(v: Vec2, k: number): Vec2 {
  return [v[0] * k, v[1] * k];
}
function rotate2(v: Vec2, angleRad: number): Vec2 {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  return [c * v[0] - s * v[1], s * v[0] + c * v[1]];
}

/**
 * Operator A (Combat): High-salience feint cue.
 * Primary targets: opponent (ψ, τ). Here represented as a state transformer that:
 * - consumes opponent awareness budget (psi decreases)
 * - increases reaction latency (tau increases)
 *
 * Interpretation: A triggers a cognitive allocation that cannot be instantly revoked.
 */
export const A_FEINT_CUE_COMBAT: OperatorSpec<CombatOmega> = {
  id: "A_FEINT_CUE_COMBAT",
  name: "A — Feint Cue Operator (Combat)",
  brief: "High-salience cue that forces cognitive allocation: psi down, tau up.",
  activation: ["Opponent within perceptual/action range (abstracted)."],
  apply: (s, dt, params) => {
    const p = {
      kPsi: 0.20, // awareness consumption per second
      kTau: 0.15, // latency increase per second
      eCost: 0.05, // small energy footprint (attacker-side not modeled here)
      ...(params ?? {}),
    } as any;
    return {
      ...s,
      psi: clamp01(s.psi - p.kPsi * dt),
      tau: s.tau + p.kTau * dt,
      E: clampMin0(s.E - p.eCost * dt),
    };
  },
  invert: (s, dt, params) => {
    // Inverse is an abstract "cue withdrawal": removes the cue but cannot fully undo
    // the already-allocated cognitive cost in the opponent. Model as partial rollback.
    const p = {
      rollbackPsi: 0.05,
      rollbackTau: 0.05,
      ...(params ?? {}),
    } as any;
    return {
      ...s,
      psi: clamp01(s.psi + p.rollbackPsi * dt),
      tau: Math.max(0, s.tau - p.rollbackTau * dt),
    };
  },
};

/**
 * Operator B (Combat): Micro-shift operator.
 * Targets: self kinematics in the source doc; here we represent the *effect* on opponent tracking error.
 * For training, we map it as a geometric shift in perceived target:
 * - rotate and translate the opponent's reference frame slightly, degrading balance S.
 */
export const B_MICRO_SHIFT_COMBAT: OperatorSpec<CombatOmega> = {
  id: "B_MICRO_SHIFT_COMBAT",
  name: "B — Micro-Shift Operator (Combat)",
  brief: "Micro displacement/axis shift that increases phase/tracking error; reduces balance S.",
  activation: ["Close-to-mid engagement (abstracted)."],
  apply: (s, dt, params) => {
    const p = {
      dPos: 0.10, // meters per second (perceived shift proxy)
      dTheta: 0.35, // rad per second
      kS: 0.10, // balance erosion per second
      ...(params ?? {}),
    } as any;

    const shift: Vec2 = [p.dPos * dt, 0];
    const x2 = vecAdd(s.x, shift);
    const v2 = rotate2(s.v, p.dTheta * dt);
    const theta2 = s.theta + p.dTheta * dt;
    const S2 = clamp01(s.S - p.kS * dt);

    return { ...s, x: x2, v: v2, theta: theta2, S: S2 };
  },
  invert: (s, dt, params) => {
    const p = {
      dPos: 0.10,
      dTheta: 0.35,
      restoreS: 0.03,
      ...(params ?? {}),
    } as any;

    const shift: Vec2 = [-p.dPos * dt, 0];
    const x2 = vecAdd(s.x, shift);
    const v2 = rotate2(s.v, -p.dTheta * dt);
    const theta2 = s.theta - p.dTheta * dt;
    const S2 = clamp01(s.S + p.restoreS * dt);

    return { ...s, x: x2, v: v2, theta: theta2, S: S2 };
  },
};

/**
 * Operator A (Silicon): Scheduling / gain pulse that attracts the disturbance ("catch the noise").
 * Targets: activity a, congestion q, and stability s via transient control.
 */
export const A_SCHEDULER_PULSE_SILICON: OperatorSpec<SiliconSigma> = {
  id: "A_SCHEDULER_PULSE_SILICON",
  name: "A — Scheduler/Gain Pulse Operator (Silicon)",
  brief: "A transient pulse that changes scheduling/gain to intercept disturbances; may increase activity a briefly.",
  activation: ["Telemetry indicates an incoming burst/jitter/congestion (abstracted)."],
  apply: (s, dt, params) => {
    const p = {
      da: 0.08, // activity bump per second
      dq: -0.03, // congestion reduction per second
      ds: 0.02, // stability improvement per second
      dP: 0.04, // power cost per second
      ...(params ?? {}),
    } as any;

    return {
      ...s,
      a: clamp01(s.a + p.da * dt),
      q: Math.max(0, s.q + p.dq * dt),
      s: clamp01(s.s + p.ds * dt),
      P: Math.max(0, s.P + p.dP * dt),
    };
  },
  invert: (s, dt, params) => {
    // Withdrawal of pulse: return scheduler to baseline; cannot perfectly undo thermal inertia.
    const p = {
      da: -0.06,
      dq: 0.02,
      ds: -0.01,
      ...(params ?? {}),
    } as any;

    return {
      ...s,
      a: clamp01(s.a + p.da * dt),
      q: Math.max(0, s.q + p.dq * dt),
      s: clamp01(s.s + p.ds * dt),
    };
  },
};

/**
 * Operator B (Silicon): Micro-profile shift (DVFS/mapping/NoC profile change).
 * Targets: frequency f, topology κ, congestion q, power P, temperature T, stability s.
 */
export const B_PROFILE_SHIFT_SILICON: OperatorSpec<SiliconSigma> = {
  id: "B_PROFILE_SHIFT_SILICON",
  name: "B — Micro-Profile Shift Operator (Silicon)",
  brief: "Coarse-grain reconfiguration: DVFS step + routing/mapping micro-shift to move the system away from the predicted disturbance trajectory.",
  activation: ["Allowed only if safety supervisor permits (T,P,s constraints)."],
  apply: (s, dt, params) => {
    const p = {
      df: -0.05, // frequency step down per second (example)
      dP: -0.03, // power improvement per second
      dT: -0.02, // thermal relief per second
      dq: -0.04, // congestion relief per second
      ds: 0.04, // stability gain per second
      kappaNext: "kappa_shifted",
      ...(params ?? {}),
    } as any;

    return {
      ...s,
      f: Math.max(0, s.f + p.df * dt),
      P: Math.max(0, s.P + p.dP * dt),
      T: s.T + p.dT * dt,
      q: Math.max(0, s.q + p.dq * dt),
      s: clamp01(s.s + p.ds * dt),
      kappa: String(p.kappaNext),
    };
  },
  invert: (s, dt, params) => {
    const p = {
      df: 0.04,
      dP: 0.02,
      dT: 0.01,
      dq: 0.02,
      ds: -0.02,
      kappaRestore: "kappa_base",
      ...(params ?? {}),
    } as any;

    return {
      ...s,
      f: Math.max(0, s.f + p.df * dt),
      P: Math.max(0, s.P + p.dP * dt),
      T: s.T + p.dT * dt,
      q: Math.max(0, s.q + p.dq * dt),
      s: clamp01(s.s + p.ds * dt),
      kappa: String(p.kappaRestore),
    };
  },
};

/**
 * Phantom Operator (commutator form):
 *   𝒪_phantom = B^{-1} ∘ A^{-1} ∘ B ∘ A
 *
 * Key intent:
 * - For the "self" system, the net effect is approximate invariance (state returns near baseline).
 * - For the "opponent/disturbance" system, latency/inertia causes phase error and effective degradation.
 *
 * Here we implement a generic commutator constructor.
 */
export function commutator<S>(
  A: OperatorSpec<S>,
  B: OperatorSpec<S>
): OperatorSpec<S> {
  if (!A.invert || !B.invert) {
    throw new Error("Commutator requires both A.invert and B.invert to be defined.");
  }

  return {
    id: "O_PHANTOM_COMMUTATOR",
    name: "Phantom Operator — Commutator Form",
    brief: "B^{-1} ∘ A^{-1} ∘ B ∘ A: act–shift–withdraw–restore for approximate invariance with induced phase error.",
    activation: ["Requires A and B to be defined with inverses.", "Often useful under latency/inertia regimes."],
    apply: (state: S, dt: number, params?: Partial<Record<string, unknown>>) => {
      const s1 = A.apply(state, dt, params);
      const s2 = B.apply(s1, dt, params);
      const s3 = A.invert!(s2, dt, params);
      const s4 = B.invert!(s3, dt, params);
      return s4;
    },
  };
}

/** Concrete Phantom operators for each domain */
export const O_PHANTOM_COMBAT = commutator<CombatOmega>(A_FEINT_CUE_COMBAT, B_MICRO_SHIFT_COMBAT);
export const O_PHANTOM_SILICON = commutator<SiliconSigma>(A_SCHEDULER_PULSE_SILICON, B_PROFILE_SHIFT_SILICON);

/**
 * Safety Supervisor (Silicon): hard constraints + hysteresis gates.
 * If violated, override to safe damping operator (conceptual).
 */
export interface SafetySupervisorParams {
  P_max: number;
  T_max: number;
  s_critical: number;
  // hysteresis
  minDf: number; // minimum DVFS change magnitude to accept
  minDwellMs: number; // minimum dwell time on a kappa profile
}

export interface SafetySupervisorState {
  lastKappa: TopologyProfile;
  lastKappaChangeMs: number;
  lastF: number;
  nowMs: number;
}

export function safetyGateSilicon(
  sigma: SiliconSigma,
  sup: SafetySupervisorParams,
  st: SafetySupervisorState
): { allowed: boolean; reason: string } {
  if (sigma.T > sup.T_max) return { allowed: false, reason: "T > T_max" };
  if (sigma.P > sup.P_max) return { allowed: false, reason: "P > P_max" };
  if (sigma.s < sup.s_critical) return { allowed: false, reason: "s < s_critical" };

  const df = Math.abs(sigma.f - st.lastF);
  if (df < sup.minDf) return { allowed: false, reason: "|Δf| below hysteresis threshold" };

  const dwell = st.nowMs - st.lastKappaChangeMs;
  if (sigma.kappa !== st.lastKappa && dwell < sup.minDwellMs) {
    return { allowed: false, reason: "kappa dwell-time below minimum" };
  }

  return { allowed: true, reason: "OK" };
}

/**
 * Thin-ISA packaging helper: represent 𝒪_phantom as a command sequence [A, B, A^{-1}, B^{-1}].
 */
export function packagePhantomAsThinISA(params?: Partial<Record<string, unknown>>): ThinISACommand[] {
  const p = (params ?? {}) as any;
  const tileMask: number[] = Array.isArray(p.tileMask) ? p.tileMask : [0];
  const durationMs = typeof p.durationMs === "number" ? p.durationMs : 2;

  return [
    { opcode: "A_PULSE", tileMask, param: { mode: "A", ...p }, durationMs, safetyTag: "SAFE" },
    { opcode: "B_SHIFT", tileMask, param: { mode: "B", ...p }, durationMs, safetyTag: "RISKY" },
    { opcode: "A_WITHDRAW", tileMask, param: { mode: "A_INV", ...p }, durationMs, safetyTag: "SAFE" },
    { opcode: "B_RESTORE", tileMask, param: { mode: "B_INV", ...p }, durationMs, safetyTag: "SAFE" },
  ];
}
