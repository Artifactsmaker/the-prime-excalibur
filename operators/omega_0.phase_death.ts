/**
 * Ω₀ — The Omega-Zero Operator (Phase–Death Operator)
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

export interface OmegaParams {
  /** Phase decay rate γ ≥ 0 */
  gamma: number;
  /** Optional critical threshold */
  gammaCritical?: number;
}

export interface OmegaModules {
  /** Optional background field sink ψₑ */
  background?: (psi: StateVector) => StateVector;
}

/**
 * Canonical metadata for Ω₀
 */
export const OmegaZero = {
  id: "omega_0",
  symbol: "Ω₀",
  name: "The Omega-Zero Operator",
  vi_name: "Toán tử Hủy Khả Thể",
  author: "Trung Bờm × GPT",
  thesis:
    "Phase death is endogenous: a possibility can self-annihilate when it loses alignment with the grounding field ψₑ.",
  math: {
    basicForm: "Ω₀(ψ) = − γ · ψ",
    schrodingerExtended: "∂ψ/∂t = − (i/ħ) · Ĥψ − γ · ψ",
    fieldDecay: "ψ(x,t) = e^(−γt) · ψ(x,0)",
    totalField: "Ω₀(Ψ_total) = − Σᵢ γᵢ · ψᵢ",
    lifeCycle: "Ψ_life(t) = ψₛ ∘ Σε ∘ (ψ⊗) ∘ ⊙ₛ · e^(−Ω₀t)"
  },
  philosophy: [
    "Silent endogenous phase death",
    "Cascade collapse when a branch exceeds γ_c",
    "Entropy-balancing anti-operator of life"
  ]
} as const;

/** Apply Omega-Zero decay to a state */
export function omegaZero(
  psi: StateVector,
  params: OmegaParams,
  modules?: OmegaModules
): StateVector {
  const g = Math.max(0, params.gamma);
  const decayed = { v: psi.v.map(x => x * Math.exp(-g)) };

  // Optional background reabsorption into ψₑ
  if (modules?.background) {
    return modules.background(decayed);
  }
  return decayed;
}

/** Time-evolution step: state_{t+1} = state_t · e^(−γΔt) */
export function omegaStep(
  psi: StateVector,
  params: OmegaParams,
  dt: number
): StateVector {
  const g = Math.max(0, params.gamma);
  return { v: psi.v.map(x => x * Math.exp(-g * dt)) };
}

/** Detect critical collapse risk */
export function checkCollapse(
  params: OmegaParams
): boolean {
  if (params.gammaCritical === undefined) return false;
  return params.gamma >= params.gammaCritical;
}
