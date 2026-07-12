
/**
 * Valid-Cut Operator System (𝕍)
 * Phiên bản axiomatic chuẩn hóa (VI)
 *
 * Mô hình hóa tiến hóa có ràng buộc với các toán tử:
 * 𝓒: Cut Operator
 * 𝓚: Kernel Operator
 * 𝓔: Evolution Operator
 * 𝓓: Decomposition Operator
 * h : Height function (Lyapunov-like)
 * 𝓘 : Identity kernel
 */

export type Vec = Float32Array;

export type State = Vec;

export type HeightFn = (S: State) => number;

export type IdentityKernelFn = (S: State) => State;

export type KernelOperator = (S: State) => State;

export type EvolutionOperator = (S: State) => State;

export type CutOperator = (space: State[]) => State[];

export type DecompositionOperator = (S: State) => State[];

export interface ValidCutOperatorSystem {
  Omega: State[];
  C: CutOperator;
  K: KernelOperator;
  E: EvolutionOperator;
  D: DecompositionOperator;
  h: HeightFn;
  I: IdentityKernelFn;
}

/**
 * Update state:
 * S_{t+1} = E(K(S_t))
 */
export function updateState(system: ValidCutOperatorSystem, S: State): State {
  const Sk = system.K(S);
  const Se = system.E(Sk);
  return Se;
}

/**
 * Update space:
 * Ω_{t+1} = C(Ω_t)
 */
export function updateSpace(system: ValidCutOperatorSystem): void {
  system.Omega = system.C(system.Omega);
}

/**
 * Check convergence:
 * h(S) ≈ 0
 */
export function isConverged(system: ValidCutOperatorSystem, S: State, epsilon=1e-9): boolean {
  return system.h(S) <= epsilon;
}

/**
 * Full iteration loop
 */
export function iterate(system: ValidCutOperatorSystem, S0: State, maxSteps=1000): State {
  let S = S0;
  for (let i=0; i<maxSteps; i++) {
    updateSpace(system);
    S = updateState(system, S);
    if (isConverged(system, S)) break;
  }
  return S;
}

/**
 * Final decomposition
 */
export function decompose(system: ValidCutOperatorSystem, S: State): State[] {
  return system.D(S);
}
