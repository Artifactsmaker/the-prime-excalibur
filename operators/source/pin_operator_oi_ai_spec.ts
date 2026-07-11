
/**
 * P_in — Inward Consolidation Operator
 * Full O.i / A.i Stack Specification
 * Version: 1.0.0
 */

export type SpaceType = "symbolic" | "numeric" | "graph" | "token" | "latent" | "hybrid";
export type OperatorClass = "inward_operator" | "consolidation_operator" | "attractor_operator" | "routing_operator";
export type RuntimeTarget =
  | "llm_inference"
  | "planner"
  | "symbolic_solver"
  | "retrieval"
  | "agent"
  | "operator_runtime"
  | "isa_chip";

export interface Identity {
  id: string;
  shortName: string;
  fullName: string;
  family: string;
  version: string;
  status: "draft" | "experimental" | "stable";
  authorship: string[];
  license: string;
}

export interface OperatorSpec {
  identity: Identity;
  intent: {
    objective: string;
    problemStatement: string;
    designRationale: string;
    publicSummary: string;
  };
  classification: {
    operatorClass: OperatorClass;
    isMetaOperator: boolean;
    isDerivedFromFixedPointLaw: boolean;
    parentLaw: string;
  };
  mathematics: {
    coreSymbol: string;
    coreDefinition: string;
    inwardnessDefinition: {
      id: string;
      description: string;
      formula: string;
      targetDirection: "higher";
    };
    coreRegionDefinition: string;
    contractionView: string;
    thresholds: {
      inwardnessThreshold: string;
      densityThreshold: string;
      adaptive: boolean;
      updatePolicy: string;
    };
  };
  semantics: {
    axioms: string[];
    propositions: string[];
    theoremSketches: string[];
    convergenceStatement: string;
  };
  pipeline: Array<{
    step: number;
    id: string;
    name: string;
    description: string;
    inputRef: string;
    outputRef: string;
  }>;
  oiMapping: Array<{
    layer: string;
    role: string;
    relationToOperator: string;
  }>;
  aiMapping: {
    runtimeTargets: RuntimeTarget[];
    aiRole: string;
    effectOnHypotheses: string;
    effectOnSearch: string;
    effectOnHallucination: string;
    effectOnLatency: string;
  };
  isaMapping: {
    mnemonic: string;
    syntax: string;
    modes: string[];
    sourceRegisters: string[];
    destinationRegisters: string[];
    sideEffects: string[];
  };
  benchmarkProfile: {
    scenario: string;
    baselineSystems: string[];
    metrics: Array<{
      name: string;
      symbol: string;
      meaning: string;
      targetDirection: "lower" | "higher";
    }>;
    expectedEffects: string[];
  };
  safetyGuards: Array<{
    id: string;
    condition: string;
    action: string;
    reason: string;
  }>;
  deploymentNotes: {
    compilerView: string;
    runtimeView: string;
    chipView: string;
    observability: string[];
  };
  metadata: Record<string, string | number | boolean>;
}

export const P_in: OperatorSpec = {
  identity: {
    id: "oi.operator.pin.v1",
    shortName: "P_in",
    fullName: "Inward Consolidation Operator",
    family: "Operator Intelligence / Adaptive Intelligence",
    version: "1.0.0",
    status: "stable",
    authorship: ["Trung Bom", "GPT"],
    license: "Proprietary-ready / research specification"
  },
  intent: {
    objective: "Consolidate viable states into a denser core region with stronger coherence and lower dispersion.",
    problemStatement: "Even after admissibility filtering, viable states may remain scattered, weakly coupled, or slow to converge.",
    designRationale: "After collapse, pull surviving states inward toward a core attractor region before fixed-point validation.",
    publicSummary: "P_in densifies the viable state space and shapes a core attractor for stable solution formation."
  },
  classification: {
    operatorClass: "inward_operator",
    isMetaOperator: false,
    isDerivedFromFixedPointLaw: false,
    parentLaw: "U(x) = x"
  },
  mathematics: {
    coreSymbol: "P_in: X' -> Core(X')",
    coreDefinition: "P_in maps an admissible state space into a denser, more coherent core region.",
    inwardnessDefinition: {
      id: "inwardness.core_density",
      description: "Inwardness measures concentration, coherence, and structural compactness inside the viable region.",
      formula: "I(X') = coherence(X') / dispersion(X')",
      targetDirection: "higher"
    },
    coreRegionDefinition: "Core(X') = argmax coherence(X') subject to viability and bounded dispersion",
    contractionView: "P_in is modeled as a contraction-like operator on the admissible region under suitable metrics.",
    thresholds: {
      inwardnessThreshold: "domain_configurable",
      densityThreshold: "domain_configurable",
      adaptive: true,
      updatePolicy: "Update from convergence history, cluster compactness, and validation feedback."
    }
  },
  semantics: {
    axioms: [
      "Not all viable states are equally central.",
      "Core formation accelerates stable convergence.",
      "A denser state cluster is easier to validate than a dispersed frontier."
    ],
    propositions: [
      "If inwardness increases while admissibility is preserved, fixed-point validation becomes more efficient.",
      "If P_in acts contractively on viable space, trajectories converge toward a core attractor."
    ],
    theoremSketches: [
      "Core acceleration: denser viable regions reduce effective search radius before validation.",
      "Contraction sketch: under suitable metric assumptions, repeated P_in shrinks dispersion."
    ],
    convergenceStatement: "P_in improves convergence by increasing coherence and reducing dispersion inside the viable set."
  },
  pipeline: [
    { step: 1, id: "receive_admissible_space", name: "Receive Admissible Space", description: "Accept viable states from ECO or another gating operator.", inputRef: "admissible_space", outputRef: "candidate_core_space" },
    { step: 2, id: "estimate_coherence", name: "Estimate Coherence", description: "Measure cluster density, semantic agreement, or structural compactness.", inputRef: "candidate_core_space", outputRef: "coherence_profile" },
    { step: 3, id: "pull_inward", name: "Pull Inward", description: "Reweight or cluster states toward the most coherent region.", inputRef: "coherence_profile", outputRef: "contracted_space" },
    { step: 4, id: "emit_core", name: "Emit Core", description: "Produce the core region for fixed-point validation.", inputRef: "contracted_space", outputRef: "core_space" }
  ],
  oiMapping: [
    { layer: "law", role: "Receives existence criterion from U.", relationToOperator: "P_in does not define existence; it prepares states for validation." },
    { layer: "meta_operator", role: "Usually follows ECO.", relationToOperator: "Acts after admissibility control." },
    { layer: "operator", role: "Consolidates viable structure toward a core.", relationToOperator: "P_in occupies this layer directly." },
    { layer: "state", role: "Carries the surviving states.", relationToOperator: "States are clustered, reweighted, or contracted inward." }
  ],
  aiMapping: {
    runtimeTargets: ["llm_inference", "planner", "symbolic_solver", "retrieval", "agent", "operator_runtime", "isa_chip"],
    aiRole: "Core-forming operator after admissibility filtering.",
    effectOnHypotheses: "Raises weight of coherent hypotheses and suppresses fringe-but-viable noise.",
    effectOnSearch: "Reduces search radius and sharpens attractor structure.",
    effectOnHallucination: "Improves semantic consistency by clustering around the strongest core.",
    effectOnLatency: "Can reduce downstream validation cost by delivering a denser candidate set."
  },
  isaMapping: {
    mnemonic: "PIN",
    syntax: "PIN src, metric, threshold, dst -> core",
    modes: ["CLUSTER", "CONTRACT", "DENSIFY", "ADAPT"],
    sourceRegisters: ["Rsrc", "Rmetric", "Rtheta"],
    destinationRegisters: ["Rdst", "Rcore", "RdeltaI"],
    sideEffects: [
      "increase candidate coherence",
      "shrink dispersion radius",
      "update core mask",
      "emit inwardness trace"
    ]
  },
  benchmarkProfile: {
    scenario: "Compare naive viable-set retention versus P_in-guided core consolidation.",
    baselineSystems: ["uniform_retention", "simple_reranking", "beam_search_postfilter"],
    metrics: [
      { name: "Dispersion", symbol: "D", meaning: "Spread of viable states before validation.", targetDirection: "lower" },
      { name: "Inwardness", symbol: "I", meaning: "Concentration and coherence inside core region.", targetDirection: "higher" },
      { name: "Validation Time", symbol: "T_v", meaning: "Time needed for downstream fixed-point validation.", targetDirection: "lower" },
      { name: "Task Validity", symbol: "V", meaning: "Fraction of outputs satisfying task constraints.", targetDirection: "higher" }
    ],
    expectedEffects: [
      "Lower dispersion than baseline retention.",
      "Higher inwardness before validation.",
      "Faster downstream validation."
    ]
  },
  safetyGuards: [
    {
      id: "guard.core_collapse_too_hard",
      condition: "dispersion drops too quickly while validity confidence falls",
      action: "relax densification strength",
      reason: "Avoid collapsing onto a false core."
    },
    {
      id: "guard.mode_mismatch",
      condition: "input space too sparse for clustering assumptions",
      action: "fallback to lighter reranking mode",
      reason: "Prevent invalid contraction dynamics."
    }
  ],
  deploymentNotes: {
    compilerView: "Schedule P_in after admissibility gating and before expensive validation logic.",
    runtimeView: "Track inwardness, dispersion, and core stability.",
    chipView: "Implement as a coherence-weighted contraction block after ECO.",
    observability: ["delta_inwardness", "dispersion_radius", "core_size", "validation_pass_rate"]
  },
  metadata: {
    language: "English",
    domain: "O.i / A.i",
    operatorRole: "core_consolidation_operator",
    visibility: "public-spec / private-implementation"
  }
};

export default P_in;
