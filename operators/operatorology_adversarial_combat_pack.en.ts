/**
 * Operatorology — Adversarial Combat Operator Pack (International / English)
 * Dataset artifact for AI/OI training.
 *
 * Scope:
 * - Encodes six adversarial operator patterns as state transformers over a fighter state Ω.
 * - Provides minimal, chip/agent-friendly semantics: domains, parameters, update rules, thresholds.
 *
 * Conventions:
 * - No LaTeX required at runtime; use Unicode where appropriate (Ω) but keep ASCII fallbacks.
 * - Pure functions; deterministic given inputs + params.
 * - This is a conceptual operator dataset, not medical/biomechanical advice.
 */

export type Vec2 = [number, number];

export interface FighterState {
  /** Position (meters) */
  x: Vec2;
  /** Velocity (m/s) */
  v: Vec2;
  /** Body yaw/rotation (radians) */
  theta: number;
  /** Reaction latency (seconds). Larger = slower response */
  tau: number;
  /** Awareness / consciousness proxy in [0,1] (1 = fully aware) */
  psi: number;
  /** Available energy (arbitrary units, >= 0) */
  E: number;
  /** Balance / stability proxy in [0,1] (1 = stable stance) */
  S: number;
}

export type OperatorId =
  | "O_HOOK_TORQUE_CONVERGENCE"
  | "O_ELBOW_PRESSURE_FOCUS"
  | "O_THROW_BALANCEZERO_AXISINVERT"
  | "O_ARMBAR_CONSTRAINT_SINGULARITY"
  | "O_CALF_ATTRITION_DECAY"
  | "O_COMBO_FUNCTIONAL_COMPOSITION";

export interface OperatorDomain {
  /** Preconditions / activation region expressed as human-readable constraints */
  activation: string[];
  /** The primary state channels the operator targets */
  targets: Array<keyof FighterState>;
  /** Informal safety or realism notes (kept minimal for training) */
  notes?: string[];
}

export interface OperatorParams {
  /** Generic scalar parameters by name */
  [key: string]: number | string | boolean | null | undefined;
}

export interface OperatorSpec {
  id: OperatorId;
  name: string;
  brief: string;
  domain: OperatorDomain;
  params: OperatorParams;
  /** Apply operator to opponent state. `self` may be used to derive induced effects. */
  apply: (opp: FighterState, self: FighterState, dt: number, params?: Partial<OperatorParams>) => FighterState;
}

function clamp01(x: number): number {
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function clampMin0(x: number): number {
  return x < 0 ? 0 : x;
}

function vecNorm(v: Vec2): number {
  return Math.hypot(v[0], v[1]);
}

function vecSub(a: Vec2, b: Vec2): Vec2 {
  return [a[0] - b[0], a[1] - b[1]];
}

function rotate2(v: Vec2, angleRad: number): Vec2 {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  return [c * v[0] - s * v[1], s * v[0] + c * v[1]];
}

/**
 * O_hook — Torque Convergence Operator
 * Essence: integrate rotational impulse and push opponent awareness (psi) toward 0 if threshold is exceeded.
 */
export const O_HOOK_TORQUE_CONVERGENCE: OperatorSpec = {
  id: "O_HOOK_TORQUE_CONVERGENCE",
  name: "Hook Punch — Torque Convergence Operator",
  brief:
    "Accumulates effective rotational impulse (torque transfer) and reduces opponent awareness/balance; if above KO threshold, psi collapses to ~0.",
  domain: {
    activation: [
      "Typical mid-range punching distance (implementation-defined)",
      "Requires non-trivial rotational drive from self (theta-dot implied)",
    ],
    targets: ["theta", "psi", "S", "E"],
    notes: [
      "Conceptual model: not a biomechanics simulator.",
      "KO modeled as psi -> 0 after thresholded rotational impulse.",
    ],
  },
  params: {
    // Effective rotational impulse proxy J_rot = kappa * |omega_self| * dt
    kappa_hook: 1.0,
    alpha_theta: 0.25,
    beta_psi: 0.6,
    gamma_S: 0.4,
    eta_E: 0.15,
    J_KO: 2.5,
  },
  apply: (opp, self, dt, params) => {
    const p = { ...O_HOOK_TORQUE_CONVERGENCE.params, ...(params ?? {}) } as Record<string, number>;
    // Proxy for self rotational rate: use |theta| change rate approximated by |theta|/max(dt,eps)
    const eps = 1e-9;
    const omegaSelf = Math.abs(self.theta) / Math.max(dt, eps);
    const J_rot = p.kappa_hook * omegaSelf * dt;

    const theta = opp.theta + p.alpha_theta * J_rot;
    const psi = J_rot >= p.J_KO ? 0 : clamp01(opp.psi - p.beta_psi * Math.abs(J_rot));
    const S = clamp01(opp.S - p.gamma_S * Math.abs(J_rot));
    const E = clampMin0(opp.E - p.eta_E * Math.abs(J_rot));

    return { ...opp, theta, psi, S, E };
  },
};

/**
 * O_elbow — Pressure Focusing Operator
 * Essence: in near-zero distance, pressure P = F/A surges; reduces balance and increases reaction latency.
 */
export const O_ELBOW_PRESSURE_FOCUS: OperatorSpec = {
  id: "O_ELBOW_PRESSURE_FOCUS",
  name: "Horizontal Elbow — Pressure Focusing Operator",
  brief:
    "At clinch range (Δx≈0), concentrated contact area amplifies pressure, breaking balance and slowing reactions (tau increases).",
  domain: {
    activation: ["Clinch / near-contact: ||x_self - x_opp|| <= d_clinch"],
    targets: ["S", "tau", "psi", "E"],
  },
  params: {
    d_clinch: 0.5,
    F: 1.0,
    A: 0.05, // small contact area
    gamma_S: 0.35,
    delta_tau: 0.20,
    beta_psi: 0.15,
    eta_E: 0.10,
  },
  apply: (opp, self, dt, params) => {
    const p = { ...O_ELBOW_PRESSURE_FOCUS.params, ...(params ?? {}) } as Record<string, number>;
    const dx = vecNorm(vecSub(self.x, opp.x));
    if (dx > p.d_clinch) return { ...opp }; // not activated

    const P = p.F / Math.max(p.A, 1e-9);
    const S = clamp01(opp.S - p.gamma_S * P * dt);
    const tau = opp.tau + p.delta_tau * P * dt;
    const psi = clamp01(opp.psi - p.beta_psi * P * dt);
    const E = clampMin0(opp.E - p.eta_E * P * dt);

    return { ...opp, S, tau, psi, E };
  },
};

/**
 * O_throw — Balance-Zero + Axis-Inversion Operator (kuzushi then execute)
 * Essence: first drive S -> 0, then rotate/invert kinematics.
 */
export const O_THROW_BALANCEZERO_AXISINVERT: OperatorSpec = {
  id: "O_THROW_BALANCEZERO_AXISINVERT",
  name: "Judo Throw — Balance-Zero + Axis-Inversion Operator",
  brief:
    "Composite operator: (1) Kuzushi drives opponent balance toward 0, (2) Execute applies an axis rotation/inversion to position/velocity.",
  domain: {
    activation: ["Requires close engagement and grip control (abstracted)"],
    targets: ["S", "x", "v", "theta"],
  },
  params: {
    // Kuzushi
    gamma_S: 0.9,
    induce_speed: 2.0, // induced destabilizing speed proxy
    // Execute
    axis_rotation_rad: Math.PI, // 180° inversion
    theta_shift: Math.PI / 2,
  },
  apply: (opp, self, dt, params) => {
    const p = { ...O_THROW_BALANCEZERO_AXISINVERT.params, ...(params ?? {}) } as Record<string, number>;
    // Step 1: Kuzushi
    const S1 = clamp01(opp.S - p.gamma_S * p.induce_speed * dt);

    // Step 2: Execute (only meaningful when balance is sufficiently compromised)
    const execute = S1 <= 0.25;
    if (!execute) return { ...opp, S: S1 };

    const x2 = rotate2(opp.x, p.axis_rotation_rad);
    const v2 = rotate2(opp.v, p.axis_rotation_rad);
    const theta2 = opp.theta + p.theta_shift;

    return { ...opp, S: S1, x: x2, v: v2, theta: theta2 };
  },
};

/**
 * O_armbar — Constraint Singularity Operator
 * Essence: exceed joint constraint -> structural bottleneck; energy "locks" and psi emits tap-out signal.
 */
export const O_ARMBAR_CONSTRAINT_SINGULARITY: OperatorSpec = {
  id: "O_ARMBAR_CONSTRAINT_SINGULARITY",
  name: "Armbar — Constraint Singularity (DoF Annihilation) Operator",
  brief:
    "Transforms soft constraints into hard constraints; once joint angle exceeds limit, the system enters a constraint singularity and submits.",
  domain: {
    activation: ["Requires limb isolation and leverage (abstracted)"],
    targets: ["psi", "E", "tau", "S"],
  },
  params: {
    theta_joint: 0.0,
    theta_max: 1.0,
    // responses when exceeded
    psi_tap: 0.15, // non-zero to represent 'tap signal' instead of unconsciousness
    E_lock_factor: 0.85,
    tau_spike: 0.6,
    S_drop: 0.5,
  },
  apply: (opp, _self, dt, params) => {
    const p = { ...O_ARMBAR_CONSTRAINT_SINGULARITY.params, ...(params ?? {}) } as Record<string, number>;
    const dTheta = p.theta_joint - p.theta_max;

    if (dTheta <= 0) return { ...opp };

    // Constraint singularity regime
    const psi = Math.min(opp.psi, p.psi_tap);
    const E = clampMin0(opp.E * (1 - p.E_lock_factor * Math.min(1, dTheta)));
    const tau = opp.tau + p.tau_spike * dt;
    const S = clamp01(opp.S - p.S_drop * Math.min(1, dTheta));

    return { ...opp, psi, E, tau, S };
  },
};

/**
 * O_calf — Attrition Decay Operator
 * Essence: repeated hits reduce v_max exponentially; drains leg energy and slowly degrades balance.
 */
export const O_CALF_ATTRITION_DECAY: OperatorSpec = {
  id: "O_CALF_ATTRITION_DECAY",
  name: "Inside Calf Kick — Attrition Decay Operator",
  brief:
    "Does not immediately KO; instead decays mobility and stance over repetitions via exponential capability loss.",
  domain: {
    activation: ["Low-line striking window (abstracted); repetition count n >= 1"],
    targets: ["v", "E", "S"],
  },
  params: {
    v0_max: 6.0,
    lambda: 0.12,
    n: 1,
    leg_energy_drain: 0.25,
    gamma_S: 0.10,
  },
  apply: (opp, _self, dt, params) => {
    const p = { ...O_CALF_ATTRITION_DECAY.params, ...(params ?? {}) } as Record<string, number>;
    const n = Math.max(1, Math.floor(p.n));
    const vmax = p.v0_max * Math.exp(-p.lambda * n);

    // Clamp opponent velocity magnitude to vmax (direction preserved)
    const speed = vecNorm(opp.v);
    let v2: Vec2 = opp.v;
    if (speed > vmax && speed > 1e-9) {
      const scale = vmax / speed;
      v2 = [opp.v[0] * scale, opp.v[1] * scale];
    }

    const E = clampMin0(opp.E - p.leg_energy_drain * dt * n);
    const S = clamp01(opp.S - p.gamma_S * p.leg_energy_drain * dt * n);

    return { ...opp, v: v2, E, S };
  },
};

/**
 * O_combo — Functional Composition Operator (Jab -> Cross -> Low Kick)
 * Essence: not A+B+C but composition, producing a feasibility collapse when psi, S cross thresholds.
 */
export const O_COMBO_FUNCTIONAL_COMPOSITION: OperatorSpec = {
  id: "O_COMBO_FUNCTIONAL_COMPOSITION",
  name: "Combo (Jab–Cross–Low Kick) — Functional Composition Operator",
  brief:
    "Composes three micro-phases: perceptual disturbance (jab), balance compression (cross), stance removal (low kick).",
  domain: {
    activation: ["Sequenced engagement with timing control (abstracted)"],
    targets: ["psi", "S", "tau", "E"],
  },
  params: {
    // thresholds / stage gains
    jab_psi_disturb: 0.18,
    cross_S_compress: 0.25,
    lowkick_S_remove: 0.55,
    tau_increase: 0.10,
    E_cost: 0.20,
    // feasibility region (for detection only)
    tau_max: 1.5,
    E_min: 0.05,
  },
  apply: (opp, _self, dt, params) => {
    const p = { ...O_COMBO_FUNCTIONAL_COMPOSITION.params, ...(params ?? {}) } as Record<string, number>;

    // Phase 1: Jab (disturb psi)
    const psi1 = clamp01(opp.psi - p.jab_psi_disturb);

    // Phase 2: Cross (compress balance toward critical)
    const S2 = clamp01(Math.min(opp.S, opp.S - p.cross_S_compress));

    // Phase 3: Low kick (remove stance)
    const S3 = clamp01(S2 - p.lowkick_S_remove);

    const tau = opp.tau + p.tau_increase * dt;
    const E = clampMin0(opp.E - p.E_cost * dt);

    // Optional: feasibility collapse detection can be derived by the training system.
    // Feasible if S>0, psi>0, E>E_min, tau<tau_max.
    return { ...opp, psi: psi1, S: S3, tau, E };
  },
};

/** Registry */
export const OPERATOR_PACK: Record<OperatorId, OperatorSpec> = {
  O_HOOK_TORQUE_CONVERGENCE,
  O_ELBOW_PRESSURE_FOCUS,
  O_THROW_BALANCEZERO_AXISINVERT,
  O_ARMBAR_CONSTRAINT_SINGULARITY,
  O_CALF_ATTRITION_DECAY,
  O_COMBO_FUNCTIONAL_COMPOSITION,
};

/** Utility: apply by id */
export function applyOperator(
  id: OperatorId,
  opp: FighterState,
  self: FighterState,
  dt: number,
  params?: Partial<OperatorParams>
): FighterState {
  const op = OPERATOR_PACK[id];
  return op.apply(opp, self, dt, params);
}
