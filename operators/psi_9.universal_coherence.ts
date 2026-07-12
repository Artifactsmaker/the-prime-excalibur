/**
 * ψ₉ — Universal Coherence Operator (Toán tử Nhất Quán Toàn Cục)
 * Operatorology / Operator Intelligence artifact
 *
 * Conventions:
 * - No LaTeX / KaTeX.
 * - Unicode math strings (Math_Unicode) for display + token stability.
 * - Optional semantics AST for chip-grade compilation / analysis.
 *
 * Core (Math_Unicode):
 *   C_int(t)  = cos(xₜ, bₜ)
 *   C_goal(t) = cos(xₜ, gₜ)
 *   ΔΣₜ = Σₜ − Σₜ₋₁
 *   D_id(t) = ||ΔΣₜ|| / (||Σₜ|| + ε)
 *   C_id(t) = exp(− D_id(t) / ρ)
 *   C_U(t) = α·C_int(t) + β·C_goal(t) + γ·C_id(t)
 *
 * Residual:
 *   Π_b(x) = (⟨x,b⟩ / ⟨b,b⟩) · b
 *   Π_g(x) = (⟨x,g⟩ / ⟨g,g⟩) · g
 *   rₜ = w₁·(xₜ − Π_b(xₜ)) + w₂·(xₜ − Π_g(xₜ)) + w₃·J_Σ(Σₜ)
 *
 * Time dynamics (feedback):
 *   xₜ₊₁ = xₜ − η · rₜ
 *
 * Distributed O.i (optional):
 *   C_U^net(t) = Σⱼ πⱼ · C_U^ⱼ(t)
 *   rₜ^net = Σⱼ πⱼ · rₜ^ⱼ + μ · Σ_(j,k) A_{jk} · (xₜ^ⱼ − xₜ^ᵏ)
 */

export type Scalar = number;

export interface Vec {
  v: number[];
}

export interface UniversalCoherenceState {
  /** xₜ: system state embedding */
  x: Vec;
  /** bₜ: belief embedding (claims/assumptions) */
  b: Vec;
  /** gₜ: goal embedding (task objective) */
  g: Vec;
  /** Σₜ: identity/policy vector */
  Sigma: Vec;
  /** Σₜ₋₁: previous identity/policy vector (for drift) */
  SigmaPrev?: Vec;
}

export interface Psi9Weights {
  /** α,β,γ ≥ 0 and α+β+γ = 1 */
  alpha: Scalar;
  beta: Scalar;
  gamma: Scalar;
  /** residual weights w₁,w₂,w₃ ≥ 0 */
  w1: Scalar;
  w2: Scalar;
  w3: Scalar;
}

export interface Psi9Params {
  /** ρ > 0 (identity coherence softness) */
  rho: Scalar;
  /** ε > 0 (stability) */
  eps?: Scalar;
  /** η > 0 (coherence step size for feedback update) */
  eta?: Scalar;
  /** λ_Σ ≥ 0 (identity drift penalty scale) */
  lambdaSigma?: Scalar;
}

export const Psi9 = {
  id: "psi_9_universal_coherence",
  symbol: "ψ₉",
  name: "Universal Coherence Operator",
  vi_name: "Toán tử Nhất Quán Toàn Cục",
  author: "Trung Bờm × GPT",
  nature: "Meta-coherence operator: computes global coherence score and a residual vector for corrective feedback (A.i/O.i).",
  math_unicode: {
    components: [
      "C_int(t) = cos(xₜ, bₜ)",
      "C_goal(t) = cos(xₜ, gₜ)",
      "ΔΣₜ = Σₜ − Σₜ₋₁",
      "D_id(t) = ||ΔΣₜ|| / (||Σₜ|| + ε)",
      "C_id(t) = exp(− D_id(t) / ρ)"
    ],
    aggregate: "C_U(t) = α·C_int(t) + β·C_goal(t) + γ·C_id(t)",
    projection: [
      "Π_b(x) = (⟨x,b⟩ / ⟨b,b⟩) · b",
      "Π_g(x) = (⟨x,g⟩ / ⟨g,g⟩) · g"
    ],
    residual: "rₜ = w₁·(xₜ − Π_b(xₜ)) + w₂·(xₜ − Π_g(xₜ)) + w₃·J_Σ(Σₜ)",
    dynamics: "xₜ₊₁ = xₜ − η · rₜ",
    distributed: [
      "C_U^net(t) = Σⱼ πⱼ · C_U^ⱼ(t)",
      "rₜ^net = Σⱼ πⱼ · rₜ^ⱼ + μ · Σ_(j,k) A_{jk} · (xₜ^ⱼ − xₜ^ᵏ)"
    ]
  },
  semantics_ast: {
    op: "tuple",
    items: [
      { sym: "C_U(t)" },
      { sym: "rₜ" }
    ]
  }
} as const;

/** Dot product */
function dot(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

/** Euclidean norm */
function norm(a: number[]): number {
  return Math.sqrt(dot(a, a));
}

/** Elementwise add */
function add(a: number[], b: number[]): number[] {
  const n = Math.min(a.length, b.length);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = a[i] + b[i];
  return out;
}

/** Elementwise sub */
function sub(a: number[], b: number[]): number[] {
  const n = Math.min(a.length, b.length);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = a[i] - b[i];
  return out;
}

/** Scalar multiply */
function smul(a: number[], k: number): number[] {
  return a.map(x => x * k);
}

/** Safe cosine similarity */
export function cosSim(a: number[], b: number[], eps = 1e-12): number {
  const na = norm(a);
  const nb = norm(b);
  if (na < eps || nb < eps) return 0;
  return dot(a, b) / (na * nb);
}

/** Projection Π_u(x) onto direction u: (⟨x,u⟩/⟨u,u⟩)u */
export function projectOnto(x: number[], u: number[], eps = 1e-12): number[] {
  const uu = dot(u, u);
  if (uu < eps) return new Array<number>(Math.min(x.length, u.length)).fill(0);
  const k = dot(x, u) / uu;
  return smul(u.slice(0, Math.min(x.length, u.length)), k);
}

/** ΔΣ = Σ − Σ_prev */
export function deltaSigma(Sigma: Vec, SigmaPrev?: Vec): Vec {
  if (!SigmaPrev) return { v: new Array<number>(Sigma.v.length).fill(0) };
  const n = Math.min(Sigma.v.length, SigmaPrev.v.length);
  return { v: sub(Sigma.v.slice(0, n), SigmaPrev.v.slice(0, n)) };
}

/**
 * Identity drift penalty J_Σ(Σₜ).
 * Proxy implementation: J_Σ(Σₜ) = λ_Σ · ΔΣₜ (directional penalty on drift).
 */
export function J_Sigma(dSigma: Vec, lambdaSigma = 0): Vec {
  return { v: smul(dSigma.v, lambdaSigma) };
}

/** Compute identity coherence C_id(t) */
export function identityCoherence(Sigma: Vec, SigmaPrev: Vec | undefined, rho: number, eps = 1e-12): number {
  const d = deltaSigma(Sigma, SigmaPrev).v;
  const D_id = norm(d) / (norm(Sigma.v) + eps);
  const rr = Math.max(rho, eps);
  return Math.exp(-D_id / rr);
}

/**
 * Compute Universal Coherence score C_U and residual vector rₜ.
 */
export function psi9(
  s: UniversalCoherenceState,
  weights: Psi9Weights,
  params: Psi9Params
): { C_int: number; C_goal: number; C_id: number; C_U: number; residual: Vec } {
  const eps = params.eps ?? 1e-12;
  const rho = Math.max(params.rho, eps);
  const lambdaSigma = params.lambdaSigma ?? 0;

  // Dimension alignment
  const d = Math.min(s.x.v.length, s.b.v.length, s.g.v.length);
  const x = s.x.v.slice(0, d);
  const b = s.b.v.slice(0, d);
  const g = s.g.v.slice(0, d);

  const C_int = cosSim(x, b, eps);
  const C_goal = cosSim(x, g, eps);
  const C_id = identityCoherence(s.Sigma, s.SigmaPrev, rho, eps);

  // Normalize αβγ if slightly off
  const sumABC = weights.alpha + weights.beta + weights.gamma;
  const alpha = sumABC > eps ? weights.alpha / sumABC : 1;
  const beta = sumABC > eps ? weights.beta / sumABC : 0;
  const gamma = sumABC > eps ? weights.gamma / sumABC : 0;

  const C_U = alpha * C_int + beta * C_goal + gamma * C_id;

  // Residual vector components
  const Pb = projectOnto(x, b, eps);
  const Pg = projectOnto(x, g, eps);

  const term1 = smul(sub(x, Pb), weights.w1);
  const term2 = smul(sub(x, Pg), weights.w2);

  const dSig = deltaSigma(s.Sigma, s.SigmaPrev);
  const JS = J_Sigma(dSig, lambdaSigma).v;
  const JSd = JS.slice(0, Math.min(JS.length, d));
  const term3 = smul(JSd, weights.w3);

  const r = add(add(term1, term2), term3);
  return { C_int, C_goal, C_id, C_U, residual: { v: r } };
}

/** Apply time-dynamics update: x_{t+1} = x_t − η·r_t */
export function coherenceStep(x: Vec, residual: Vec, eta = 1): Vec {
  const n = Math.min(x.v.length, residual.v.length);
  const out = new Array<number>(n);
  for (let i = 0; i < n; i++) out[i] = x.v[i] - eta * residual.v[i];
  return { v: out };
}

/* ===================== Distributed O.i Helpers ===================== */

export interface NodeState extends UniversalCoherenceState {
  nodeId: string;
}

export interface DistributedParams {
  /** μ ≥ 0 consensus strength */
  mu: number;
  /** adjacency matrix A_{jk} (square, N×N) */
  A: number[][];
  /** consensus weights πⱼ (length N, sum to 1) */
  pi: number[];
}

/**
 * Compute distributed network residual r^net and network coherence C_U^net.
 * Returns:
 * - perNode: individual node scores/residuals
 * - C_U_net: weighted coherence
 * - r_net: network residual including consensus term
 */
export function psi9Distributed(
  nodes: NodeState[],
  weights: Psi9Weights,
  params: Psi9Params,
  dist: DistributedParams
): {
  perNode: Array<{ nodeId: string; C_U: number; residual: Vec }>;
  C_U_net: number;
  r_net: Vec;
} {
  const N = nodes.length;
  if (N === 0) return { perNode: [], C_U_net: 0, r_net: { v: [] } };

  const eps = params.eps ?? 1e-12;
  const pi = dist.pi.slice(0, N);
  const sumPi = pi.reduce((a, b) => a + b, 0);
  const piNorm = sumPi > eps ? pi.map(p => p / sumPi) : pi.map(() => 1 / N);

  // Compute per-node coherence and residual
  const perNode = nodes.map((n) => {
    const out = psi9(n, weights, params);
    return { nodeId: n.nodeId, C_U: out.C_U, residual: out.residual };
  });

  // Network coherence
  let C_U_net = 0;
  for (let j = 0; j < N; j++) C_U_net += piNorm[j] * perNode[j].C_U;

  // Residual aggregation
  const d = Math.min(...nodes.map(n => n.x.v.length), ...perNode.map(p => p.residual.v.length));
  const r_net = new Array<number>(d).fill(0);

  // Σⱼ πⱼ rⱼ
  for (let j = 0; j < N; j++) {
    const rj = perNode[j].residual.v.slice(0, d);
    for (let i = 0; i < d; i++) r_net[i] += piNorm[j] * rj[i];
  }

  // Consensus term: μ · Σ_(j,k) A_{jk} (xⱼ − x_k)
  const mu = Math.max(0, dist.mu);
  const A = dist.A;
  if (mu > 0 && A && A.length >= N) {
    for (let j = 0; j < N; j++) {
      for (let k = 0; k < N; k++) {
        const a = (A[j]?.[k] ?? 0);
        if (a === 0) continue;
        const xj = nodes[j].x.v.slice(0, d);
        const xk = nodes[k].x.v.slice(0, d);
        for (let i = 0; i < d; i++) r_net[i] += mu * a * (xj[i] - xk[i]);
      }
    }
  }

  return { perNode, C_U_net, r_net: { v: r_net } };
}
