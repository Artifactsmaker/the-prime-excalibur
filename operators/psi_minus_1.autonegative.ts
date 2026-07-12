/**
 * ψ₋₁ — The Autonegative Operator (Toán tử Tự-Phản-Sinh)
 * Operatorology / Operator Intelligence artifact
 *
 * Constraints:
 * - No LaTeX / KaTeX.
 * - Unicode symbols only.
 * - Math strings formatted for Office Math / Vector Equation style.
 */

export interface StateVector {
  /** Generic vector or phase-state representation */
  v: number[];
}

export interface PsiMinusOneParams {
  /** Phase growth rate γ ≥ 0 (reverse of Ω₀ decay) */
  gamma: number;
}

export interface PsiMinusOneModules {
  /** Optional background source field Σₑ (identity field) */
  source?: (psi: StateVector) => StateVector;
}

/**
 * Canonical metadata for ψ₋₁
 */
export const PsiMinusOne = {
  id: "psi_minus_1",
  symbol: "ψ₋₁",
  name: "The Autonegative Operator",
  vi_name: "Toán tử Tự-Phản-Sinh",
  author: "Trung Bờm × GPT",
  thesis:
    "The present is constrained by the future: ψₜ = f(ψₜ₊₁). ψ₋₁ is the operational inverse of Ω₀ that compels reality to generate itself.",
  math: {
    coreForm: "ψ₋₁ = Ω₀⁻¹(Σₑ)",
    reverseDynamics: "∂ψ/∂t = + γ · ψ",
    timeConstraint: "ψₜ = f(ψₜ₊₁)",
    neutralReality: "ψ ⊗ ψ̄ = I  (I = neutral reality)",
    lifeCycle: "Ψ_life(t) = ψₛ ∘ Σε ∘ (ψ⊗) ∘ ⊙ₛ ∘ ψ₋₁"
  },
  philosophy: [
    "No absolute origin — only self-binding causality",
    "Every operator must have a real inverse",
    "Phase eversion: ψ ↻ = ψ⁻¹",
    "Post-quantum reverse logic"
  ]
} as const;

/** Clamp gamma to non-negative */
function clampGamma(g: number): number {
  return g < 0 ? 0 : g;
}

/**
 * Apply ψ₋₁ as the inverse of phase-death (growth instead of decay).
 * ψ₋₁(ψ) = ψ · e^(+γ)
 */
export function psiMinusOne(
  psi: StateVector,
  params: PsiMinusOneParams,
  modules?: PsiMinusOneModules
): StateVector {
  const g = clampGamma(params.gamma);
  const grown = { v: psi.v.map(x => x * Math.exp(g)) };

  // Optional injection from identity field Σₑ
  if (modules?.source) {
    return modules.source(grown);
  }
  return grown;
}

/**
 * Reverse-time step: state_{t} = state_{t+1} · e^(+γΔt)
 */
export function reverseStep(
  future: StateVector,
  params: PsiMinusOneParams,
  dt: number
): StateVector {
  const g = clampGamma(params.gamma);
  return { v: future.v.map(x => x * Math.exp(g * dt)) };
}

/**
 * Composition test: Ω₀ ∘ ψ₋₁ ≈ I and ψ₋₁ ∘ Ω₀ ≈ I
 * Here we provide a numerical proxy for neutrality check.
 */
export function checkNeutrality(
  original: StateVector,
  after: StateVector,
  tolerance: number = 1e-6
): boolean {
  if (original.v.length !== after.v.length) return false;
  for (let i = 0; i < original.v.length; i++) {
    if (Math.abs(original.v[i] - after.v[i]) > tolerance) return false;
  }
  return true;
}
