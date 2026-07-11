/* PsiV2W_VectorToWillOperator.ts
   Ψᵥ→𝓦 — Vector-to-Will Operator (Convergence → Intent / Will)
   Runtime scaffold:
   - aggregates vectors
   - filters via living kernel (𝓚_self)
   - applies non-coercive convergence checks
   - produces a will score + diagnostics + failure flags
*/

export type OperatorPriority = "P1" | "P2" | "P3" | "P4" | "P5";

export type VectorInput = {
  id: string;
  // scalar proxy for vector magnitude (you can upgrade to number[] later)
  value: number;
  // optional weight / salience
  weight?: number;
  // optional conflict marker (positive means conflicting pressure)
  conflict?: number; // [0..1] heuristic
};

export type KernelSelf = {
  // identity strength proxy: higher => more stable kernel
  identityStrength: number; // >= 0
  // anchoring strength proxy: higher => stronger anchoring against noise
  anchorStrength?: number; // >= 0
  // optional accept window: if set, reject values outside [min,max]
  acceptRange?: { min: number; max: number };
};

export type PsiV2WConfig = {
  // context strength influences evolution step (proxy)
  contextStrength?: number; // >=0
  // non-coercive threshold: if coercionScore exceeds this => invalid
  nonCoerciveMax?: number; // default 0.6
  // obstruction reduction target: if obstruction does not reduce => warning
  requireObstructionReduction?: boolean; // default true
};

export type PsiV2WOutput = {
  W: number; // will score (scalar proxy)
  validity: {
    kernelStable: boolean;
    nonCoercive: boolean;
    obstructionReduced: boolean;
    valid: boolean;
  };
  diagnostics: {
    n: number;
    vectorSum: number;
    weightedSum: number;
    identityStrength: number;
    coercionScore: number;
    obstructionIn: number;
    obstructionOut: number;
  };
  failureModes: {
    impulseNoise: boolean;
    obsessionCoercion: boolean;
    fragmentedWill: boolean;
    notes: string[];
  };
};

export const PsiV2WSpec = {
  id: "PsiV2W_VectorToWill",
  version: "0.1.0",
  symbol: "Ψᵥ→𝓦",
  title: "Vector-to-Will Operator",
  objective: "CONVERGE → Intentional_Coherent_Will",
  validity_conditions: [
    { id: "Kernel_Stability", priority: "P1" as OperatorPriority },
    { id: "NonCoercive_Convergence", priority: "P1" as OperatorPriority },
    { id: "Obstruction_Reduction", priority: "P2" as OperatorPriority }
  ]
} as const;

// ---------------- helpers ----------------
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function safeDiv(a: number, b: number) {
  return b === 0 ? 0 : a / b;
}

// obstruction proxy: more conflict + variance => more obstruction
function obstructionMeasure(vs: VectorInput[]): number {
  if (vs.length === 0) return 0;
  const vals = vs.map(v => v.value);
  const mean = vals.reduce((a, b) => a + b, 0) / vs.length;
  const varr = vals.reduce((a, x) => a + (x - mean) * (x - mean), 0) / vs.length;
  const conflict = vs.reduce((a, v) => a + (v.conflict ?? 0), 0) / vs.length;
  // normalize variance to [0,1] roughly via soft scaling
  const varScaled = clamp01(varr / (varr + 1));
  return clamp01(0.6 * varScaled + 0.4 * clamp01(conflict));
}

// 𝓚_self filtering / anchoring proxy
function kernelFilterAndAnchor(sum: number, kernel: KernelSelf): number {
  const anchor = kernel.anchorStrength ?? kernel.identityStrength;
  const identity = kernel.identityStrength;

  // range gating if present
  if (kernel.acceptRange) {
    if (sum < kernel.acceptRange.min || sum > kernel.acceptRange.max) {
      // outside identity window ⇒ heavily damped (invalid phase)
      return 0;
    }
  }

  // anchoring: stronger identity/anchor => reduce extreme swings
  const damp = 1 / (1 + Math.max(0, anchor));
  // keep sign but damp magnitude
  return sum * (1 - 0.5 * damp);
}

// non-coercive convergence proxy:
// coercion rises if one vector dominates + conflicts are high
function coercionScore(vs: VectorInput[]): number {
  if (vs.length === 0) return 0;
  const absVals = vs.map(v => Math.abs((v.weight ?? 1) * v.value));
  const total = absVals.reduce((a, b) => a + b, 0);
  const max = absVals.reduce((a, b) => Math.max(a, b), 0);
  const dominance = clamp01(safeDiv(max, total)); // [0,1]
  const conflict = clamp01(vs.reduce((a, v) => a + (v.conflict ?? 0), 0) / vs.length);
  // dominance + conflict => coercion
  return clamp01(0.7 * dominance + 0.3 * conflict);
}

// evolution 𝓔(·, C) proxy: apply contextStrength scaling
function evolve(w: number, contextStrength: number): number {
  const c = Math.max(0, contextStrength);
  // mild amplification under strong context, mild damping otherwise
  const factor = 1 + clamp01(c / (c + 1)) * 0.25;
  return w * factor;
}

// ---------------- main operator ----------------
export function runPsiV2W(
  vectors: VectorInput[],
  kernel: KernelSelf,
  config: PsiV2WConfig = {}
): PsiV2WOutput {
  const n = vectors.length;
  const identityStrength = Math.max(0, kernel.identityStrength);

  // validity: kernel stability
  const kernelStable = identityStrength > 0;

  // aggregate vectors
  const vectorSum = vectors.reduce((a, v) => a + v.value, 0);
  const weightedSum = vectors.reduce((a, v) => a + (v.weight ?? 1) * v.value, 0);

  // obstruction input
  const obstructionIn = obstructionMeasure(vectors);

  // kernel step 𝓚_self(Σ vᵢ)
  const anchored = kernelFilterAndAnchor(weightedSum, kernel);

  // non-coercive check
  const cScore = coercionScore(vectors);
  const nonCoerciveMax = config.nonCoerciveMax ?? 0.6;
  const nonCoercive = cScore <= nonCoerciveMax;

  // evolution step 𝓔(·, C)
  const contextStrength = config.contextStrength ?? 0;
  const Wraw = evolve(anchored, contextStrength);

  // obstruction output proxy: obstruction reduced by anchoring + noncoercive
  const obstructionOut = clamp01(obstructionIn * (nonCoercive ? 0.8 : 1.05) * (kernelStable ? 0.8 : 1.1));
  const requireOR = config.requireObstructionReduction ?? true;
  const obstructionReduced = requireOR ? (obstructionOut <= obstructionIn + 1e-6) : true;

  const valid = kernelStable && nonCoercive && obstructionReduced;

  // failure modes
  const notes: string[] = [];
  const impulseNoise = !kernelStable;
  if (impulseNoise) notes.push("Kernel unstable: identityStrength must be > 0.");

  const obsessionCoercion = kernelStable && !nonCoercive;
  if (obsessionCoercion) notes.push(`Coercion too high: coercionScore=${cScore.toFixed(2)} > ${nonCoerciveMax}`);

  const fragmentedWill = obstructionIn > 0.6 && !obstructionReduced;
  if (fragmentedWill) notes.push("High obstruction and not reduced: consider applying Cut (𝓒) or reducing conflicts.");

  if (notes.length === 0) notes.push("Valid convergence: will emerged as a stable attractor intent.");

  return {
    W: valid ? Wraw : 0,
    validity: {
      kernelStable,
      nonCoercive,
      obstructionReduced,
      valid
    },
    diagnostics: {
      n,
      vectorSum,
      weightedSum,
      identityStrength,
      coercionScore: cScore,
      obstructionIn,
      obstructionOut
    },
    failureModes: {
      impulseNoise,
      obsessionCoercion,
      fragmentedWill,
      notes
    }
  };
}

// UI helper: intermediate O.i representation card
export function buildOiIntermediatePsiV2W() {
  return {
    objective: "CONVERGE → Intentional_Coherent_Will",
    entities: [
      { label: "Vector set", token: "{vᵢ}" },
      { label: "Living kernel", token: "𝓚_self" },
      { label: "Identity invariant", token: "𝓘(𝓚_self)" },
      { label: "Context", token: "C" },
      { label: "Height/obstruction", token: "h(·)" },
      { label: "Evolution", token: "𝓔" },
      { label: "Will", token: "𝓦" }
    ],
    validityConditions: PsiV2WSpec.validity_conditions
  };
}
