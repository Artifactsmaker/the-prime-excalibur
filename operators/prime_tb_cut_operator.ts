/**
 * Prime-TB Cut Operator (ΩPTB)
 * Prime-Guided Topological-Boundary Decomposition
 *
 * Purpose
 * -------
 * Let E denote a structured entity:
 *
 *   - nuclide
 *   - element
 *   - isotope
 *   - spectral record
 *   - polyoxometalate cluster
 *   - gene sequence
 *   - protein sequence
 *   - biointerface
 *   - material structure
 *   - generic represented entity
 *
 * The operator ΩPTB performs a representational cut, not a physical cut.
 * It decomposes E into prime-readable layers by using:
 *
 *   - PGS(E): Prime Guide Signature
 *   - PAM: Prime Alignment Motif
 *   - TB(E): Topological Boundary Profile
 *
 * Core conceptual form
 * --------------------
 *   Ω_PTB(E) = Cut(E | PGS(E), TB(E), θ)
 *
 * Valid cut-site condition
 * ------------------------
 *   CutSite(E) = { x in E | PAM(x) = true and TB_score(x) >= θ }
 *
 * Analogy
 * -------
 * In CRISPR-Cas9, guide RNA directs Cas9 toward the DNA segment to cut.
 * In Prime-TB Cut, PGS(E) directs ΩPTB toward the identity boundary to cut.
 *
 * Notes
 * -----
 * This implementation is a reference operator for feature extraction,
 * layer decomposition, and operator-routing workflows.
 *
 * It should not be interpreted as:
 *   - a physical cutting process,
 *   - a biological enzyme,
 *   - a claim that prime numbers physically cause spectra, decay, or biology,
 *   - a canonical mathematical theory.
 */

export type EntityClass =
  | "nuclide"
  | "element"
  | "isotope"
  | "spectral_record"
  | "polyoxometalate"
  | "gene_sequence"
  | "protein_sequence"
  | "biointerface"
  | "material_structure"
  | "generic_entity";

export type BoundaryType =
  | "identity_boundary"
  | "shadow_boundary"
  | "spectral_boundary"
  | "cluster_boundary"
  | "biointerface_boundary"
  | "recomposition_boundary"
  | "functional_boundary"
  | "sequence_boundary"
  | "material_boundary"
  | "observation_boundary";

export type OutputLayer =
  | "prime_identity"
  | "topological_boundary"
  | "shadow_decomposition"
  | "spectral_signature"
  | "interface_geometry"
  | "recomposable_core";

export interface OperatorMetadata {
  id: string;
  symbol: string;
  name: string;
  shortName: string;
  category: string;
  version: string;
  status: string;
}

export const metadata: OperatorMetadata = {
  id: "omega_prime_tb_cut",
  symbol: "ΩPTB",
  name: "Prime-TB Cut Operator",
  shortName: "Prime-TB Cut",
  category: "prime_guided_topological_boundary_decomposition",
  version: "1.0",
  status: "conceptual_reference"
};

export interface PrimeFactorization {
  value: number;
  factors: number[];
  factorPowers: Record<string, number>;
  factorizationText: string;
  primeCount: number;
  distinctPrimeCount: number;
  factorEntropy: number;
  radical: number;
  isPrime: boolean;
  isPrimePower: boolean;
}

export interface PrimeGuideSignature {
  variables: Record<string, PrimeFactorization>;
  sharedPrimeFactors: Record<string, string[]>;
  motifLabels: string[];
  summaryScore: number;
}

export interface PrimeAlignmentMotif {
  id: string;
  label: string;
  description: string;
  variables: string[];
  strength: number;
  tags: string[];
}

export interface TopologicalBoundary {
  type: BoundaryType;
  score: number;
  description?: string;
}

export interface PrimeCutSite {
  motifId: string;
  boundaryType: BoundaryType;
  score: number;
  reason: string;
}

export interface DecomposedLayer {
  layer: OutputLayer;
  active: boolean;
  score: number;
  descriptor: string;
  evidence: string[];
}

export interface OmegaPrimeTBCutInput<T = unknown> {
  entity: T;
  entityClass: EntityClass;
  numericIdentity: Record<string, number>;
  topologicalBoundaries?: TopologicalBoundary[];
  metadata?: Record<string, unknown>;
}

export interface OmegaPrimeTBCutConfig {
  boundaryThreshold?: number;
  maxMotifs?: number;
  includeTrivialOne?: boolean;
  enabledLayers?: OutputLayer[];
}

export interface OmegaPrimeTBCutOutput<T = unknown> {
  entity: T;
  entityClass: EntityClass;
  primeGuideSignature: PrimeGuideSignature;
  primeAlignmentMotifs: PrimeAlignmentMotif[];
  topologicalBoundaries: TopologicalBoundary[];
  cutSites: PrimeCutSite[];
  decomposedLayers: DecomposedLayer[];
  recompositionNote: string;
  metadata: OperatorMetadata;
}

const DEFAULT_ENABLED_LAYERS: OutputLayer[] = [
  "prime_identity",
  "topological_boundary",
  "shadow_decomposition",
  "spectral_signature",
  "interface_geometry",
  "recomposable_core"
];

const DEFAULT_CONFIG: Required<OmegaPrimeTBCutConfig> = {
  boundaryThreshold: 0.5,
  maxMotifs: 32,
  includeTrivialOne: false,
  enabledLayers: DEFAULT_ENABLED_LAYERS
};

export function omegaPrimeTBCut<T = unknown>(
  input: OmegaPrimeTBCutInput<T>,
  config: OmegaPrimeTBCutConfig = {}
): OmegaPrimeTBCutOutput<T> {
  const resolvedConfig: Required<OmegaPrimeTBCutConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
    enabledLayers: config.enabledLayers ?? DEFAULT_ENABLED_LAYERS
  };

  const primeGuideSignature = extractPrimeGuideSignature(
    input.numericIdentity,
    resolvedConfig.includeTrivialOne
  );

  const primeAlignmentMotifs = detectPrimeAlignmentMotifs(
    primeGuideSignature,
    input.entityClass
  ).slice(0, resolvedConfig.maxMotifs);

  const topologicalBoundaries =
    input.topologicalBoundaries && input.topologicalBoundaries.length > 0
      ? input.topologicalBoundaries
      : inferTopologicalBoundaries(input.entityClass, primeAlignmentMotifs);

  const cutSites = selectPrimeCutSites(
    primeAlignmentMotifs,
    topologicalBoundaries,
    resolvedConfig.boundaryThreshold
  );

  const decomposedLayers = buildDecomposedLayers(
    input.entityClass,
    primeGuideSignature,
    primeAlignmentMotifs,
    topologicalBoundaries,
    cutSites,
    resolvedConfig.enabledLayers
  );

  return {
    entity: input.entity,
    entityClass: input.entityClass,
    primeGuideSignature,
    primeAlignmentMotifs,
    topologicalBoundaries,
    cutSites,
    decomposedLayers,
    recompositionNote: buildRecompositionNote(input.entityClass, cutSites),
    metadata
  };
}

export function extractPrimeGuideSignature(
  numericIdentity: Record<string, number>,
  includeTrivialOne = false
): PrimeGuideSignature {
  const variables: Record<string, PrimeFactorization> = {};

  for (const [key, rawValue] of Object.entries(numericIdentity)) {
    if (!Number.isFinite(rawValue)) {
      continue;
    }

    const value = Math.trunc(Math.abs(rawValue));

    if (value === 0 || (value === 1 && !includeTrivialOne)) {
      continue;
    }

    variables[key] = describePrimeFactorization(value);
  }

  const sharedPrimeFactors = computeSharedPrimeFactors(variables);
  const motifLabels = buildMotifLabels(variables, sharedPrimeFactors);

  const summaryScore = normalizeScore(
    motifLabels.length +
      Object.keys(sharedPrimeFactors).length +
      Object.values(variables).filter((v) => v.isPrime || v.isPrimePower).length
  );

  return {
    variables,
    sharedPrimeFactors,
    motifLabels,
    summaryScore
  };
}

export function describePrimeFactorization(value: number): PrimeFactorization {
  const factors = factorInteger(value);
  const factorPowers = toFactorPowers(factors);
  const distinctPrimeCount = Object.keys(factorPowers).length;
  const primeCount = factors.length;
  const radical = Object.keys(factorPowers).reduce(
    (product, prime) => product * Number(prime),
    1
  );

  return {
    value,
    factors,
    factorPowers,
    factorizationText: formatFactorization(value, factorPowers),
    primeCount,
    distinctPrimeCount,
    factorEntropy: computeFactorEntropy(factorPowers),
    radical,
    isPrime: isPrime(value),
    isPrimePower: isPrimePower(factorPowers)
  };
}

export function detectPrimeAlignmentMotifs(
  pgs: PrimeGuideSignature,
  entityClass: EntityClass
): PrimeAlignmentMotif[] {
  const motifs: PrimeAlignmentMotif[] = [];
  let index = 1;

  for (const [variable, descriptor] of Object.entries(pgs.variables)) {
    if (descriptor.isPrime) {
      motifs.push({
        id: `pam_${index++}`,
        label: `${variable}_prime_motif`,
        description: `${variable} is prime: ${descriptor.value}.`,
        variables: [variable],
        strength: 0.9,
        tags: ["prime_variable", entityClass]
      });
    }

    if (descriptor.isPrimePower && !descriptor.isPrime) {
      motifs.push({
        id: `pam_${index++}`,
        label: `${variable}_prime_power_motif`,
        description: `${variable} is a prime power: ${descriptor.factorizationText}.`,
        variables: [variable],
        strength: 0.85,
        tags: ["prime_power", entityClass]
      });
    }
  }

  for (const [prime, variables] of Object.entries(pgs.sharedPrimeFactors)) {
    if (variables.length >= 2) {
      motifs.push({
        id: `pam_${index++}`,
        label: `shared_prime_${prime}_motif`,
        description: `Prime factor ${prime} is shared across ${variables.join(", ")}.`,
        variables,
        strength: Math.min(1, 0.55 + 0.1 * variables.length),
        tags: ["prime_overlap", "shared_factor", entityClass]
      });
    }
  }

  const primeVariables = Object.entries(pgs.variables)
    .filter(([, descriptor]) => descriptor.isPrime)
    .map(([variable]) => variable);

  if (primeVariables.length >= 2) {
    motifs.push({
      id: `pam_${index++}`,
      label: "multi_prime_identity_motif",
      description: `Multiple identity variables are prime: ${primeVariables.join(", ")}.`,
      variables: primeVariables,
      strength: 0.95,
      tags: ["multi_prime_identity", entityClass]
    });
  }

  return motifs.sort((a, b) => b.strength - a.strength);
}

export function inferTopologicalBoundaries(
  entityClass: EntityClass,
  motifs: PrimeAlignmentMotif[]
): TopologicalBoundary[] {
  const baseScore = motifs.length > 0 ? 0.75 : 0.4;

  switch (entityClass) {
    case "nuclide":
    case "isotope":
      return [
        {
          type: "identity_boundary",
          score: baseScore,
          description: "Nuclear identity can be decomposed through Z, N, and A prime signatures."
        },
        {
          type: "shadow_boundary",
          score: Math.max(0.55, baseScore - 0.1),
          description: "Nuclear identity may be connected to relational or decay-shadow descriptors."
        },
        {
          type: "spectral_boundary",
          score: Math.max(0.5, baseScore - 0.15),
          description: "Element-level identity may be connected to spectral expression descriptors."
        }
      ];

    case "element":
    case "spectral_record":
      return [
        {
          type: "identity_boundary",
          score: baseScore,
          description: "Elemental identity can be decomposed through prime signatures."
        },
        {
          type: "spectral_boundary",
          score: Math.max(0.65, baseScore),
          description: "Elemental identity may be mapped to spectral expression."
        }
      ];

    case "polyoxometalate":
      return [
        {
          type: "identity_boundary",
          score: baseScore,
          description: "Elemental identities and atom counts can be decomposed through prime signatures."
        },
        {
          type: "cluster_boundary",
          score: Math.max(0.7, baseScore),
          description: "Single-element identities become a structured inorganic cluster."
        },
        {
          type: "biointerface_boundary",
          score: Math.max(0.6, baseScore - 0.05),
          description: "The charged inorganic cluster may become a biological interaction surface."
        }
      ];

    case "gene_sequence":
      return [
        {
          type: "sequence_boundary",
          score: baseScore,
          description: "Sequence length, motif positions, and codon blocks may form prime-readable boundaries."
        },
        {
          type: "functional_boundary",
          score: Math.max(0.55, baseScore - 0.1),
          description: "Sequence structure may be mapped to expression or function."
        }
      ];

    case "protein_sequence":
    case "biointerface":
      return [
        {
          type: "sequence_boundary",
          score: baseScore,
          description: "Residue counts and motif positions may form prime-readable sequence boundaries."
        },
        {
          type: "biointerface_boundary",
          score: Math.max(0.65, baseScore),
          description: "Charge patches, binding sites, or surface motifs may form interface boundaries."
        },
        {
          type: "functional_boundary",
          score: Math.max(0.55, baseScore - 0.1),
          description: "Structural motifs may be connected to functional behavior."
        }
      ];

    case "material_structure":
      return [
        {
          type: "material_boundary",
          score: baseScore,
          description: "Material structure may be decomposed through count, lattice, or cluster descriptors."
        },
        {
          type: "observation_boundary",
          score: Math.max(0.5, baseScore - 0.15),
          description: "Material structure may be mapped into observable or computational descriptors."
        }
      ];

    default:
      return [
        {
          type: "identity_boundary",
          score: baseScore,
          description: "Generic identity boundary inferred from prime-readable variables."
        },
        {
          type: "recomposition_boundary",
          score: Math.max(0.5, baseScore - 0.15),
          description: "Generic recomposition boundary inferred for atlas or operator workflows."
        }
      ];
  }
}

export function selectPrimeCutSites(
  motifs: PrimeAlignmentMotif[],
  boundaries: TopologicalBoundary[],
  boundaryThreshold: number
): PrimeCutSite[] {
  const eligibleBoundaries = boundaries.filter(
    (boundary) => boundary.score >= boundaryThreshold
  );

  const cutSites: PrimeCutSite[] = [];

  for (const motif of motifs) {
    for (const boundary of eligibleBoundaries) {
      const score = Number(
        ((motif.strength + boundary.score) / 2).toFixed(4)
      );

      cutSites.push({
        motifId: motif.id,
        boundaryType: boundary.type,
        score,
        reason: `${motif.label} aligns with ${boundary.type}.`
      });
    }
  }

  return cutSites.sort((a, b) => b.score - a.score);
}

export function buildDecomposedLayers(
  entityClass: EntityClass,
  pgs: PrimeGuideSignature,
  motifs: PrimeAlignmentMotif[],
  boundaries: TopologicalBoundary[],
  cutSites: PrimeCutSite[],
  enabledLayers: OutputLayer[]
): DecomposedLayer[] {
  const boundaryTypes = new Set(boundaries.map((boundary) => boundary.type));
  const evidence = motifs.map((motif) => motif.label);

  const layerCandidates: DecomposedLayer[] = [
    {
      layer: "prime_identity",
      active: pgs.summaryScore > 0,
      score: pgs.summaryScore,
      descriptor: "Prime identity layer extracted from numeric identity variables.",
      evidence: Object.entries(pgs.variables).map(
        ([key, value]) => `${key}: ${value.factorizationText}`
      )
    },
    {
      layer: "topological_boundary",
      active: boundaries.length > 0,
      score: normalizeScore(boundaries.reduce((sum, item) => sum + item.score, 0)),
      descriptor: "Topological boundary profile inferred or supplied for the entity.",
      evidence: boundaries.map((boundary) => `${boundary.type}: ${boundary.score}`)
    },
    {
      layer: "shadow_decomposition",
      active: boundaryTypes.has("shadow_boundary"),
      score: boundaryTypes.has("shadow_boundary") ? 0.7 : 0,
      descriptor: "Relational or decay-shadow decomposition layer.",
      evidence
    },
    {
      layer: "spectral_signature",
      active:
        boundaryTypes.has("spectral_boundary") ||
        entityClass === "spectral_record",
      score:
        boundaryTypes.has("spectral_boundary") ||
        entityClass === "spectral_record"
          ? 0.75
          : 0,
      descriptor: "Spectral expression or lightprint layer.",
      evidence
    },
    {
      layer: "interface_geometry",
      active:
        boundaryTypes.has("cluster_boundary") ||
        boundaryTypes.has("biointerface_boundary") ||
        entityClass === "polyoxometalate" ||
        entityClass === "biointerface",
      score:
        boundaryTypes.has("biointerface_boundary") ||
        entityClass === "polyoxometalate" ||
        entityClass === "biointerface"
          ? 0.8
          : 0,
      descriptor: "Interface geometry layer for cluster, material, or biological interaction surfaces.",
      evidence
    },
    {
      layer: "recomposable_core",
      active: cutSites.length > 0,
      score: normalizeScore(cutSites.length),
      descriptor: "Recomposition-ready core for atlas, benchmark, routing, or XAI workflows.",
      evidence: cutSites.map((site) => `${site.motifId}:${site.boundaryType}`)
    }
  ];

  return layerCandidates.filter((layer) => enabledLayers.includes(layer.layer));
}

export function buildRecompositionNote(
  entityClass: EntityClass,
  cutSites: PrimeCutSite[]
): string {
  if (cutSites.length === 0) {
    return `No valid Prime-TB cut site was found for entity class ${entityClass}.`;
  }

  return [
    `Prime-TB Cut produced ${cutSites.length} cut site(s) for entity class ${entityClass}.`,
    "The decomposed layers can be routed into atlas construction, descriptor engineering, XAI, or Operator Intelligence workflows."
  ].join(" ");
}

export function factorInteger(value: number): number[] {
  const n = Math.trunc(Math.abs(value));

  if (n < 2) {
    return [];
  }

  const factors: number[] = [];
  let remainder = n;

  while (remainder % 2 === 0) {
    factors.push(2);
    remainder = remainder / 2;
  }

  let divisor = 3;
  while (divisor * divisor <= remainder) {
    while (remainder % divisor === 0) {
      factors.push(divisor);
      remainder = remainder / divisor;
    }
    divisor += 2;
  }

  if (remainder > 1) {
    factors.push(remainder);
  }

  return factors;
}

export function isPrime(value: number): boolean {
  return value >= 2 && factorInteger(value).length === 1;
}

export function toFactorPowers(factors: number[]): Record<string, number> {
  return factors.reduce<Record<string, number>>((accumulator, factor) => {
    const key = String(factor);
    accumulator[key] = (accumulator[key] ?? 0) + 1;
    return accumulator;
  }, {});
}

export function isPrimePower(factorPowers: Record<string, number>): boolean {
  return Object.keys(factorPowers).length === 1;
}

export function formatFactorization(
  value: number,
  factorPowers: Record<string, number>
): string {
  const entries = Object.entries(factorPowers);

  if (value < 2) {
    return String(value);
  }

  if (entries.length === 0) {
    return String(value);
  }

  return entries
    .map(([prime, power]) => (power === 1 ? prime : `${prime}^${power}`))
    .join(" × ");
}

export function computeFactorEntropy(
  factorPowers: Record<string, number>
): number {
  const powers = Object.values(factorPowers);
  const total = powers.reduce((sum, power) => sum + power, 0);

  if (total === 0) {
    return 0;
  }

  return Number(
    powers
      .reduce((entropy, power) => {
        const p = power / total;
        return entropy - p * Math.log2(p);
      }, 0)
      .toFixed(6)
  );
}

export function computeSharedPrimeFactors(
  variables: Record<string, PrimeFactorization>
): Record<string, string[]> {
  const shared: Record<string, string[]> = {};

  for (const [variable, descriptor] of Object.entries(variables)) {
    for (const prime of Object.keys(descriptor.factorPowers)) {
      if (!shared[prime]) {
        shared[prime] = [];
      }
      shared[prime].push(variable);
    }
  }

  return Object.fromEntries(
    Object.entries(shared).filter(([, variableNames]) => variableNames.length >= 2)
  );
}

export function buildMotifLabels(
  variables: Record<string, PrimeFactorization>,
  sharedPrimeFactors: Record<string, string[]>
): string[] {
  const labels: string[] = [];

  for (const [variable, descriptor] of Object.entries(variables)) {
    if (descriptor.isPrime) {
      labels.push(`${variable}:prime`);
    }

    if (descriptor.isPrimePower && !descriptor.isPrime) {
      labels.push(`${variable}:prime_power`);
    }
  }

  for (const [prime, variableNames] of Object.entries(sharedPrimeFactors)) {
    labels.push(`shared_prime_${prime}:${variableNames.join("|")}`);
  }

  return labels;
}

export function normalizeScore(value: number): number {
  return Number((value / (1 + value)).toFixed(4));
}

/**
 * Convenience example: Te-128
 */
export const exampleTe128 = omegaPrimeTBCut({
  entity: "Te-128",
  entityClass: "nuclide",
  numericIdentity: {
    Z: 52,
    N: 76,
    A: 128
  }
});

/**
 * Convenience example: Keggin-type POM [PW12O40]3-
 */
export const exampleKegginPOM = omegaPrimeTBCut({
  entity: "[PW12O40]3-",
  entityClass: "polyoxometalate",
  numericIdentity: {
    P_Z: 15,
    W_Z: 74,
    W_count: 12,
    O_Z: 8,
    O_count: 40,
    charge_magnitude: 3
  }
});
