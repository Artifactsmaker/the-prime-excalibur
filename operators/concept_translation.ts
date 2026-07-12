// concept_translation.ts
// Operator-Intelligence Concept Translator (legacy → clearer terms)
// Unicode-first; no LaTeX. Designed for training/normalization pipelines.

export type TranslationWarningCode =
  | "AMBIGUOUS_GEOMETRY_VS_INVARIANCE"
  | "HEIGHT0_NOT_EASY"
  | "NO_MATCH";

export interface TranslationWarning {
  code: TranslationWarningCode;
  message: string;
  span?: { start: number; end: number };
}

export interface TranslateResult {
  text: string;
  warnings: TranslationWarning[];
  hits: string[]; // concept ids matched
}

// --- Core dictionary (kept small; prefer JSON spec for expansion) ---

const SYM_INV_001 = {
  id: "SYM_INV_001",
  // strict: invariance under admissible transformations
  symmetryRegex: /\bSymmetry\b|\bsymmetry\b/g,
  // geometry signals
  geometrySignals: [
    "mirror", "reflection", "axis", "rotational", "polygon", "shape", "pattern",
    "hình học", "trục", "gương", "đa giác"
  ],
  replaceLower: "invariance (bất biến)",
  replaceUpper: "Invariance (bất biến)"
};

const H0_BASE_001 = {
  id: "H0_BASE_001",
  height0Regex: /\b(Brauer\s+)?height\s*=\s*0\b/g,
  h0Regex: /\b[hH]\s*=\s*0\b/g,
  replacement: "height = 0 (irreducible base layer / tầng nền bất khả phân rã)"
};

function containsAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase();
  return needles.some(n => lower.includes(n.toLowerCase()));
}

function addWarning(warnings: TranslationWarning[], code: TranslationWarningCode, message: string) {
  warnings.push({ code, message });
}

// --- Public API ---

/**
 * Normalize aliases and spacing (lightweight, safe).
 */
export function normalize(text: string): string {
  // unify common spacing around '='
  return text
    .replace(/\bheight\s*=\s*0\b/gi, "height = 0")
    .replace(/\bBrauer\s+height\s*=\s*0\b/gi, "Brauer height = 0");
}

/**
 * Translate legacy terms into clearer terms while preserving strict meaning.
 * If ambiguity is detected (geometry vs invariance), we warn and keep the phrase as geometric symmetry.
 */
export function translate(text: string): TranslateResult {
  let out = normalize(text);
  const warnings: TranslationWarning[] = [];
  const hits: string[] = [];

  // --- Handle symmetry ---
  const hasSymmetry = SYM_INV_001.symmetryRegex.test(out);
  // reset lastIndex because of global regex test
  SYM_INV_001.symmetryRegex.lastIndex = 0;

  if (hasSymmetry) {
    // If geometry context signals are present, do NOT force invariance.
    if (containsAny(out, SYM_INV_001.geometrySignals)) {
      out = out.replace(/\bSymmetry\b|\bsymmetry\b/g, "geometric symmetry");
      addWarning(
        warnings,
        "AMBIGUOUS_GEOMETRY_VS_INVARIANCE",
        "Detected geometry context; kept as 'geometric symmetry' to avoid wrong mapping to invariance (bất biến)."
      );
      hits.push(SYM_INV_001.id);
    } else {
      // map Symmetry/symmetry to invariance
      out = out.replace(/\bSymmetry\b/g, SYM_INV_001.replaceUpper);
      out = out.replace(/\bsymmetry\b/g, SYM_INV_001.replaceLower);
      hits.push(SYM_INV_001.id);
    }
  }

  // --- Handle height = 0 ---
  const beforeH0 = out;
  out = out.replace(H0_BASE_001.height0Regex, H0_BASE_001.replacement);
  out = out.replace(H0_BASE_001.h0Regex, "h = 0 (irreducible base layer / tầng nền bất khả phân rã)");
  if (out !== beforeH0) {
    hits.push(H0_BASE_001.id);
    // misconception check
    if (/(\beasy\b|\bsimple\b|\btrivial\b|\bdễ\b)/i.test(text) && /(height\s*=\s*0|h\s*=\s*0)/i.test(text)) {
      addWarning(
        warnings,
        "HEIGHT0_NOT_EASY",
        "Height=0 does not mean 'easy'; it means irreducible base layer (no further valid decomposition remains)."
      );
    }
  }

  if (hits.length === 0) {
    addWarning(warnings, "NO_MATCH", "No legacy concepts matched for translation.");
  }

  return { text: out, warnings, hits };
}

/**
 * Explain a concept in strict/plain form (compact).
 */
export function explain(concept: "symmetry" | "height=0") {
  if (concept === "symmetry") {
    return {
      legacy: "symmetry",
      target: "invariance (bất biến)",
      strict:
        "Unchanged under a specified set/group of admissible transformations.",
      plain:
        "Dù đổi cách nhìn/biểu diễn (hợp lệ), luật nền vẫn giữ nguyên.",
      caution:
        "If the context is purely geometric (mirror/axis/shape), keep 'geometric symmetry'."
    };
  }
  return {
    legacy: "height = 0",
    target: "irreducible base layer / tầng nền bất khả phân rã",
    strict:
      "No further meaningful decomposition exists; additional splitting yields no simpler valid structure.",
    plain:
      "Không thể chia nhỏ thêm mà vẫn giữ ý nghĩa; phần còn lại là nền.",
    caution:
      "Not synonymous with 'easy'—it means 'no remaining reducible structure'."
  };
}

/**
 * Minimal self-test suite (string containment checks).
 */
export function runSelfTests(): { passed: number; failed: number; failures: string[] } {
  const failures: string[] = [];
  let passed = 0;

  // Test 1: physics symmetry → invariance
  {
    const r = translate("symmetry of the Hamiltonian under rotations");
    if (r.text.includes("invariance") && r.text.includes("bất biến")) passed++;
    else failures.push("Test1 failed: symmetry → invariance mapping");
  }

  // Test 2: geometric symmetry should not force invariance
  {
    const r = translate("mirror symmetry in a polygon");
    if (r.text.includes("geometric symmetry") && !r.text.includes("bất biến)")) passed++;
    else failures.push("Test2 failed: geometric context disambiguation");
  }

  // Test 3: height=0 mapping
  {
    const r = translate("height=0 is the base");
    if (r.text.includes("irreducible base layer") && r.text.includes("tầng nền")) passed++;
    else failures.push("Test3 failed: height=0 mapping");
  }

  const failed = failures.length;
  return { passed, failed, failures };
}
