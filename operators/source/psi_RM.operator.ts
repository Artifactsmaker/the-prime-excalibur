/**
 * ψᴿᴹ — Root–Matching Operator
 * Operatorology / Operator Intelligence training artifact
 *
 * Notes:
 * - No LaTeX / KaTeX.
 * - Math strings are formatted as "Rendered Math Object" friendly (Office Math / vector equation style).
 * - Unicode symbols are used (ψ, κ, τ, σ, Δ, Φ, ℬ, ⟨ ⟩, ‖ ‖, ∏, Σ, √, ∈, ⇔, ≥).
 */

export type RootChannel =
  | "morphology"
  | "dynamics"
  | "function"
  | "semantics"
  | "affect";

export interface RootMatchingParams {
  /** Acceptance threshold τ ∈ [0,1] */
  tau: number;
  /** Root-matching flexibility σ > 0 */
  sigma: number;
  /** Channel weights wₘ, non-negative, should sum to 1 */
  weights: Record<RootChannel, number>;
}

export interface RootVector {
  /** Vector representation per channel (feature embedding, histogram, time-series embedding, etc.) */
  channels: Partial<Record<RootChannel, number[]>>;
}

export interface RootEncoder<A = unknown> {
  /** Encodes entity into a RootVector */
  encode(entity: A): RootVector;
}

export interface ChannelMetric {
  /** Returns a non-negative distance d(u,v) */
  distance(u: number[], v: number[]): number;
}

/** Metadata + definitions to keep as a single exportable training object */
export const PsiRM = {
  id: "psi_RM",
  symbol: "ψᴿᴹ",
  name: "Root–Matching Operator",
  aliases: ["Root Matching", "Phase-root alignment", "ψRM"],
  domain: ["Operatorology", "O.i", "A.i", "Knowledge grounding", "Myth-to-reality anchoring"],

  thesis: "Existence ≡ Root Matching: A exists at the phase layer iff it root-matches some real entity B above threshold τ.",

  // Rendered-math-friendly formulas (no LaTeX delimiters)
  math: {
    rootVectors: "rᴬ = 𝐄(A),  rᴮ = 𝐄(B)  ∈  H",
    operator: "ψᴿᴹ(A, B) = κ(rᴬ, rᴮ),  κ : H × H → [0,1]",
    existence: "A exists ⇔ ψᴿᴹ(A, B) ≥ τ,  with τ ∈ [0,1]",
    multichannelKernel: "κ(rᴬ, rᴮ) = ∏ₘ₌₁ᴹ κₘ(rᴬ⁽ᵐ⁾, rᴮ⁽ᵐ⁾)",
    cosineKernel: "κₘ(u, v) = ⟨u, v⟩ ÷ (‖u‖ · ‖v‖)",
    rootDistance: "Δ_root(A, B) = √( Σₘ wₘ · dₘ²(rᴬ⁽ᵐ⁾, rᴮ⁽ᵐ⁾) )",
    gaussianMatch: "ψᴿᴹ(A, B) = exp( − Δ_root²(A, B) ÷ σ² )",
    phaseRealMap: "A_phase-real = argmax_{B ∈ ℬ} ψᴿᴹ(A, B)",
    consistency: "ψᴿᴹ(A, B) = ψᴿᴹ(Φ(A), Φ(B))  if Φ preserves roots",
    fictiveness: "fictiveness(A,B) = 1 − ψᴿᴹ(A, B)"
  },

  channels: {
    morphology: "Form, anatomy, proportions.",
    dynamics: "Motion, flow, gesture (time-series / kinematics).",
    function: "Role in mythic ecology (guardianship, authority, etc.).",
    semantics: "Symbolic meaning, rituals, ancient texts.",
    affect: "Emotional field and persuasive value."
  },

  applications: {
    ai: [
      "Myth-to-reality anchoring for folklore interpretation.",
      "Reality-anchored multimodal retrieval (text ↔ image/object).",
      "Semantic guardrail: flag root mismatch instead of hallucinating."
    ],
    oi: [
      "Operational hypothesis admission: Admit(A) ⇔ ∃B ∈ ℬ : ψᴿᴹ(A,B) ≥ τ.",
      "Phase knowledge graph with weighted edges = match scores.",
      "Cross-cultural alignment via shared roots."
    ]
  }
} as const;

/** Utility: clamp to [0,1] */
function clamp01(x: number): number {
  if (Number.isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

/** Dot product */
function dot(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

/** Euclidean norm */
function norm(a: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * a[i];
  return Math.sqrt(s);
}

/**
 * Default metric: cosine distance
 * d(u,v) = 1 - cosineSimilarity(u,v)
 */
export const cosineDistance: ChannelMetric = {
  distance(u: number[], v: number[]): number {
    const nu = norm(u);
    const nv = norm(v);
    if (nu === 0 || nv === 0) return 1;
    const cos = dot(u, v) / (nu * nv);
    // numerical safety
    const c = Math.max(-1, Math.min(1, cos));
    return 1 - c;
  }
};

/**
 * Compute Δ_root(A,B) from root vectors using per-channel metrics & weights.
 * Missing channels are ignored and remaining weights are renormalized.
 */
export function rootDistance(
  rA: RootVector,
  rB: RootVector,
  metrics: Partial<Record<RootChannel, ChannelMetric>>,
  weights: Record<RootChannel, number>
): number {
  const channels: RootChannel[] = ["morphology", "dynamics", "function", "semantics", "affect"];

  // Collect valid channels that exist in both vectors and have metrics
  const valid: Array<{ ch: RootChannel; w: number; d2: number }> = [];
  for (const ch of channels) {
    const a = rA.channels[ch];
    const b = rB.channels[ch];
    const m = metrics[ch];
    if (!a || !b || !m) continue;
    const w = Math.max(0, weights[ch] ?? 0);
    const d = m.distance(a, b);
    valid.push({ ch, w, d2: d * d });
  }

  if (valid.length === 0) return 0;

  // Renormalize weights over valid set
  const wSum = valid.reduce((s, x) => s + x.w, 0);
  const denom = wSum > 0 ? wSum : valid.length;
  let sum = 0;
  for (const x of valid) {
    const w = wSum > 0 ? x.w / denom : 1 / denom;
    sum += w * x.d2;
  }
  return Math.sqrt(sum);
}

/**
 * ψᴿᴹ(A,B) = exp( - Δ_root² / σ² )
 */
export function psiRM(
  rA: RootVector,
  rB: RootVector,
  params: RootMatchingParams,
  metrics?: Partial<Record<RootChannel, ChannelMetric>>
): number {
  const sigma = params.sigma;
  if (!(sigma > 0)) return 0;

  const defaultMetrics: Partial<Record<RootChannel, ChannelMetric>> = {
    morphology: cosineDistance,
    dynamics: cosineDistance,
    function: cosineDistance,
    semantics: cosineDistance,
    affect: cosineDistance
  };

  const usedMetrics = { ...defaultMetrics, ...(metrics ?? {}) };
  const d = rootDistance(rA, rB, usedMetrics, params.weights);
  const score = Math.exp(-(d * d) / (sigma * sigma));
  return clamp01(score);
}

/**
 * Admission test: A exists at phase layer iff ψᴿᴹ(A,B) ≥ τ for some B.
 */
export function admit(score: number, tau: number): boolean {
  return score >= tau;
}

/**
 * Argmax mapping over a bank of real entities.
 * Returns best match + score. If encoder is expensive, precompute root vectors for the bank.
 */
export function matchBest<A = unknown, B = unknown>(args: {
  A: A;
  bank: Array<{ entity: B; root?: RootVector }>;
  encoderA: RootEncoder<A>;
  encoderB: RootEncoder<B>;
  params: RootMatchingParams;
  metrics?: Partial<Record<RootChannel, ChannelMetric>>;
}): { best: B | null; bestScore: number } {
  const rA = args.encoderA.encode(args.A);

  let best: B | null = null;
  let bestScore = -1;

  for (const item of args.bank) {
    const rB = item.root ?? args.encoderB.encode(item.entity);
    const s = psiRM(rA, rB, args.params, args.metrics);
    if (s > bestScore) {
      bestScore = s;
      best = item.entity;
    }
  }

  return { best, bestScore };
}
