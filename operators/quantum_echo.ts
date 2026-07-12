// quantum_echo.ts
// Quantum Echo Operator (ψᴱ) — Operator Intelligence Module

export type Complex = { re: number; im: number };

export interface PhaseFeedback {
  phi: number; // phase-feedback potential
}

export interface QuantumState {
  x: number[];      // state vector (real part)
  y: number[];      // state vector (imag part)
  feedback: PhaseFeedback;
}

// Hadamard (elementwise) product of two complex vectors
export function hadamard(a: Complex[], b: Complex[]): Complex[] {
  return a.map((v, i) => ({
    re: v.re * b[i].re - v.im * b[i].im,
    im: v.re * b[i].im + v.im * b[i].re
  }));
}

// Conjugate of a complex vector
export function conjugate(v: Complex[]): Complex[] {
  return v.map(z => ({ re: z.re, im: -z.im }));
}

// Norm squared |ψ|^2
export function normSquared(v: Complex[]): number {
  return v.reduce((s, z) => s + z.re*z.re + z.im*z.im, 0);
}

// Quantum Echo Operator ψᴱ
export function quantumEcho(state: QuantumState): Complex[] {
  const psi: Complex[] = state.x.map((v, i) => ({ re: v, im: state.y[i] }));
  const psiStar = conjugate(psi);
  const core = hadamard(psi, psiStar); // ψ ⊙ ψ*
  // add phase-feedback as real shift to each component
  return core.map(z => ({ 
    re: z.re + state.feedback.phi, 
    im: z.im 
  }));
}

// Echo metric Mᴱ(ψ)
export function echoMetric(state: QuantumState): number {
  const psi: Complex[] = state.x.map((v, i) => ({ re: v, im: state.y[i] }));
  const base = normSquared(psi);
  return base + state.feedback.phi;
}

// Echo drift placeholder (∂ψᴱ/∂t)
export function echoDrift(prev: QuantumState, next: QuantumState): number {
  return echoMetric(next) - echoMetric(prev);
}
