// validCutOperatorSystem.ts
// Runtime tối thiểu cho "Valid-Cut Operator System" (spec-driven).
// Mục tiêu: app đọc spec (JSON) -> dựng UI block (objective/entities/constraints) -> sinh cycle formula/diagram.

export type OiEntity = { name: string; symbol: string };
export type OiConstraint = { id: string; priority: string; description_vi: string };

export type OperatorCore = {
  id: "E" | "K" | "C" | "D";
  name: string;
  name_vi: string;
  signature: string;
  role_vi: string;
  properties?: string[];
  prototypes?: string[];
};

export type ValidCutSpec = {
  id: string;
  version: string;
  type: "operator_system";
  title: string;
  title_vi: string;
  summary_vi: string;
  canonical_notation: Record<string, string>;
  operators: OperatorCore[];
  cycles: {
    state_cycle: { latex: string; meaning_vi: string };
    space_cycle: { latex: string; meaning_vi: string };
    full_cycle: { latex: string; meaning_vi: string };
    termination_decomposition: { latex: string; meaning_vi: string };
  };
  height_model: {
    height_function: { latex: string; meaning_vi: string };
    ground_condition: { latex: string; meaning_vi: string };
    height_reducing_condition: { latex: string; meaning_vi: string };
    strict_descent: { latex: string; meaning_vi: string };
    clean_decomposition: { latex: string; meaning_vi: string };
  };
  ui_hints?: {
    objective_display?: string;
    default_entities?: OiEntity[];
    default_constraints?: OiConstraint[];
  };
  normalized_definition?: {
    boxed_latex: string;
    meaning_vi: string;
  };
};

// 1) Load spec JSON (tuỳ bundler, bạn có thể import thẳng JSON như dưới)
// import spec from "./operators/ValidCutOperatorSystem.json";
//
// Ở đây để generic: bạn truyền spec vào các hàm.

export type OiIntermediateBlock = {
  objective: string;
  entities: OiEntity[];
  constraints: Array<{ id: string; priority: string; text_vi: string }>;
  operatorTokens: Array<{ id: string; label: string }>;
  formulas: {
    full_cycle_latex: string;
    boxed_system_latex?: string;
    height_ground_latex: string;
  };
  diagram: {
    mermaid: string;
  };
};

export function toOiIntermediate(spec: ValidCutSpec): OiIntermediateBlock {
  const objective =
    spec.ui_hints?.objective_display ?? "VALIDATE -> Validity_of_Evolution (Valid-Cut)";

  const entities =
    spec.ui_hints?.default_entities ??
    [
      { name: "State", symbol: "S" },
      { name: "Constraints/Context", symbol: "C" },
      { name: "Possibility_Space", symbol: "Ω" },
      { name: "Identity_Kernel", symbol: "I(S)" },
      { name: "Height/Obstruction", symbol: "h" },
      { name: "Cut_Certificate", symbol: "Φ" }
    ];

  const constraints =
    spec.ui_hints?.default_constraints?.map(c => ({
      id: c.id,
      priority: c.priority,
      text_vi: c.description_vi
    })) ??
    [];

  const operatorTokens = spec.operators.map(op => ({
    id: op.id,
    label: `${op.name_vi} (${op.id})`
  }));

  const boxed = spec.normalized_definition?.boxed_latex;
  const fullCycle = spec.cycles.full_cycle.latex;
  const hGround = spec.height_model.ground_condition.latex;

  return {
    objective,
    entities,
    constraints,
    operatorTokens,
    formulas: {
      full_cycle_latex: fullCycle,
      boxed_system_latex: boxed,
      height_ground_latex: hGround
    },
    diagram: {
      mermaid: buildMermaidValidCutCycle()
    }
  };
}

export function buildMermaidValidCutCycle(): string {
  // Mermaid flowchart: domain cut -> validity filter -> evolution -> membership check -> (repeat) -> decomposition
  return `
flowchart TD
  A[\\u03A9_t: Possibility Space] -->|C(\\u03A9_t, \\u03A6_t)| B[\\u03A9_{t+1}]
  S[State S_t] -->|K(S_t, C)| K[Valid State \\u0160]
  K -->|E(\\u0160, C)| E[S_{t+1}]
  E -->|Check: S_{t+1} \\u2208 \\u03A9_{t+1}| M{Membership}
  M -->|Yes| R[Continue Cycle]
  M -->|No| X[Adjust Cut Certificate \\u03A6_t or Constraints C]
  R -->|When stable / h \\u2192 0| D[Decompose: D(S_T) = \\u2295 B_i]
`.trim();
}

// Optional: một "runner" rất nhẹ để bạn gắn vào app (không tính toán số học).
// Nếu sau này bạn có engine height h thật, bạn sẽ thay phần evaluate này.
export type CycleEvalInput = {
  hasCutCertificate: boolean;
  isKernelPreserved: boolean;
  membershipOk: boolean;
  height?: number;
};

export type CycleEvalResult = {
  valid: boolean;
  reasons: string[];
  next: "continue" | "revise_constraints" | "revise_cut" | "decompose";
};

export function evaluateValidCutCycle(input: CycleEvalInput): CycleEvalResult {
  const reasons: string[] = [];

  if (!input.hasCutCertificate) reasons.push("Thiếu cut certificate Φ_t để cập nhật Ω.");
  if (!input.isKernelPreserved) reasons.push("Kernel/I(S) không được bảo toàn sau K.");
  if (!input.membershipOk) reasons.push("S_{t+1} không thuộc Ω_{t+1} sau cut.");

  const h = input.height;
  const heightAtGround = typeof h === "number" && h <= 0;

  const valid = reasons.length === 0;

  if (!valid) {
    // ưu tiên sửa theo nguyên nhân
    if (!input.hasCutCertificate) return { valid: false, reasons, next: "revise_cut" };
    if (!input.isKernelPreserved) return { valid: false, reasons, next: "revise_constraints" };
    if (!input.membershipOk) return { valid: false, reasons, next: "revise_cut" };
    return { valid: false, reasons, next: "revise_constraints" };
  }

  if (heightAtGround) {
    return { valid: true, reasons: ["h(S*) = 0: đủ điều kiện phân rã sạch."], next: "decompose" };
  }

  return { valid: true, reasons: ["Chu trình hợp lệ: tiếp tục tiến hóa và cắt miền."], next: "continue" };
}
