/**
 * Height-Collapse / Metric→Symmetry Attractor (Brauer Height→0)
 * Operatorology / Operator Intelligence artifact
 *
 * - Vietnamese, Unicode math friendly.
 * - No LaTeX required at runtime.
 *
 * Core idea:
 *   H high  -> metric is sensitive; keep fine differences
 *   H low   -> metric degenerates (effective rank/precision shrinks); merge orbit-variants; keep invariants
 *
 * This file provides:
 *  - Metric operators (cosine, Mahalanobis diagonal, low-rank)
 *  - Symmetry projection (K-sample transform averaging)
 *  - Height controller (precision/rank/threshold schedules)
 *  - A practical Metric→Symmetry pipeline for retrieval / decision verification
 */

export type Scalar = number;
export type Vec = Float32Array;            // use Float32Array for SIMD friendliness
export type MatDiag = Float32Array;        // diagonal weights (same length as vectors)

export interface HeightConfig {
  /** Height value H ≥ 0. Recommended normalize to [0, 1] in practice. */
  H: number;
  /** Reference height H0 for normalization (default 1). */
  H0?: number;

  /** Merge threshold τ(H): if D_H(x,y) ≤ τ => treat-as-same */
  tau0?: number;   // base threshold
  alpha?: number;  // threshold growth coefficient

  /** Effective rank control for low-rank metrics */
  k0?: number;     // max rank at high H
  kMin?: number;   // min rank at low H
}

/** Symmetry group action as a transform over vectors. */
export type Transform = (x: Vec) => Vec;

export interface SymmetryProjectionConfig {
  /** K transforms to sample/compose; typical 4..16 */
  transforms: Transform[];
  /** If true, include identity transform. */
  includeIdentity?: boolean;
  /** Normalization after averaging. */
  l2Normalize?: boolean;
}

export interface PipelineConfig {
  height: HeightConfig;
  metric: {
    kind: "cosine" | "mahalanobis_diag" | "lowrank";
    /** For diag metric */
    wDiag?: MatDiag;
    /** For low-rank metric: W ≈ U Σ Uᵀ  represented by basis vectors (columns of U) and singular values */
    basis?: Vec[];          // k basis vectors, each same dim
    sigma?: Float32Array;   // k singular values (>=0)
  };
  symmetry?: SymmetryProjectionConfig;
}

/* ------------------------ basic vector utils ------------------------ */

export function dot(a: Vec, b: Vec): number {
  if (a.length !== b.length) throw new Error("dot: dimension mismatch");
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function l2(a: Vec): number {
  return Math.sqrt(dot(a, a));
}

export function l2Normalize(a: Vec): Vec {
  const n = l2(a);
  if (n === 0) return a.slice() as Vec;
  const out = new Float32Array(a.length);
  const inv = 1 / n;
  for (let i = 0; i < a.length; i++) out[i] = a[i] * inv;
  return out;
}

export function sub(a: Vec, b: Vec): Vec {
  if (a.length !== b.length) throw new Error("sub: dimension mismatch");
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] - b[i];
  return out;
}

export function addInPlace(acc: Float32Array, v: Vec): void {
  if (acc.length !== v.length) throw new Error("addInPlace: dimension mismatch");
  for (let i = 0; i < acc.length; i++) acc[i] += v[i];
}

export function scale(a: Vec, c: number): Vec {
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] * c;
  return out;
}

/* ------------------------ metric / divergence ------------------------ */

/**
 * Cosine divergence: D = 1 - cos(a,b)
 */
export function cosineDivergence(a: Vec, b: Vec): number {
  const na = l2(a);
  const nb = l2(b);
  if (na === 0 || nb === 0) return 1;
  const c = dot(a, b) / (na * nb);
  // clamp for numeric stability
  const cc = Math.max(-1, Math.min(1, c));
  return 1 - cc;
}

/**
 * Mahalanobis (diagonal) divergence: D = (a-b)ᵀ diag(w) (a-b)
 */
export function mahalanobisDiagDivergence(a: Vec, b: Vec, wDiag: MatDiag): number {
  if (a.length !== b.length || a.length !== wDiag.length) {
    throw new Error("mahalanobisDiagDivergence: dimension mismatch");
  }
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d * wDiag[i];
  }
  return s;
}

/**
 * Low-rank metric divergence:
 *   D = (a-b)ᵀ (U diag(sigma) Uᵀ) (a-b) = Σ_j sigma_j * <u_j, (a-b)>^2
 */
export function lowRankDivergence(a: Vec, b: Vec, basis: Vec[], sigma: Float32Array): number {
  if (basis.length !== sigma.length) throw new Error("lowRankDivergence: k mismatch");
  const d = sub(a, b);
  let s = 0;
  for (let j = 0; j < basis.length; j++) {
    const uj = basis[j];
    if (uj.length !== d.length) throw new Error("lowRankDivergence: dim mismatch");
    const proj = dot(uj, d);
    s += sigma[j] * proj * proj;
  }
  return s;
}

/* ------------------------ symmetry projection ------------------------ */

/**
 * Symmetry projection by averaging over sampled transforms:
 *   P_G(x) ≈ (1/K) Σ_i T_i(x)
 */
export function projectInvariance(x: Vec, cfg: SymmetryProjectionConfig): Vec {
  const xs: Vec[] = [];
  if (cfg.includeIdentity !== false) xs.push(x);
  for (const T of cfg.transforms) xs.push(T(x));

  const acc = new Float32Array(x.length);
  for (const v of xs) addInPlace(acc, v);

  const out = scale(acc, 1 / xs.length);
  return cfg.l2Normalize ? l2Normalize(out) : out;
}

/* ------------------------ height controller ------------------------ */

/**
 * Normalized height h in [0,1] given H and H0.
 * If H0 omitted, assume 1.
 */
export function height01(H: number, H0 = 1): number {
  if (H0 <= 0) throw new Error("height01: H0 must be >0");
  const h = H / H0;
  // allow H>H0; clamp for scheduling convenience
  return Math.max(0, Math.min(1, h));
}

/**
 * Merge threshold τ(H) schedule:
 *   τ(H) = τ0 + α (1 - h), where h = H/H0 in [0,1]
 * So when H→0 (h→0), τ increases.
 */
export function mergeThreshold(cfg: HeightConfig): number {
  const H0 = cfg.H0 ?? 1;
  const h = height01(cfg.H, H0);
  const tau0 = cfg.tau0 ?? 0.1;
  const alpha = cfg.alpha ?? 0.4;
  return tau0 + alpha * (1 - h);
}

/**
 * Effective rank k(H) schedule for low-rank metric:
 *   k(H) = round( kMin + (k0 - kMin) * h )
 * So H high -> k near k0, H low -> k near kMin.
 */
export function effectiveRank(cfg: HeightConfig): number {
  const H0 = cfg.H0 ?? 1;
  const h = height01(cfg.H, H0);
  const k0 = cfg.k0 ?? 16;
  const kMin = cfg.kMin ?? 4;
  const k = Math.round(kMin + (k0 - kMin) * h);
  return Math.max(1, k);
}

/* ------------------------ metric→symmetry pipeline ------------------------ */

export interface PipelineResult {
  /** Divergence before symmetry projection */
  dMetric: number;
  /** Divergence after symmetry projection (if symmetry enabled) */
  dInvariant?: number;
  /** Merge decision under τ(H) */
  merge: boolean;
  /** τ(H) used */
  tau: number;
}

/**
 * Compute divergence between x and y using chosen metric,
 * optionally after symmetry projection.
 */
export function metricSymmetryCompare(x: Vec, y: Vec, cfg: PipelineConfig): PipelineResult {
  const tau = mergeThreshold(cfg.height);

  // metric divergence
  const dMetric = metricDivergence(x, y, cfg);

  // optional invariance projection
  let dInvariant: number | undefined = undefined;
  if (cfg.symmetry) {
    const zx = projectInvariance(x, cfg.symmetry);
    const zy = projectInvariance(y, cfg.symmetry);
    dInvariant = metricDivergence(zx, zy, cfg);
  }

  const dForDecision = (dInvariant ?? dMetric);
  const merge = dForDecision <= tau;

  return { dMetric, dInvariant, merge, tau };
}

/**
 * Metric divergence dispatch with optional low-rank truncation by Height.
 */
export function metricDivergence(a: Vec, b: Vec, cfg: PipelineConfig): number {
  const kind = cfg.metric.kind;

  if (kind === "cosine") return cosineDivergence(a, b);

  if (kind === "mahalanobis_diag") {
    const w = cfg.metric.wDiag;
    if (!w) throw new Error("metricDivergence: wDiag required");
    // Height →0 can be emulated by down-weighting fine dimensions; caller can precompute wDiag(H)
    return mahalanobisDiagDivergence(a, b, w);
  }

  // lowrank
  const basis = cfg.metric.basis;
  const sigma = cfg.metric.sigma;
  if (!basis || !sigma) throw new Error("metricDivergence: basis & sigma required for lowrank");

  // truncate rank according to Height
  const k = effectiveRank(cfg.height);
  const kk = Math.min(k, basis.length);
  return lowRankDivergence(a, b, basis.slice(0, kk), sigma.slice(0, kk));
}

/* ------------------------ example transforms (optional) ------------------------ */

/**
 * Example transform: additive Gaussian-like noise (deterministic via PRNG seed).
 * NOTE: For silicon-grade deployment, transforms should be simple LUT/canonicalization.
 */
export function makeNoiseTransform(seed: number, std = 0.01): Transform {
  let s = seed >>> 0;
  const rand = () => {
    // xorshift32
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17; s >>>= 0;
    s ^= s << 5;  s >>>= 0;
    return (s >>> 0) / 0xFFFFFFFF;
  };

  return (x: Vec) => {
    const out = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) {
      // Box-Muller (approx)
      const u1 = Math.max(1e-12, rand());
      const u2 = Math.max(1e-12, rand());
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      out[i] = x[i] + std * z;
    }
    return out;
  };
}
