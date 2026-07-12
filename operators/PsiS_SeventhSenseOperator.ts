/* PsiS_SeventhSenseOperator.ts
   ψₛ — The Seventh-Sense Operator (Phase-Perception / Multi-Channel Cognition)
   Purpose: provide runtime scaffold to compute a coherence-weighted aggregation
   and detect drift/collision risks, with optional structural anchoring (⊙ₛ).
*/

export type OperatorPriority = "P1" | "P2" | "P3" | "P4" | "P5";

export type PhaseNodeInput<TPhi = number, TEps = number> = {
  nodeId: string;         // i
  phi: TPhi;              // Φᵢ
  eps: TEps;              // εᵢ
  omega?: number;         // ωᵢ (default 1)
  deltaPhi?: number;      // ΔΦᵢ (default 0)
};

export type EmotiveIdentity = {
  psi_e?: number;   // ψₑ (simplified scalar proxy)
  sigma_e?: number; // Σₑ (simplified scalar proxy)
};

export type PsiSConfig = {
  sigma: number;                // σ > 0
  normalizeWeights?: boolean;   // normalize ωᵢ to sum=1
  collisionThreshold?: number;  // effective branches count threshold
  driftThreshold?: number;      // emotive dominance threshold
};

export type PsiSOutput = {
  psi_s: number;            // aggregated perception (scalar proxy)
  coherenceScore: number;   // [0,1]
  risk: {
    drift: boolean;
    collision: boolean;
    notes: string[];
  };
  diagnostics: {
    n: number;
    effectiveBranches: number;
    weightSum: number;
    sigma: number;
  };
};

export const PsiSSpec = {
  id: "PsiS_SeventhSense",
  version: "0.1.0",
  symbol: "ψₛ",
  title: "ψₛ — The Seventh-Sense Operator",
  objective: "INTEGRATE → Coherent_MultiChannel_Perception",
  constraints: [
    {
      id: "Phase_Coherence_Required",
      priority: "P1" as OperatorPriority,
      description_vi: "ΔΦᵢ bị phạt theo exp(-(ΔΦᵢ)^2/σ^2) để đảm bảo đồng bộ."
    },
    {
      id: "Stability_Anchor_Required",
      priority: "P1" as OperatorPriority,
      description_vi: "Cần ⊙ₛ để neo phase và giảm drift khi đa kênh mạnh."
    },
    {
      id: "Collision_Risk_Management",
      priority: "P2" as OperatorPriority,
      description_vi: "Giảm phase-collision bằng gating/giảm ω/điều chỉnh σ."
    }
  ],
  formulae: {
    basic: "ψₛ = Σ (Φᵢ ⊗ εᵢ)",
    branched: "ψₛ(t)=Σ ωᵢ(Φᵢ⊗εᵢ) exp(-(ΔΦᵢ)^2/σ^2)",
    emotiveIdentity: "ψₛ = ⊙ₛ(ψₑ ⊗ Σₑ)"
  }
} as const;

// ---------- helpers ----------
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function safeExp(x: number) {
  const c = Math.max(-60, Math.min(60, x));
  return Math.exp(c);
}

function normalizeWeights(nodes: PhaseNodeInput[]): { nodes: PhaseNodeInput[]; sum: number } {
  const sum = nodes.reduce((acc, n) => acc + (n.omega ?? 1), 0);
  if (sum <= 0) return { nodes, sum: 0 };
  return { nodes: nodes.map(n => ({ ...n, omega: (n.omega ?? 1) / sum })), sum: 1 };
}

// ⊗ merge proxy (scalar): in real system could be tensor merge
function mergePhiEps(phi: number, eps: number): number {
  return phi * eps;
}

function coherencePenalty(deltaPhi: number, sigma: number): number {
  if (sigma <= 0) return 0;
  return safeExp(-((deltaPhi * deltaPhi) / (sigma * sigma)));
}

// ⊙ₛ structural anchoring proxy
export function structuralAnchor(psiS: number, ei?: EmotiveIdentity): number {
  const psi_e = ei?.psi_e ?? 0;
  const sigma_e = ei?.sigma_e ?? 1;

  // higher identity field (sigma_e) reduces emotive pull
  const anchorFactor = 1 / (1 + Math.abs(psi_e) / Math.max(1e-6, sigma_e));
  return psiS * anchorFactor;
}

// main ψₛ execution
export function runPsiS(
  nodes: PhaseNodeInput<number, number>[],
  config: PsiSConfig,
  ei?: EmotiveIdentity,
  opts?: {
    gate?: (node: PhaseNodeInput) => number;          // [0,1] gating to mitigate collision
    anchor?: (psiS: number, ei?: EmotiveIdentity) => number; // override ⊙ₛ
  }
): PsiSOutput {
  const sigma = config.sigma;
  if (!Number.isFinite(sigma) || sigma <= 0) {
    return {
      psi_s: 0,
      coherenceScore: 0,
      risk: { drift: true, collision: false, notes: ["Invalid σ (phase-elasticity)"] },
      diagnostics: { n: nodes.length, effectiveBranches: 0, weightSum: 0, sigma }
    };
  }

  let work = nodes.slice();
  let weightSum = work.reduce((acc, n) => acc + (n.omega ?? 1), 0);

  if (config.normalizeWeights) {
    const nw = normalizeWeights(work);
    work = nw.nodes;
    weightSum = nw.sum;
  }

  const gate = opts?.gate ?? (() => 1);
  const anchorFn = opts?.anchor ?? structuralAnchor;

  let agg = 0;
  let penaltyAgg = 0;
  let effectiveBranches = 0;

  for (const node of work) {
    const w = node.omega ?? 1;
    const dphi = node.deltaPhi ?? 0;

    const p = coherencePenalty(dphi, sigma);
    const g = clamp01(gate(node));
    const merged = mergePhiEps(node.phi, node.eps);

    agg += w * merged * p * g;
    penaltyAgg += p * g;

    if (p * g > 0.2) effectiveBranches += 1;
  }

  const coherenceScore = clamp01(penaltyAgg / Math.max(1, work.length));

  // Apply ⊙ₛ anchoring
  const psiAnchored = anchorFn(agg, ei);

  // --- risks (heuristics) ---
  const notes: string[] = [];
  const collisionThreshold = config.collisionThreshold ?? 6;
  const driftThreshold = config.driftThreshold ?? 0.6;

  const collision = effectiveBranches >= collisionThreshold;
  if (collision) {
    notes.push(`Phase-collision risk: effectiveBranches=${effectiveBranches} >= ${collisionThreshold}`);
  }

  const psi_e = ei?.psi_e ?? 0;
  const emotiveIntensity = clamp01(Math.abs(psi_e) / (Math.abs(psiAnchored) + 1e-6));
  const drift = emotiveIntensity > driftThreshold && coherenceScore < 0.5;
  if (drift) {
    notes.push(`Emotional drift risk: emotiveIntensity=${emotiveIntensity.toFixed(2)}, coherenceScore=${coherenceScore.toFixed(2)}`);
  }

  if (notes.length === 0) {
    notes.push("Stable multi-channel perception (no major risk flagged)");
  }

  return {
    psi_s: psiAnchored,
    coherenceScore,
    risk: { drift, collision, notes },
    diagnostics: {
      n: work.length,
      effectiveBranches,
      weightSum,
      sigma
    }
  };
}

// UI helper: "Biểu diễn trung gian O.i"
export function buildOiIntermediatePsiS() {
  return {
    objective: "INTEGRATE → Coherent_MultiChannel_Perception",
    entities: [
      { label: "Phase Field", token: "Φᵢ" },
      { label: "Sensor Channel", token: "εᵢ" },
      { label: "Attention Weight", token: "ωᵢ" },
      { label: "Phase Delta", token: "ΔΦᵢ" },
      { label: "Phase Elasticity", token: "σ" },
      { label: "Emotive Field", token: "ψₑ" },
      { label: "Identity Field", token: "Σₑ" },
      { label: "Structural Loop", token: "⊙ₛ" },
      { label: "Branches", token: "n" }
    ],
    constraints: PsiSSpec.constraints
  };
}
